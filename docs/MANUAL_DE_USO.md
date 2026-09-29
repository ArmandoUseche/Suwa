# Manual de uso de SUWA

## 1. Propósito

SUWA es un sistema de monitoreo y riego para plantas compuesto por:

- Un kit físico con sensores y bomba.
- Un backend Node.js que recibe lecturas y administra los comandos.
- Una aplicación móvil React Native/Expo para consultar el estado y controlar el riego.
- MongoDB para conservar usuarios, plantas, lecturas, alertas y eventos de riego.

La aplicación permite:

- Registrar una cuenta e iniciar sesión.
- Escanear una planta o introducir sus datos manualmente.
- Guardar y consultar las plantas del usuario.
- Seleccionar una planta para monitoreo.
- Consultar humedad del suelo, temperatura y humedad ambiental.
- Activar un riego manual.
- Programar un riego diario.
- Consultar el historial.
- Revisar y marcar alertas.
- Editar los datos del perfil.

## 2. Requisitos para una demostración

### 2.1 Equipo

- Computador con Node.js instalado.
- Teléfono Android o iOS con la aplicación SUWA.
- Placa del kit SUWA programada con el firmware estable.
- Sensores conectados.
- Relé y bomba conectados correctamente.
- Depósito de agua lleno.
- Cable USB para programar o alimentar la placa, según el montaje.

### 2.2 Red

Durante una demostración local, el teléfono, el computador y la placa deben
estar en la misma red. El flujo recomendado es:

1. Activar el hotspot del teléfono.
2. Conectar el computador a ese hotspot.
3. Encender o reiniciar la placa.
4. Iniciar el backend en el computador.
5. Abrir la aplicación en el teléfono.

La placa no se comunica directamente con MongoDB ni con la aplicación. La
placa se comunica por HTTP con el backend local del computador.

## 3. Inicio de una sesión de uso

### 3.1 Iniciar el backend local

En PowerShell:

```powershell
cd C:\Users\marti\Desktop\Suwa\backend
npm run dev
```

El resultado esperado incluye:

```text
Conectado a MongoDB
SUWA backend escuchando en todas las interfaces de red en el puerto 3000
```

Para comprobar el backend desde el computador:

```powershell
Invoke-RestMethod http://localhost:3000/
```

La respuesta esperada es:

```json
{"status":"ok","service":"suwa-backend"}
```

### 3.2 Iniciar la aplicación

```powershell
cd C:\Users\marti\Desktop\Suwa\app
npx expo start
```

La aplicación puede abrirse con Expo Go o con la instalación de Android
disponible para el proyecto. Si se cambió la configuración del entorno:

```powershell
npx expo start --clear
```

### 3.3 Comprobar la placa

En el monitor serial del Arduino IDE, usar **9600 baudios**. La placa debe
mostrar:

```text
Host del backend en uso: <IP_DEL_COMPUTADOR>
Conectado. IP: <IP_DE_LA_PLACA>
```

Después deben aparecer lecturas aproximadamente cada cinco segundos:

```text
--- Lectura actual ---
Temperatura: ...
Humedad ambiente: ...
Humedad suelo (%): ...
```

## 4. Registro e inicio de sesión

1. Abrir SUWA.
2. Seleccionar **Registrarse**.
3. Completar nombre, apellidos, correo o teléfono y contraseña.
4. Iniciar sesión con las credenciales registradas.

La contraseña debe tener al menos seis caracteres. La aplicación conserva la
sesión localmente mientras el token siga siendo válido.

## 5. Agregar una planta

1. Entrar a **Escanear**.
2. Tomar una fotografía o escoger una imagen de la galería.
3. Esperar el resultado de identificación.
4. Revisar la candidata propuesta.
5. Confirmar la planta o utilizar el nombre manual cuando sea necesario.
6. Revisar los parámetros sugeridos.
7. Guardar la planta.

La imagen se sube al backend y queda almacenada para que pueda aparecer al
iniciar sesión desde otro dispositivo.

También es posible cambiar posteriormente la foto desde el detalle de la
planta.

## 6. Seleccionar la planta en monitoreo

Solo una planta puede estar en monitoreo por dispositivo físico.

1. Abrir **Mis plantas**.
2. Seleccionar la planta deseada.
3. Elegir **Poner en monitoreo** o la acción equivalente.
4. Abrir **Monitoreo**.

Si no hay una planta seleccionada, la pantalla debe mostrar **Planta no
seleccionada** y ofrecer acceso a **Mis plantas**.

## 7. Consultar las lecturas

En **Monitoreo** se muestran:

- Humedad del suelo.
- Temperatura.
- Humedad ambiental.
- Estado general de la planta.
- Estado de conexión del kit.

La aplicación consulta la lectura más reciente disponible. En una demostración
local puede consultar el backend remoto y el backend local, y seleccionar la
lectura con el timestamp más reciente.

## 8. Activar riego manual

1. Abrir **Monitoreo** o el detalle de una planta en monitoreo.
2. Pulsar **Regar ahora**.
3. Si la humedad está por encima del umbral, confirmar que se desea regar.
4. Esperar el mensaje de confirmación.

La aplicación envía el comando al backend local. La placa consulta los
comandos pendientes cada pocos segundos, activa la bomba durante la duración
indicada y registra el evento al terminar.

No se debe desconectar el backend local mientras la orden esté pendiente.

## 9. Programar el riego

1. Abrir el detalle de la planta en monitoreo.
2. Pulsar **Programar riego**.
3. Seleccionar la hora.
4. Pulsar **Guardar**.

La programación se ejecuta diariamente. El backend revisa las programaciones
vencidas aproximadamente cada cinco segundos y deja un comando pendiente para
que la placa lo recoja.

Para cancelar:

1. Abrir la programación activa.
2. Pulsar la programación o la acción de cancelar.
3. Confirmar la cancelación.

## 10. Alertas

La campana de **Monitoreo** abre el centro de alertas. Desde allí se puede:

- Consultar las alertas.
- Marcar una alerta individual como leída.
- Pulsar **Leer todas**.

Las preferencias de **Notificaciones** controlan las categorías visibles en la
aplicación. Actualmente son preferencias locales de visualización; no son
notificaciones push del sistema operativo.

## 11. Historial

En **Historial** se consultan:

- Lecturas agrupadas de sensores.
- Gráficas por periodo.
- Registros de riego manual y automático.

Si no existen registros, se muestra el estado vacío. Si el backend no responde,
se muestra un error con la opción **Reintentar**.

## 12. Perfil y configuración

Desde **Perfil** se puede:

- Editar nombre.
- Editar apellidos.
- Editar usuario.
- Editar correo o teléfono.
- Cambiar la contraseña.
- Configurar preferencias de notificaciones.
- Consultar términos, privacidad y contacto.

El botón de contacto abre el cliente de correo del dispositivo con un mensaje
preparado para `soporte@suwa.app`.

## 13. Cierre de la demostración

1. Cancelar cualquier programación que no deba quedar activa.
2. Apagar la bomba o retirar el suministro de agua si corresponde.
3. Detener la aplicación Expo.
4. Detener el backend con `Ctrl+C`.
5. Desconectar la placa si no se va a utilizar.

