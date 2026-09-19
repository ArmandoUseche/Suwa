/*
  SUWA - Firmware Paso 9: host del backend configurable + portable
  -------------------------------------------------------------------
  Qué cambia respecto al Paso 8:

  1. La IP del backend (SERVER_HOST) ya NO está fija en el código.
     Antes, cambiar de red significaba reflashear la placa para
     actualizar esa IP -- ahora se configura desde el mismo portal
     web que ya existía para el WiFi (SUWA-Config), en un campo nuevo
     junto a SSID/contraseña, y se guarda en EEPROM igual que ellos.

  2. Se QUITÓ la IP fija del Arduino que se agregó en el Paso 8. Esa
     IP fija (192.168.101.50) era una solución puntual para el router
     de "PISO 2", que no completaba el DHCP -- pero asume una subred
     específica (192.168.101.x) y rompe apenas cambias de red (por
     ejemplo, a un hotspot de celular, que usa otra subred). Un
     hotspot normal sí entrega DHCP bien, así que no hace falta.

     (Nota: se intentó "resetear a DHCP" con WiFi.config a puro
     0.0.0.0, pensando que era la señal para descartar cualquier IP
     fija -- resultó ser incorrecto, esa llamada pone literalmente
     0.0.0.0 como IP fija, rompiendo la conexión. Se quitó del todo:
     sin llamar a WiFi.config(), WiFi.begin() hace DHCP normal solo,
     como en el Paso 7.)

  3. Se corrigió la espera de conexión: antes solo se esperaba a que
     WiFi.status() marcara WL_CONNECTED, pero con el hotspot probado
     ese estado cambia antes de que el DHCP termine de asignar IP real
     -- por eso a veces se veía "Conectado. IP: 0.0.0.0". Ahora también
     se espera a que la IP deje de ser 0.0.0.0, con más margen de
     tiempo (20s en vez de 15s).

  Con estos cambios, cambiar de red (casa, hotspot, red de la
  universidad) es: escribir BORRAR por Serial, conectarse a
  SUWA-Config desde el celular, y llenar el formulario con la red
  nueva y la IP de la laptop en esa red -- sin Arduino IDE, sin
  reflashear.

  Todo lo demás (sensores, riego, umbral dinámico, diagnóstico) es
  igual al Paso 8.
*/

#include <EEPROM.h>
#include <WiFiS3.h>
#include <IPAddress.h>
#include <ArduinoJson.h>
#include <DHT_U.h>
#include <DHT.h>

// ---- Backend ----
// Este es el valor por defecto para el hotspot actual. Si luego cambia la
// red, el host puede seguir configurándose desde el portal SUWA-Config.
const char* HOST_BACKEND_POR_DEFECTO = "10.238.0.16";
String servidorHost = HOST_BACKEND_POR_DEFECTO;
const int SERVER_PORT = 3000;
const char* DISPOSITIVO_ID = "suwa-kit-01";

// ---- Sensores ----
#define DHT11_PIN 8
const int TRIG = 9;
const int ECO = 10;
const int LED = 11;
const int PIN_BOMBA = 7;
const int PIN_HUMEDAD_SUELO = A0;
const int CRUDO_SECO = 1023;
const int CRUDO_HUMEDO = 450;

// Umbral de humedad (%) por debajo del cual se activa el riego
// automático. Ya NO es fijo -- arranca en 30% (mismo default que el
// modelo Planta en Mongo) y se actualiza solo desde el backend en
// consultarUmbralPlanta(), sin necesitar reflashear la placa.
int umbralHumedadMinimo = 30;

DHT dht(DHT11_PIN, DHT11);
WiFiClient client;

