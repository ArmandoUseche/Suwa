# suwa-firmware

Firmware base para ESP32, escrito en C++ (Arduino IDE).

## Qué hace

1. Se conecta al WiFi.
2. Cada minuto lee humedad de suelo (sensor capacitivo, analógico) y
   temperatura/humedad ambiente (DHT11).
3. Envía la lectura al backend (`POST /api/sensores`).
4. Si la humedad de suelo cae bajo el umbral, activa la bomba (relé) y
   reporta el evento (`POST /api/riego/evento`).

## Antes de subir el código

- Edita `WIFI_SSID`, `WIFI_PASSWORD`, `SERVER_URL` y `DISPOSITIVO_ID`.
- Calibra `SECO` y `MOJADO` en `mapearHumedad()` con tu sensor real
  (sumerge el sensor en agua y en aire seco, anota las lecturas crudas).
- Instala las librerías: **DHT sensor library** (Adafruit) y **ArduinoJson**
  desde el Administrador de Librerías del Arduino IDE.

## Pendiente (para siguientes iteraciones)

- Escuchar el comando `comando_riego` que emite el backend por Socket.io,
  para el riego manual desde la app (esto requiere una librería de
  WebSocket/Socket.io para ESP32, o exponer un endpoint HTTP que el
  backend consulte por polling).
- Sensor de nivel de agua en el depósito, para la alerta de "nivel bajo".
