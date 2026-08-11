import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from './PressableScale';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { illustrations } from '../constants/images';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// OJO: esto ya NO define el alto real del panel (eso ahora es
// `maxHeight: '90%'` en el estilo `sheet`, un porcentaje real medido
// por RN en el momento, no un número calculado a mano que podía no
// coincidir con el alto real de pantalla en esta presentación -- eso
// era lo que hacía que a veces el panel terminara mucho más alto o más
// bajo de lo esperado, "sin responsividad"). Esto solo se usa como
// punto de partida de la animación de "entra desde abajo": no hace
// falta que sea exacto, solo que sea un número más grande que
// cualquier pantalla real, para que arranque bien afuera de la
// pantalla antes de deslizarse hacia arriba.
const OFFSCREEN_Y = SCREEN_HEIGHT;

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
    // Ahora son 2 fotos reales (la borrosa se generó de antemano con
    // PIL a partir de la misma foto) en vez de desenfocar en vivo con
    // BlurView -- en Android ese blur muchas veces no se renderizaba.
    wrongImage: illustrations.consejoSuculentaBorrosa,
    rightImage: illustrations.consejoSuculenta,
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
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const translateY = useRef(new Animated.Value(OFFSCREEN_Y)).current;

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
        toValue: OFFSCREEN_Y,
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>

        {/* Fuera del ScrollView a propósito: sea cual sea el largo del
            contenido de arriba, esto siempre queda visible pegado abajo
            del panel, nunca se puede "salir" del cuadro blanco. */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
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
    // '90%' de `backdrop` (que sí tiene alto definido: llena toda la
    // pantalla). Con esto el ScrollView de adentro (que usa flex:1)
    // tiene un padre de alto REAL para repartir, no ambiguo -- si acá
    // hubiera ido maxHeight en vez de height, el panel pasaría a
    // "alto según contenido" y el flex:1 de adentro volvería a quedar
    // sin nada de dónde crecer (mismo problema que el de la cámara).
    height: '90%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: moderateScale(18),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  navButton: {
    paddingHorizontal: spacing.xl,
  },
});