// ---- Temporizadores ----
unsigned long ultimoEnvioLecturas = 0;
const unsigned long INTERVALO_ENVIO_LECTURAS = 5000;
unsigned long ultimaConsultaRiego = 0;
const unsigned long INTERVALO_CONSULTA_RIEGO = 3000;
unsigned long ultimoChequeoWiFi = 0;
const unsigned long INTERVALO_CHEQUEO_WIFI = 5000;
unsigned long ultimoResumenSalud = 0;
const unsigned long INTERVALO_RESUMEN_SALUD = 60000;
unsigned long ultimaConsultaUmbral = 0;
// 30s: el umbral de una planta no cambia seguido (el usuario lo edita
// a mano desde ConfigurarUmbralesScreen), así que no hace falta
// consultarlo tan seguido como el riego manual pendiente.
const unsigned long INTERVALO_CONSULTA_UMBRAL = 30000;

// ---- Estado del riego automático ----
bool riegoAutomaticoActivo = false;
unsigned long inicioRiegoAutomatico = 0;
int humedadAlIniciarRiego = 0;
int ultimaHumedadSueloPorcentaje = 0;

// ---- Diagnóstico ----
int erroresWifi = 0;
int erroresSensor = 0;
int erroresBackend = 0;
int erroresJson = 0;
char ultimoErrorEtapa[32] = "ninguno";
char ultimoErrorDetalle[64] = "";

// =================================================================
// APROVISIONAMIENTO DE WiFi (EEPROM + modo AP)
// =================================================================

const int EEPROM_MARCA_ADDR = 0;
const byte MARCA_CREDENCIALES_VALIDAS = 0xAA;
const int EEPROM_SSID_LEN_ADDR = 1;
const int EEPROM_SSID_ADDR = 2;
const int EEPROM_PASS_LEN_ADDR = 34;
const int EEPROM_PASS_ADDR = 35;

// Guardado del host del backend, en un bloque separado del de
// SSID/pass (con su propia marca de "válido") -- así una placa que
// ya tenía WiFi guardado desde el Paso 7/8 no se confunde: si el
// host nunca se guardó, simplemente se usa el valor por defecto de
// fábrica (servidorHost, declarado arriba) en vez de leer basura.
const int EEPROM_HOST_MARCA_ADDR = 98;
// Invalida el host antiguo guardado en EEPROM al instalar este firmware.
// Las credenciales WiFi no se borran.
const byte MARCA_HOST_VALIDO = 0xBC;
const int EEPROM_HOST_LEN_ADDR = 99;
const int EEPROM_HOST_ADDR = 100;

bool hayCredencialesGuardadas() {
  return EEPROM.read(EEPROM_MARCA_ADDR) == MARCA_CREDENCIALES_VALIDAS;
}

void guardarCredenciales(const String& ssid, const String& pass) {
  Serial.print("Guardando -> SSID: [");
  Serial.print(ssid);
  Serial.println("]");
  Serial.print("Guardando -> Pass: [");
  Serial.print(pass);
  Serial.println("]");

  EEPROM.write(EEPROM_SSID_LEN_ADDR, ssid.length());
  for (unsigned int i = 0; i < ssid.length(); i++) {
    EEPROM.write(EEPROM_SSID_ADDR + i, ssid[i]);
  }

  EEPROM.write(EEPROM_PASS_LEN_ADDR, pass.length());
  for (unsigned int i = 0; i < pass.length(); i++) {
    EEPROM.write(EEPROM_PASS_ADDR + i, pass[i]);
  }

  EEPROM.write(EEPROM_MARCA_ADDR, MARCA_CREDENCIALES_VALIDAS);
}

void leerCredenciales(String& ssid, String& pass) {
  byte largoSsid = EEPROM.read(EEPROM_SSID_LEN_ADDR);
  ssid = "";
  for (int i = 0; i < largoSsid; i++) {
    ssid += (char)EEPROM.read(EEPROM_SSID_ADDR + i);
  }

  byte largoPass = EEPROM.read(EEPROM_PASS_LEN_ADDR);
  pass = "";
  for (int i = 0; i < largoPass; i++) {
    pass += (char)EEPROM.read(EEPROM_PASS_ADDR + i);
  }
}

