import { Image, StyleSheet } from 'react-native';

import { illustrations } from '../constants/images';

// Foto real de la planta del usuario, recortada en círculo. El fondo de
// la foto ya es un verde sage suave con sombra propia (así viene el
// archivo), así que basta con "cover" para que ese fondo llene el
// círculo — no hace falta agregar un halo/aura aparte, ya viene
// integrado en la imagen.
export default function PlantPhoto({ size }) {
  return (
    <Image
      source={illustrations.monitoreoPlantaFoto}
      style={[styles.photo, { width: size, height: size, borderRadius: size / 2 }]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  photo: {
    overflow: 'hidden',
  },
});
