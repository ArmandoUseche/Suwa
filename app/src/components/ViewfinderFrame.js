import { StyleSheet, View } from 'react-native';

// Las 4 esquinas tipo "viewfinder" de cámara (mockup de Escanear).
//
// `absolute` (default true): en React Native, un elemento
// position:'absolute' SIN top/left explícitos no se centra de forma
// confiable solo por el alignItems/justifyContent del padre -- termina
// anclado arriba a la izquierda. Por eso este componente NO intenta
// autocentrarse mágicamente: quien lo usa decide cómo ubicarlo.
//  - En el intro de Escanear se superpone sobre la foto de ejemplo con
//    el mismo truco de margin negativo que ya se usa en Monitoreo (ver
//    EscanearScreen.js) -- ahí `absolute={false}`.
//  - En la cámara real, va como un hijo normal más dentro de un
//    contenedor flex ya centrado -- también `absolute={false}`.
// La opción `absolute={true}` se deja disponible por si en algún caso
// futuro sí hace falta superponer sin ocupar espacio en el flujo normal
// (con top/left propios pasados via `style`).
export default function ViewfinderFrame({
  size = 220,
  color = '#FFFFFF',
  thickness = 3,
  cornerLength = 28,
  absolute = false,
  style,
}) {
  const corner = { width: cornerLength, height: cornerLength, borderColor: color };

  return (
    <View
      style={[absolute && styles.absolute, { width: size, height: size }, style]}
      pointerEvents="none"
    >
      <View style={[styles.corner, corner, styles.topLeft, { borderTopWidth: thickness, borderLeftWidth: thickness }]} />
      <View style={[styles.corner, corner, styles.topRight, { borderTopWidth: thickness, borderRightWidth: thickness }]} />
      <View style={[styles.corner, corner, styles.bottomLeft, { borderBottomWidth: thickness, borderLeftWidth: thickness }]} />
      <View style={[styles.corner, corner, styles.bottomRight, { borderBottomWidth: thickness, borderRightWidth: thickness }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
  corner: {
    position: 'absolute',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomRightRadius: 8,
  },
});