void borrarCredenciales() {
  EEPROM.write(EEPROM_MARCA_ADDR, 0x00);
  EEPROM.write(EEPROM_HOST_MARCA_ADDR, 0x00);
}

bool hayHostGuardado() {
  return EEPROM.read(EEPROM_HOST_MARCA_ADDR) == MARCA_HOST_VALIDO;
}

void guardarHost(const String& host) {
  Serial.print("Guardando -> Host del backend: [");
  Serial.print(host);
  Serial.println("]");

  EEPROM.write(EEPROM_HOST_LEN_ADDR, host.length());
  for (unsigned int i = 0; i < host.length(); i++) {
    EEPROM.write(EEPROM_HOST_ADDR + i, host[i]);
  }

  EEPROM.write(EEPROM_HOST_MARCA_ADDR, MARCA_HOST_VALIDO);
}

void leerHost(String& host) {
  byte largoHost = EEPROM.read(EEPROM_HOST_LEN_ADDR);
  host = "";
  for (int i = 0; i < largoHost; i++) {
    host += (char)EEPROM.read(EEPROM_HOST_ADDR + i);
  }
}

// Se llama una vez en setup(), antes de necesitar hablarle al
// backend. Si nunca se guardó un host desde el portal, se queda con
// el valor por defecto de fábrica (servidorHost ya viene inicializado
// arriba) -- no rompe placas que solo tienen WiFi guardado del Paso 8.
void cargarHostGuardadoSiExiste() {
  if (hayHostGuardado()) {
    leerHost(servidorHost);
    if (servidorHost.length() == 0) {
      servidorHost = HOST_BACKEND_POR_DEFECTO;
    }
  }
  Serial.print("Host del backend en uso: ");
  Serial.println(servidorHost);
}

