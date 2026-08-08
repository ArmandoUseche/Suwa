import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

// Envoltorio fino sobre Pressable que agrega una animación de "presionado"
// (se encoge un poco + baja la opacidad) a cualquier botón de la app.
// Se creó porque ninguno de los botones tenía feedback táctil: se sentían
// "muertos" al tocarlos, sin indicar que el toque fue registrado.
//
// `style` es el look visual (fondo, padding, borde) y se anima (así todo
// el botón se encoge, no solo el texto de adentro). `outerStyle` es para
// cuando el Pressable en sí necesita layout externo que NO debe animarse
// -- por ejemplo el botón de Escanear, que necesita flex/posicionamiento
// para ubicarse bien dentro de la barra de tabs.
export default function PressableScale({
  children,
  style,
  outerStyle,
  onPress,
  disabled,
  scaleTo = 0.96,
  ...pressableProps
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue, opacityTo) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue,
        useNativeDriver: true,
        speed: 40,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: opacityTo,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animateTo(scaleTo, 0.85)}
      onPressOut={() => animateTo(1, 1)}
      style={outerStyle}
      {...pressableProps}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
