import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import PressableScale from './PressableScale';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { illustrations } from '../constants/images';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72;

// Los 3 tips del mockup. `wrong`/`right` son las 2 fotos de ejemplo de
// cada tip -- para "Centra tu planta" y "Busca una foto clara" solo
// tenía UNA foto de referencia (no una versión "mala" separada), así
// que el ejemplo incorrecto se simula sobre esa misma foto (corrida de
// centro / oscurecida) en vez de tener 2 archivos distintos. Para "Una
// planta a la vez" sí hay 2 fotos reales distintas.
const TIPS = [
  {
    titulo: 'Centra tu planta',
    descripcion: 'Coloca la planta en medio del recuadro para que la identificación sea más precisa.',
    image: illustrations.consejoVioleta,
    // 'shift': la miniatura "incorrecta" se arma corriendo la misma foto
    // fuera de centro (no hay una 2da foto para ese caso).
    wrongEffect: 'shift',
  },
  {
    titulo: 'Busca una foto clara',
    descripcion: 'Evita tomar fotos borrosas, oscuras o con demasiada sombra para no alterar el resultado.',
    image: illustrations.consejoSuculenta,
    // 'dim': la miniatura "incorrecta" oscurece la misma foto (no hay
    // una 2da foto "mala" para este caso).
    wrongEffect: 'dim',
  },
  {
    titulo: 'Una planta a la vez',
    descripcion: 'Asegúrate de que solo aparezca una planta en la toma para evitar confusiones en el análisis.',
    wrongImage: illustrations.consejoDosPlantasIncorrecta,
    rightImage: illustrations.consejoManzanillaCorrecta,
  },
];

function ThumbBox({ correct, image, wrongEffect }) {
  return (
    <View style={styles.thumbBox}>
      <View style={styles.thumbImageClip}>
        <Image
          source={image}
          resizeMode="cover"
          style={[
            styles.thumbImage,
            !correct && wrongEffect === 'shift' && styles.thumbShift,
          ]}
        />
        {!correct && wrongEffect === 'dim' && <View style={styles.thumbDimOverlay} />}
      </View>
      <View style={[styles.badge, correct ? styles.badgeCorrect : styles.badgeWrong]}>
        <Ionicons
          name={correct ? 'checkmark' : 'close'}
          size={moderateScale(14)}
          color="#FFFFFF"
        />
      </View>
    </View>
  );
}

// Modal de "Consejos" de Escanear: sube desde abajo sin salir de la
// pantalla de la cámara (por eso es un componente, no una screen de
// navegación aparte). 3 pasos con Volver/Siguiente, y "Listo" en el
// último que cierra el modal.
export default function ConsejosSheet({ visible, onClose }) {
  const [step, setStep] = useState(0);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setStep(0);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const tip = TIPS[step];
  const isLast = step === TIPS.length - 1;

  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.header}>
          <PressableScale onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={moderateScale(24)} color={colors.textDark} />
          </PressableScale>
          <Text style={styles.headerTitle}>Consejos</Text>
          <View style={{ width: moderateScale(24) }} />
        </View>

        <View style={styles.thumbsColumn}>
          {tip.wrongImage ? (
            <ThumbBox correct={false} image={tip.wrongImage} />
          ) : (
            <ThumbBox correct={false} image={tip.image} wrongEffect={tip.wrongEffect} />
          )}
          {tip.rightImage ? (
            <ThumbBox correct image={tip.rightImage} />
          ) : (
            <ThumbBox correct image={tip.image} wrongEffect={tip.wrongEffect} />
          )}
        </View>

        <Text style={styles.tipTitle}>{tip.titulo}</Text>
        <Text style={styles.tipDescription}>{tip.descripcion}</Text>

        <View style={styles.dots}>
          {TIPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.footer}>
          {step > 0 ? (
            <SecondaryButton
              label="Volver"
              onPress={() => setStep((s) => s - 1)}
              style={styles.navButton}
            />
          ) : (
            <View />
          )}
          <PrimaryButton
            label={isLast ? 'Listo' : 'Siguiente'}
            onPress={() => (isLast ? onClose() : setStep((s) => s + 1))}
            style={styles.navButton}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const THUMB_SIZE = moderateScale(120);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: moderateScale(18),
  },
  thumbsColumn: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  thumbBox: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  thumbImageClip: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  // Simula "planta fuera de centro": agranda y corre la imagen dentro
  // del recorte para que se vea descentrada, sin necesitar una 2da foto.
  thumbShift: {
    transform: [{ scale: 1.6 }, { translateX: THUMB_SIZE * 0.22 }, { translateY: -THUMB_SIZE * 0.18 }],
  },
  thumbDimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  badge: {
    position: 'absolute',
    top: -moderateScale(6),
    right: -moderateScale(6),
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeCorrect: {
    backgroundColor: colors.primary,
  },
  badgeWrong: {
    backgroundColor: '#E0524B',
  },
  tipTitle: {
    ...typography.h2,
    fontSize: moderateScale(21),
    marginBottom: spacing.xs,
  },
  tipDescription: {
    ...typography.body,
    fontSize: moderateScale(17),
    lineHeight: moderateScale(23),
    color: colors.textMuted,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: moderateScale(16),
  },
  // space-between (no flex:1 en los botones): cada botón queda del
  // tamaño de su propio contenido, uno en cada esquina -- igual que el
  // mockup, en vez de estirado a la mitad de la fila cada uno. El
  // <View /> vacío del paso 1 (sin "Volver") es lo que empuja
  // "Siguiente" hacia la derecha con space-between.
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  navButton: {
    paddingHorizontal: spacing.xl,
  },
});