bool conectarConCredencialesGuardadas() {
  if (!hayCredencialesGuardadas()) {
    return false;
  }

  String ssid, pass;
  leerCredenciales(ssid, pass);

  Serial.print("Leído de EEPROM -> SSID: [");
  Serial.print(ssid);
  Serial.println("]");
  Serial.print("Leído de EEPROM -> Pass: [");
  Serial.print(pass);
  Serial.println("]");
  Serial.print("Conectando");

  WiFi.begin(ssid.c_str(), pass.c_str());
  unsigned long inicio = millis();
  // No basta con WL_CONNECTED: con este hotspot específico, el estado
  // cambia a "conectado" antes de que el DHCP termine de asignar IP
  // real -- por eso a veces se veía "Conectado. IP: 0.0.0.0". Se
  // espera también a que la IP deje de ser 0.0.0.0, con más margen
  // de tiempo (20s) por si el DHCP de este hotspot es más lento.
  while ((WiFi.status() != WL_CONNECTED || WiFi.localIP() == IPAddress(0, 0, 0, 0))
         && millis() - inicio < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  return WiFi.status() == WL_CONNECTED && WiFi.localIP() != IPAddress(0, 0, 0, 0);
}

String urlDecode(const String& texto) {
  String resultado = "";
  for (unsigned int i = 0; i < texto.length(); i++) {
    char c = texto[i];
    if (c == '+') {
      resultado += ' ';
    } else if (c == '%' && i + 2 < texto.length()) {
      String hex = texto.substring(i + 1, i + 3);
      resultado += (char)strtol(hex.c_str(), NULL, 16);
      i += 2;
    } else {
      resultado += c;
    }
  }
  return resultado;
}

String obtenerValorDeQuery(const String& query, const String& clave) {
  String buscar = clave + "=";
  int inicio = query.indexOf(buscar);
  if (inicio == -1) return "";

  inicio += buscar.length();

  // El valor termina en el primer '&' (siguiente parámetro) O en el
  // primer espacio (fin de la URL, empieza " HTTP/1.1") — lo que
  // venga primero. Antes solo revisaba '&', por eso el último
  // parámetro se comía el resto de la línea HTTP.
  int finAmpersand = query.indexOf('&', inicio);
  int finEspacio = query.indexOf(' ', inicio);

  int fin;
  if (finAmpersand == -1 && finEspacio == -1) {
    fin = query.length();
  } else if (finAmpersand == -1) {
    fin = finEspacio;
  } else if (finEspacio == -1) {
    fin = finAmpersand;
  } else {
    fin = min(finAmpersand, finEspacio);
  }

  return urlDecode(query.substring(inicio, fin));
}

const char* PAGINA_CONFIGURACION =
  "<!DOCTYPE html><html><head><meta charset='utf-8'>"
  "<title>Configurar SUWA</title>"
  "<meta name='viewport' content='width=device-width, initial-scale=1'>"
  "<style>body{font-family:sans-serif;padding:24px;background:#EAF7EC;}"
  "h1{color:#129C52;} input{width:100%;padding:10px;margin:8px 0;"
  "box-sizing:border-box;} button{background:#129C52;color:white;"
  "border:none;padding:12px;width:100%;border-radius:8px;}"
  "small{color:#555;}</style>"
  "</head><body>"
  "<h1>Conectar SUWA a tu WiFi</h1>"
  "<form action='/guardar'>"
  "<label>Nombre de la red (SSID)</label>"
  "<input name='ssid' required>"
  "<label>Contraseña</label>"
  "<input name='pass' type='password'>"
  "<label>IP del backend en esta red</label>"
  "<input name='host' placeholder='ej: 192.168.43.5' required>"
  "<small>Es la IP de la laptop corriendo el backend, dentro de esta "
  "misma red WiFi (revisa con ipconfig/ifconfig).</small>"
  "<button type='submit'>Conectar</button>"
  "</form></body></html>";

void iniciarModoConfiguracion() {
  Serial.println("=== Entrando en modo de configuración de WiFi ===");

  WiFi.beginAP("SUWA-Config");
  delay(1000);

  Serial.println("Red temporal creada: SUWA-Config");
  Serial.print("Conéctate a ella desde tu celular y abre: http://");
  Serial.println(WiFi.localIP());

  WiFiServer servidorConfig(80);
  servidorConfig.begin();

  while (true) {
    WiFiClient cliente = servidorConfig.available();
    if (!cliente) {
      continue;
    }

    String peticion = cliente.readStringUntil('\r');
    cliente.readStringUntil('\n');

    if (peticion.indexOf("GET /guardar") != -1) {
      String ssid = obtenerValorDeQuery(peticion, "ssid");
      String pass = obtenerValorDeQuery(peticion, "pass");
      String host = obtenerValorDeQuery(peticion, "host");

      guardarCredenciales(ssid, pass);
      guardarHost(host);

      cliente.println("HTTP/1.1 200 OK");
      cliente.println("Content-Type: text/html");
      cliente.println();
      cliente.println("<html><body style='font-family:sans-serif;padding:24px'>"
                       "<h1>Guardado</h1><p>SUWA se está reiniciando y "
                       "conectando a tu red. Puedes cerrar esta página.</p>"
                       "</body></html>");
      cliente.stop();

      delay(1000);
      NVIC_SystemReset();
    } else {
      cliente.println("HTTP/1.1 200 OK");
      cliente.println("Content-Type: text/html");
      cliente.println();
      cliente.println(PAGINA_CONFIGURACION);
      cliente.stop();
    }
  }
}

void revisarComandoDeBorrado() {
  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();
    if (comando == "BORRAR") {
      Serial.println("Borrando red guardada y reiniciando...");
      borrarCredenciales();
      delay(500);
      NVIC_SystemReset();
    }
  }
}

// =================================================================
// setup() / loop()
// =================================================================

