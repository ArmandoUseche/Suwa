/*
 * SUWA - Firmware base para ESP32
 * Lee humedad de suelo (analógica), temperatura/humedad ambiente (DHT11/22),
 * decide si regar según un umbral, y envía los datos al backend por HTTP.
 *
 * Librerías necesarias (Arduino IDE > Administrador de librerías):
 *   - DHT sensor library (Adafruit)
 *   - ArduinoJson
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ---------- CONFIGURACIÓN ----------
const char* WIFI_SSID = "TU_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD";
const char* SERVER_URL = "http://TU_SERVIDOR:3000/api/sensores";
const char* DISPOSITIVO_ID = "suwa-001";

#define PIN_HUMEDAD_SUELO 34   // pin analógico ADC
#define PIN_DHT 4
#define PIN_RELE_BOMBA 26
#define DHTTYPE DHT11

const int UMBRAL_HUMEDAD = 30;        // % por debajo del cual se activa el riego
const unsigned long INTERVALO_LECTURA = 60000; // 1 minuto

DHT dht(PIN_DHT, DHTTYPE);
unsigned long ultimaLectura = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELE_BOMBA, OUTPUT);
  digitalWrite(PIN_RELE_BOMBA, LOW);

  dht.begin();
  conectarWiFi();
}

void loop() {
  if (millis() - ultimaLectura >= INTERVALO_LECTURA) {
    ultimaLectura = millis();

    int humedadSueloRaw = analogRead(PIN_HUMEDAD_SUELO);
    float humedadSuelo = mapearHumedad(humedadSueloRaw);
    float temperatura = dht.readTemperature();
    float humedadAmbiente = dht.readHumidity();

    if (isnan(temperatura) || isnan(humedadAmbiente)) {
      Serial.println("Error leyendo el sensor DHT");
      return;
    }

    Serial.printf("Humedad suelo: %.1f%%  Temp: %.1fC  Humedad amb: %.1f%%\n",
                  humedadSuelo, temperatura, humedadAmbiente);

    enviarLectura(humedadSuelo, temperatura, humedadAmbiente);

    if (humedadSuelo < UMBRAL_HUMEDAD) {
      activarRiego(10); // riego automático de 10 segundos
    }
  }
}

void conectarWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado. IP: " + WiFi.localIP().toString());
}

float mapearHumedad(int valorRaw) {
  // Ajustar estos valores con la calibración real del sensor capacitivo
  const int SECO = 4095;
  const int MOJADO = 1200;
  float porcentaje = map(valorRaw, SECO, MOJADO, 0, 100);
  return constrain(porcentaje, 0, 100);
}

void enviarLectura(float humedadSuelo, float temperatura, float humedadAmbiente) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["humedadSuelo"] = humedadSuelo;
  doc["temperatura"] = temperatura;
  doc["humedadAmbiente"] = humedadAmbiente;
  doc["dispositivoId"] = DISPOSITIVO_ID;

  String payload;
  serializeJson(doc, payload);

  int codigo = http.POST(payload);
  Serial.printf("POST /api/sensores -> %d\n", codigo);
  http.end();
}

void activarRiego(int segundos) {
  digitalWrite(PIN_RELE_BOMBA, HIGH);
  delay(segundos * 1000);
  digitalWrite(PIN_RELE_BOMBA, LOW);

  reportarEventoRiego("automatico", segundos);
}

void reportarEventoRiego(const char* tipo, int duracionSegundos) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin("http://TU_SERVIDOR:3000/api/riego/evento");
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["tipo"] = tipo;
  doc["duracionSegundos"] = duracionSegundos;
  doc["dispositivoId"] = DISPOSITIVO_ID;

  String payload;
  serializeJson(doc, payload);

  http.POST(payload);
  http.end();
}
