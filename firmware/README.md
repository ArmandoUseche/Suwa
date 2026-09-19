# Firmware SUWA

Firmware del kit SUWA, escrito en C++ para Arduino IDE y placas compatibles
con `WiFiS3`.

## Qué hace

1. Se conecta al WiFi.
2. Cada cinco segundos lee humedad de suelo (sensor capacitivo, analógico) y
   temperatura/humedad ambiente (DHT11).
3. Envía la lectura al backend (`POST /api/sensores`).
4. Si la humedad de suelo cae bajo el umbral, activa la bomba (relé) y
   reporta el evento (`POST /api/riego/evento`).

## Antes de subir el código

- Selecciona la placa y el puerto correctos en Arduino IDE.
- El sketch guarda SSID, contraseña y host del backend en EEPROM.
- El host predeterminado actual es `10.238.0.16`; si cambia la red, usa el
  portal `SUWA-Config` para configurar la IP del computador.
- Calibra `CRUDO_SECO` y `CRUDO_HUMEDO` en el sketch con tu sensor real.
- Instala las librerías: **DHT sensor library** (Adafruit) y **ArduinoJson**
  desde el Administrador de Librerías del Arduino IDE.

## Comunicación y operación

- El firmware envía lecturas con `POST /api/sensores`.
- Consulta comandos con `GET /api/riego/comando-pendiente/:dispositivoId`.
- Consulta el umbral con `GET /api/plantas/dispositivo/:dispositivoId`.
- Reporta eventos con `POST /api/riego/evento`.
- El comando `BORRAR` en el monitor serial reinicia la configuración Wi-Fi.

Para el manual completo consulta
`../docs/MANUAL_TECNICO_Y_MANTENIMIENTO.md`.