void setup() {
  Serial.begin(9600);
  delay(2000);
  Serial.println("=== SUWA firmware Paso 9 iniciando ===");
  Serial.println("(Escribe BORRAR y Enter en cualquier momento para reconfigurar el WiFi)");

  pinMode(TRIG, OUTPUT);
  pinMode(ECO, INPUT);
  pinMode(LED, OUTPUT);
  pinMode(PIN_HUMEDAD_SUELO, INPUT);
  pinMode(PIN_BOMBA, OUTPUT);
  digitalWrite(PIN_BOMBA, HIGH);
  dht.begin();

  cargarHostGuardadoSiExiste();

  if (!conectarConCredencialesGuardadas()) {
    iniciarModoConfiguracion();
  }

  Serial.print("Conectado. IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Máscara de subred: ");
  Serial.println(WiFi.subnetMask());
  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());

  // Primera consulta de umbral al arrancar, en vez de esperar los
  // primeros 30s con el valor por defecto sin necesidad.
  consultarUmbralPlanta();
}

void loop() {
  unsigned long ahora = millis();

  revisarComandoDeBorrado();

  if (ahora - ultimoChequeoWiFi >= INTERVALO_CHEQUEO_WIFI) {
    ultimoChequeoWiFi = ahora;
    asegurarConexionWiFi();
  }

  if (ahora - ultimoResumenSalud >= INTERVALO_RESUMEN_SALUD) {
    ultimoResumenSalud = ahora;
    imprimirResumenDeSalud();
  }

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  if (ahora - ultimoEnvioLecturas >= INTERVALO_ENVIO_LECTURAS) {
    ultimoEnvioLecturas = ahora;
    cicloDeSensoresYRiegoAutomatico();
  }

  if (ahora - ultimaConsultaRiego >= INTERVALO_CONSULTA_RIEGO) {
    ultimaConsultaRiego = ahora;
    consultarYEjecutarRiegoManual();
  }

  if (ahora - ultimaConsultaUmbral >= INTERVALO_CONSULTA_UMBRAL) {
    ultimaConsultaUmbral = ahora;
    consultarUmbralPlanta();
  }
}

// =================================================================
// Diagnóstico
// =================================================================
void reportarError(const char* etapa, const char* detalle) {
  Serial.print("[ERROR][");
  Serial.print(etapa);
  Serial.print("] ");
  Serial.println(detalle);

  strncpy(ultimoErrorEtapa, etapa, sizeof(ultimoErrorEtapa) - 1);
  strncpy(ultimoErrorDetalle, detalle, sizeof(ultimoErrorDetalle) - 1);

  if (strcmp(etapa, "WIFI") == 0) erroresWifi++;
  else if (strcmp(etapa, "SENSOR") == 0) erroresSensor++;
  else if (strcmp(etapa, "BACKEND") == 0) erroresBackend++;
  else if (strcmp(etapa, "JSON") == 0) erroresJson++;
}

void imprimirResumenDeSalud() {
  Serial.println("=== Resumen de salud (último minuto acumulado) ===");
  Serial.print("Errores WiFi: "); Serial.println(erroresWifi);
  Serial.print("Errores sensor: "); Serial.println(erroresSensor);
  Serial.print("Errores backend: "); Serial.println(erroresBackend);
  Serial.print("Errores JSON: "); Serial.println(erroresJson);
  Serial.print("Umbral de riego actual: "); Serial.print(umbralHumedadMinimo); Serial.println("%");
  Serial.print("Último error: ["); Serial.print(ultimoErrorEtapa);
  Serial.print("] "); Serial.println(ultimoErrorDetalle);
  Serial.println("===================================================");
}

void asegurarConexionWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }
  reportarError("WIFI", "desconectado, reintentando con red guardada");
  if (!conectarConCredencialesGuardadas()) {
    reportarError("WIFI", "no se pudo reconectar, entrando a modo configuración");
    iniciarModoConfiguracion();
  }
}

// =================================================================
// Sensores y riego
// =================================================================
int convertirHumedadAPorcentaje(int valorCrudo) {
  int porcentaje = map(valorCrudo, CRUDO_SECO, CRUDO_HUMEDO, 0, 100);
  return constrain(porcentaje, 0, 100);
}

