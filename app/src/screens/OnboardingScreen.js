import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { illustrations } from '../constants/images';
import { colors, radius, spacing, typography } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

        <Pressable style={styles.button} onPress={goToNextSlide}>
          <Text style={typography.button}>
            {isLastSlide ? 'Comenzar' : 'siguiente'}
          </Text>
        </Pressable>
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

      <Animated.View style={{ opacity }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

function Dot({ index, scrollX }) {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const dotWidth = scrollX.interpolate({
    inputRange,
    outputRange: [8, 20, 8],
    extrapolate: 'clamp',
  });

  const dotOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
    />
  );
}

const CIRCLE_SIZE = SCREEN_WIDTH * 0.72;

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
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
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
});