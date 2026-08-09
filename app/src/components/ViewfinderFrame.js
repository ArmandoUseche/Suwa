import { StyleSheet, View } from 'react-native';

// Las 4 esquinas tipo "viewfinder" de cámara (mockup de Escanear). Se
// usa tanto de forma decorativa (sobre la foto de ejemplo del intro de
// Escanear) como funcional (sobre la cámara real, para indicar dónde
// centrar la planta) -- por eso vive como componente propio en vez de
// repetir los 4 bloques de esquina en los 2 lugares.
export default function ViewfinderFrame({ size = 220, color = '#FFFFFF', thickness = 3, cornerLength = 28 }) {
  const corner = { width: cornerLength, height: cornerLength, borderColor: color };

  return (
    <View style={[styles.wrapper, { width: size, height: size }]} pointerEvents="none">
      <View style={[styles.corner, corner, styles.topLeft, { borderTopWidth: thickness, borderLeftWidth: thickness }]} />
      <View style={[styles.corner, corner, styles.topRight, { borderTopWidth: thickness, borderRightWidth: thickness }]} />
      <View style={[styles.corner, corner, styles.bottomLeft, { borderBottomWidth: thickness, borderLeftWidth: thickness }]} />
      <View style={[styles.corner, corner, styles.bottomRight, { borderBottomWidth: thickness, borderRightWidth: thickness }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
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