void cicloDeSensoresYRiegoAutomatico() {
  float temperatura = dht.readTemperature();
  float humedadAmbiente = dht.readHumidity();

  if (isnan(temperatura) || isnan(humedadAmbiente)) {
    reportarError("SENSOR", "DHT11 devolvió NaN (revisar cableado/pin 8)");
    return;
  }

  int valorCrudoSuelo = analogRead(PIN_HUMEDAD_SUELO);
  int humedadSueloPorcentaje = convertirHumedadAPorcentaje(valorCrudoSuelo);
  ultimaHumedadSueloPorcentaje = humedadSueloPorcentaje;

  medirNivelDeAgua();
  controlarRiegoAutomatico(humedadSueloPorcentaje);

  Serial.println("--- Lectura actual ---");
  Serial.print("Temperatura: "); Serial.println(temperatura);
  Serial.print("Humedad ambiente: "); Serial.println(humedadAmbiente);
  Serial.print("Humedad suelo (%): "); Serial.println(humedadSueloPorcentaje);

  enviarLecturaAlBackend(temperatura, humedadAmbiente, humedadSueloPorcentaje);
}

void controlarRiegoAutomatico(int humedadPorcentaje) {
  bool debeRegar = humedadPorcentaje <= umbralHumedadMinimo;

  if (debeRegar && !riegoAutomaticoActivo) {
    riegoAutomaticoActivo = true;
    inicioRiegoAutomatico = millis();
    humedadAlIniciarRiego = humedadPorcentaje;
    digitalWrite(PIN_BOMBA, LOW);
    Serial.println("Riego automático: INICIA");
  } else if (!debeRegar && riegoAutomaticoActivo) {
    riegoAutomaticoActivo = false;
    digitalWrite(PIN_BOMBA, HIGH);
    unsigned long duracionMs = millis() - inicioRiegoAutomatico;
    int duracionSegundos = duracionMs / 1000;
    Serial.println("Riego automático: TERMINA");
    reportarEventoRiego("automatico", duracionSegundos, humedadAlIniciarRiego);
  }
}

void medirNivelDeAgua() {
  digitalWrite(TRIG, HIGH);
  delay(1);
  digitalWrite(TRIG, LOW);
  int duracion = pulseIn(ECO, HIGH);

  if (duracion == 0) {
    digitalWrite(LED, LOW);
    return;
  }

  int distanciaCm = duracion / 58.2;
  digitalWrite(LED, (distanciaCm >= 0 && distanciaCm <= 20) ? HIGH : LOW);
}

void consultarYEjecutarRiegoManual() {
  String ruta = "/api/riego/comando-pendiente/" + String(DISPOSITIVO_ID);

  if (!client.connect(servidorHost.c_str(), SERVER_PORT)) {
    reportarError("BACKEND", "no se pudo conectar (consulta riego pendiente)");
    return;
  }

  client.println("GET " + ruta + " HTTP/1.1");
  client.print("Host: "); client.println(servidorHost);
  client.println("Connection: close");
  client.println();

  String cuerpoRespuesta = leerCuerpoDeRespuesta();
  client.stop();

  if (cuerpoRespuesta.length() == 0) {
    reportarError("BACKEND", "respuesta vacía (consulta riego pendiente)");
    return;
  }

  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, cuerpoRespuesta);
  if (error) {
    reportarError("JSON", error.c_str());
    return;
  }

  if (doc["pendiente"] == true) {
    int duracionSegundos = doc["duracionSegundos"];
    Serial.print("Riego manual pendiente, duración: ");
    Serial.println(duracionSegundos);
    ejecutarRiegoManual(duracionSegundos);
  }
}

