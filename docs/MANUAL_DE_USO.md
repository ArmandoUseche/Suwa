# Manual de uso de SUWA

## 1. Propósito

SUWA es una plataforma para monitorear plantas y controlar su riego mediante
una aplicación móvil y un kit físico.

La aplicación permite:

- Registrar una cuenta e iniciar sesión.
- Escanear una planta o introducir sus datos manualmente.
- Guardar y consultar las plantas del usuario.
- Seleccionar una planta para monitoreo.
- Consultar humedad del suelo, temperatura y humedad ambiental.
- Consultar el porcentaje estimado de agua disponible en el depósito.
- Activar un riego manual.
- Programar un riego diario.
- Consultar el historial.
- Revisar y marcar alertas.
- Editar los datos del perfil.

## 2. Requisitos para utilizar SUWA

### 2.1 Equipo

- Teléfono Android o iOS con SUWA preparado por el responsable de la
  instalación.
- Kit SUWA encendido y preparado.
- Sensores conectados.
- Relé y bomba conectados correctamente.
- Depósito de agua lleno.

Durante una demostración, el responsable de la instalación debe dejar
preparada la conexión del kit y abrir la aplicación antes de entregar el
teléfono al usuario final.

## 3. Abrir SUWA

1. Abrir la aplicación SUWA.
2. Esperar a que aparezca la pantalla principal.
3. Si se muestra **Kit no conectado**, solicitar al responsable que revise la
   conexión del kit antes de continuar.

## 4. Registro e inicio de sesión

1. Abrir SUWA.
2. Seleccionar **Registrarse**.
3. Completar nombre, apellidos, correo o teléfono y contraseña.
4. Iniciar sesión con las credenciales registradas.

La contraseña debe tener al menos seis caracteres. La aplicación conserva la
sesión localmente mientras el token siga siendo válido.

## 5. Agregar una planta

1. Entrar a **Escanear**.
2. Elegir una de estas opciones:
   - **Escanear ahora** para identificarla con la cámara.
   - Escribir un nombre común, científico o regional y pulsar **Usar este
     nombre**.
3. Si se ingresó un nombre manualmente, esperar la normalización y revisar las
   candidatas mostradas.
4. Seleccionar la especie correcta. Para nombres ambiguos, como **helecho**, no
   se selecciona una especie automáticamente.
5. Si se usó la cámara, revisar las candidatas propuestas y seleccionar la
   correcta.
6. Esperar los parámetros sugeridos de cuidado.
7. Revisar y guardar la planta.

El ingreso manual acepta nombres científicos, nombres comunes, nombres
coloquiales o regionales y errores menores de escritura. Por ejemplo:

- **lengua de suegra** puede proponer *Dracaena trifasciata*.
- **potus** puede proponer *Epipremnum aureum*.
- **sábila** puede proponer *Aloe vera*.
- **cinta** puede proponer *Chlorophytum comosum*.
- **monstera** puede proponer *Monstera deliciosa*.

La aplicación no debe inventar una especie si el nombre no se reconoce o si el
servicio de normalización no está disponible. En ese caso muestra un mensaje
de error y permite volver al ingreso manual o utilizar el escaneo por cámara.

La imagen queda guardada en la cuenta para que pueda aparecer al iniciar sesión
desde otro dispositivo.

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
- Nivel estimado de agua del depósito.
- Estado general de la planta.
- Estado de conexión del kit.

El nivel se calcula con el sensor ultrasónico situado sobre el depósito. En la
calibración actual, una distancia de aproximadamente 22 cm hasta la superficie
del agua corresponde a un depósito vacío (0%), y una distancia de 15 cm
corresponde aproximadamente a un depósito lleno (100%). Es una estimación y
debe recalibrarse si cambia la posición del sensor, el recipiente o el nivel
máximo permitido.

La aplicación muestra la lectura más reciente disponible.

## 8. Configurar el riego por planta

Desde **Configurar umbrales** se puede personalizar la estrategia de riego
automático de la planta:

- **Humedad mínima**: porcentaje que inicia el riego.
- **Duración de cada pulso**: segundos que permanece encendida la bomba.
- **Espera de absorción**: tiempo que se espera antes de volver a medir.
- **Máximo de pulsos**: límite de pulsos en un ciclo.
- **Tiempo máximo total**: límite de seguridad de bomba encendida.

SUWA aplica un pulso, espera la absorción y vuelve a evaluar la humedad. Si
la planta continúa seca, aplica otro pulso hasta alcanzar la humedad suficiente
o alguno de los límites configurados. Los valores predeterminados son 3
segundos por pulso, 20 segundos de absorción, 3 pulsos y 90 segundos máximos.

## 9. Activar riego manual

1. Abrir **Monitoreo** o el detalle de una planta en monitoreo.
2. Pulsar **Regar ahora**.
3. Si la humedad está por encima del umbral, confirmar que se desea regar.
4. Esperar el mensaje de confirmación.

La aplicación envía la orden al sistema y el kit la ejecuta durante la
duración indicada. Al terminar, la aplicación muestra el resultado disponible.

## 10. Programar el riego

1. Abrir el detalle de la planta en monitoreo.
2. Pulsar **Programar riego**.
3. Seleccionar la hora.
4. Pulsar **Guardar**.

La programación se ejecuta diariamente mientras el kit y el sistema de control
estén disponibles.

Para cancelar:

1. Abrir la programación activa.
2. Pulsar la programación o la acción de cancelar.
3. Confirmar la cancelación.

## 11. Alertas

La campana de **Monitoreo** abre el centro de alertas. Desde allí se puede:

- Consultar las alertas.
- Marcar una alerta individual como leída.
- Pulsar **Leer todas**.

Las preferencias de **Notificaciones** controlan las categorías visibles en la
aplicación. Actualmente son preferencias locales de visualización; no son
notificaciones push del sistema operativo.

## 12. Historial

En **Historial** se consultan:

- Lecturas agrupadas de sensores.
- Gráficas por periodo.
- Registros de riego manual y automático.

Si no existen registros, se muestra el estado vacío. Si no se puede actualizar
la información, se muestra un aviso con la opción **Reintentar**.

## 13. Perfil y configuración

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

## 14. Capturas de pantalla

El manual final debe incluir capturas de la interfaz, con una breve explicación
debajo de cada imagen. Se recomienda incluir, como mínimo:

1. Pantalla de inicio de sesión.
2. Pantalla principal de monitoreo.
3. Pantalla **Mis plantas**.
4. Resultado del escaneo o ingreso manual de una planta.
5. Configuración de umbrales y riego.
6. Confirmación de un riego manual.
7. Historial.
8. Centro de alertas.
9. Perfil y preferencias.

Las capturas deben tomarse durante una ejecución real de la aplicación y no
deben mostrar contraseñas, claves, tokens ni información personal innecesaria.

## 15. Cierre de la demostración

1. Cancelar cualquier programación que no deba quedar activa.
2. Apagar la bomba o retirar el suministro de agua si corresponde.
3. Cerrar SUWA.
4. Desconectar la placa si no se va a utilizar.
