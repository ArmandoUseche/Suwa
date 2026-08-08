import { Image, StyleSheet, View } from 'react-native';

import { illustrations } from '../constants/images';

// Foto real de la planta del usuario, recortada en círculo. El fondo de
// la foto ya es un verde sage suave con sombra propia (así viene el
// archivo), así que basta con "cover" para que ese fondo llene el
// círculo — no hace falta agregar un halo/aura aparte, ya viene
// integrado en la imagen.
//
// La sombra va en un View exterior (sin overflow hidden) y el recorte
// circular en un View interior (con overflow hidden): si la sombra y el
// overflow:hidden van en el mismo nodo, Android recorta la sombra junto
// con la imagen y no se ve nada.
export default function PlantPhoto({ size }) {
  const circleStyle = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.shadowWrapper, circleStyle]}>
      <View style={[styles.clip, circleStyle]}>
        <Image
          source={illustrations.monitoreoPlantaFoto}
          style={circleStyle}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  clip: {
    overflow: 'hidden',
  },
});