void consultarUmbralPlanta() {
  String ruta = "/api/plantas/dispositivo/" + String(DISPOSITIVO_ID);

  if (!client.connect(servidorHost.c_str(), SERVER_PORT)) {
    reportarError("BACKEND", "no se pudo conectar (consulta umbral)");
    return;
  }

  client.println("GET " + ruta + " HTTP/1.1");
  client.print("Host: "); client.println(servidorHost);
  client.println("Connection: close");
  client.println();

  String cuerpoRespuesta = leerCuerpoDeRespuesta();
  client.stop();

  if (cuerpoRespuesta.length() == 0) {
    reportarError("BACKEND", "respuesta vacía (consulta umbral)");
    return;
  }

  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, cuerpoRespuesta);
  if (error) {
    reportarError("JSON", error.c_str());
    return;
  }

  if (doc["umbralHumedadMinimo"].is<int>()) {
    int nuevoUmbral = doc["umbralHumedadMinimo"];
    if (nuevoUmbral != umbralHumedadMinimo) {
      umbralHumedadMinimo = nuevoUmbral;
      Serial.print("Umbral de humedad actualizado desde el backend: ");
      Serial.print(umbralHumedadMinimo);
      Serial.println("%");
    }
  }
}

void ejecutarRiegoManual(int duracionSegundos) {
  int humedadInicial = ultimaHumedadSueloPorcentaje;

  digitalWrite(PIN_BOMBA, LOW);
  Serial.println("Riego MANUAL: INICIA");
  delay((unsigned long)duracionSegundos * 1000);
  digitalWrite(PIN_BOMBA, HIGH);
  Serial.println("Riego MANUAL: TERMINA");

  reportarEventoRiego("manual", duracionSegundos, humedadInicial);
}

String leerCuerpoDeRespuesta() {
  unsigned long inicio = millis();
  bool encabezadosTerminaron = false;
  String cuerpo = "";

  while (client.connected() && millis() - inicio < 5000) {
    if (client.available()) {
      String linea = client.readStringUntil('\n');
      if (!encabezadosTerminaron) {
        if (linea == "\r") {
          encabezadosTerminaron = true;
        }
      } else {
        cuerpo += linea;
      }
    }
  }

  if (cuerpo.length() == 0) {
    reportarError("BACKEND", "timeout esperando respuesta (5s)");
  }

  return cuerpo;
}

void enviarLecturaAlBackend(float temperatura, float humedadAmbiente, int humedadSuelo) {
  if (!client.connect(servidorHost.c_str(), SERVER_PORT)) {
    reportarError("BACKEND", "no se pudo conectar (envío de lectura)");
    return;
  }

  JsonDocument doc;
  doc["humedadSuelo"] = humedadSuelo;
  doc["temperatura"] = temperatura;
  doc["humedadAmbiente"] = humedadAmbiente;
  doc["dispositivoId"] = DISPOSITIVO_ID;

  String cuerpo;
  serializeJson(doc, cuerpo);

  client.println("POST /api/sensores HTTP/1.1");
  client.print("Host: "); client.println(servidorHost);
  client.println("Content-Type: application/json");
  client.print("Content-Length: "); client.println(cuerpo.length());
  client.println("Connection: close");
  client.println();
  client.println(cuerpo);

  leerCuerpoDeRespuesta();
  client.stop();
}

void reportarEventoRiego(const char* tipo, int duracionSegundos, int humedadInicial) {
  if (!client.connect(servidorHost.c_str(), SERVER_PORT)) {
    reportarError("BACKEND", "no se pudo conectar (reporte de evento de riego)");
    return;
  }

  JsonDocument doc;
  doc["tipo"] = tipo;
  doc["duracionSegundos"] = duracionSegundos;
  doc["humedadInicial"] = humedadInicial;
  doc["dispositivoId"] = DISPOSITIVO_ID;

  String cuerpo;
  serializeJson(doc, cuerpo);

  client.println("POST /api/riego/evento HTTP/1.1");
  client.print("Host: "); client.println(servidorHost);
  client.println("Content-Type: application/json");
  client.print("Content-Length: "); client.println(cuerpo.length());
  client.println("Connection: close");
  client.println();
  client.println(cuerpo);

  Serial.println(leerCuerpoDeRespuesta());
  client.stop();
}