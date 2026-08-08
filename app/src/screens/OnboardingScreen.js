import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { PrimaryButton } from '../components/Buttons';
import { illustrations } from '../constants/images';
import { colors, radius, spacing, typography } from '../constants/theme';
import { contentMaxWidth, moderateScale, screen } from '../utils/responsive';

const SCREEN_WIDTH = screen.width;

// FlatList normal no soporta useNativeDriver en su onScroll porque no es
// un componente "animado". Animated.FlatList sí lo es (por eso el fix).
const AnimatedFlatList = Animated.FlatList;

// Textos y orden tomados directo de los mockups (slides 2, 3 y 4 de Figma).
const SLIDES = [
  {
    key: 'monitoreo',
    image: illustrations.onboardingMonitoreo,
    title: 'Tu cultivo bajo control',
    description:
      'Monitorea en tiempo real la humedad del suelo, la temperatura ambiental y el nivel de agua del depósito mediante sensores de alta precisión.',
  },
  {
    key: 'riego',
    image: illustrations.onboardingRiego,
    title: 'Riego Inteligente y Autónomo',
    description:
      'Define tus propios límites de humedad. El sistema activará la bomba automáticamente cuando la tierra esté seca, o contrólalo manualmente con un solo toque.',
  },
  {
    key: 'alertas',
    image: illustrations.onboardingAlertas,
    title: 'Historiales y Alertas Push',
    description:
      'Recibe alertas inmediatas si el tanque de agua está bajo y analiza el progreso de tu cultivo a través de gráficas interactivas.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const goToNextSlide = () => {
    if (isLastSlide) {
      // La pantalla de Bienvenida se termina de construir en el Paso 3
      // (flujo de autenticación); por ahora aterriza en el stub.
      navigation.replace('Welcome');
      return;
    }
    listRef.current?.scrollToOffset({
      offset: (activeIndex + 1) * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleMomentumScrollEnd = (event) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    setActiveIndex(nextIndex);
  };

  return (
    <GradientBackground>
      <AnimatedFlatList
        ref={listRef}
        style={styles.list}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item, index }) => (
          <Slide item={item} index={index} scrollX={scrollX} />
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <Dot key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        <PrimaryButton
          label={isLastSlide ? 'Comenzar' : 'Siguiente'}
          onPress={goToNextSlide}
          style={styles.button}
        />
      </View>
    </GradientBackground>
  );
}

// Cada slide hace un crossfade + escala sutil de su ilustración a medida
// que entra y sale de pantalla, en vez de aparecer/desaparecer de golpe.
// Disimula la compresión de las imágenes y se siente menos "estático".
function Slide({ item, index, scrollX }) {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slide}>
      <Animated.View
        style={[
          styles.imageCircle,
          { opacity, transform: [{ scale }] },
        ]}
      >
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </Animated.View>

      <Animated.View style={[styles.textBlock, { opacity }]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

// El native driver solo puede animar 'transform' y 'opacity', nunca
// propiedades de layout como 'width' directamente (por eso este error:
// "Style property 'width' is not supported by native animated module").
// Por eso el punto activo se "agranda" con scaleX en vez de cambiar su
// ancho real.
function Dot({ index, scrollX }) {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const scaleX = scrollX.interpolate({
    inputRange,
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  const dotOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { opacity: dotOpacity, transform: [{ scaleX }] },
      ]}
    />
  );
}

// Capamos el círculo a un máximo: en un tablet, el 72% del ancho de
// pantalla sería enorme y se vería desproporcionado frente al texto.
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH * 0.72, 320);

const styles = StyleSheet.create({
  // La lista ocupa todo el espacio vertical disponible entre el borde
  // superior y el footer, para que cada slide pueda centrar su
  // contenido dentro de esa altura (en vez de quedar pegado arriba).
  list: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: '100%',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    width: '100%',
    maxWidth: contentMaxWidth,
    // A diferencia del círculo de la ilustración (que sí va centrado),
    // en el mockup el bloque de texto va alineado a la izquierda.
    alignSelf: 'flex-start',
  },
  title: {
    ...typography.h1,
    textAlign: 'left',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    textAlign: 'left',
    color: colors.textMuted,
    lineHeight: moderateScale(22),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: '100%',
    maxWidth: contentMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: moderateScale(20),
    height: moderateScale(8),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  button: {
    paddingHorizontal: spacing.lg,
  },
});