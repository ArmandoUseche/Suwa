# SUWA — Sistema de Riego Automático con App Móvil

Proyecto de grado — Ingeniería de Software / ADSI — FET, Neiva (Huila).

SUWA es un sistema de riego automático para plantas, integrado con una aplicación
móvil, alimentado por energía solar, que permite monitorear humedad de suelo,
temperatura ambiental y controlar el riego de forma manual o automática, con
alertas en tiempo real.

## Estructura del repositorio

```
suwa/
├── backend/     # API REST + tiempo real (Node.js, Express, Socket.io, MongoDB)
├── firmware/    # Firmware del microcontrolador (Arduino/ESP32, C++)
├── app/         # Aplicación móvil (React Native)
└── docs/        # Diagramas, modelo de datos, actas, documentación técnica
```

## Objetivo general

Desarrollar un sistema de riego automático para plantas integrado con una
aplicación móvil, que permita tanto la automatización como el control manual
del riego.

## Objetivos específicos

1. Desarrollar una interfaz de usuario (UI) simple y accesible que permita
   monitorear el sistema, ajustar parámetros de riego y recibir alertas.
2. Implementar un sistema de riego autónomo alimentado por energía solar,
   con sensores de humedad para recolección de datos en tiempo real.
3. Integrar un sistema de alertas para notificar fallas, bajo nivel de agua
   o lecturas anómalas de los sensores.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Firmware | C++ (Arduino IDE), ESP32/Arduino UNO |
| Backend | Node.js, Express, Socket.io, Mongoose |
| Base de datos | MongoDB (Atlas) |
| App móvil | React Native, React Navigation, Axios |
| Diseño UI | Figma |
| Control de versiones | Git + GitHub |


## Convención de ramas

- `main` — versión estable
- `develop` — integración de features
- `feature/<nombre>` — nueva funcionalidad
- `fix/<nombre>` — corrección de errores

## Cómo levantar el entorno local

Ver instrucciones específicas en `backend/README.md`, `app/README.md` y
`firmware/README.md`.
