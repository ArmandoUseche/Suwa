import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '../components/PressableScale';
import ViewfinderFrame from '../components/ViewfinderFrame';
import ConsejosSheet from '../components/ConsejosSheet';
import { PrimaryButton } from '../components/Buttons';
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

const FRAME_SIZE = moderateScale(260);

// Cámara real de Escanear (Paso 7): interfaz propia de SUWA sobre la
// cámara del sistema (CameraView de expo-camera), no la app de cámara
// nativa. Flujo:
//  1. Pide permiso de cámara (si falta) -- pantalla de permiso propia,
//     no el diálogo pelado del sistema.
//  2. Cámara con overlay: X (cerrar), flash + voltear cámara arriba;
//     recuadro guía + texto en el medio; galería, capturar y consejos
//     abajo.
//  3. "Consejos" es un overlay que sube ENCIMA de esta misma pantalla
//     (no navega a otra ruta) -- ver ConsejosSheet. "Galería" abre el
//     selector nativo del sistema (expo-image-picker), no un overlay
//     propio -- ver el comentario más abajo sobre por qué.
//
// Lo que pasa DESPUÉS de tener una foto: se navega a ResultadoEscaneo
// con la foto como parámetro. La identificación de PlantNet ahí es mock
// por ahora (no hay API key todavía) -- cuando se conecte la real, esta
// pantalla y el flujo no cambian, solo de dónde sale el resultado.
//
// La galería usa expo-image-picker (abre el selector nativo del
// sistema) en vez de una grilla propia -- expo-media-library (que sí
// hubiera permitido armar la grilla igual al mockup) no viene incluido
// en Expo Go, así que no se podía probar. Si más adelante pasás a un
// development build para la sustentación final, se puede cambiar a la
// grilla propia.
export default function EscanearCameraScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [showConsejos, setShowConsejos] = useState(false);

  const handleCapturar = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    navigation.navigate('ResultadoEscaneo', { fotoUri: photo.uri });
  };

  const handleAbrirGaleria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (resultado.canceled) return;

    navigation.navigate('ResultadoEscaneo', { fotoUri: resultado.assets[0].uri });
  };

  // Sin permiso todavía: pantalla propia (no el diálogo pelado del
  // sistema) pidiendo el permiso antes de intentar mostrar la cámara.
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconWrapper}>
          <Ionicons name="camera-outline" size={moderateScale(48)} color={colors.primary} />
        </View>
        <Text style={styles.permissionTitle}>Necesitamos acceder a tu cámara</Text>
        <Text style={styles.permissionDescription}>
          SUWA usa la cámara para identificar tu planta. Solo se usa
          mientras estás escaneando, nunca en segundo plano.
        </Text>
        <PrimaryButton
          label="Dar permiso"
          onPress={requestPermission}
          style={styles.permissionButton}
        />
        <PressableScale onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
          <Text style={styles.permissionCancel}>Cancelar</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />

      {/* IMPORTANTE: este overlay NO es position:absolute. CameraView sí
          lo es (absoluteFill), así que queda afuera del flujo normal --
          eso deja a `overlay` como el ÚNICO hijo de flujo normal de
          `container` (que es flex:1), así que `overlay` recibe TODO el
          alto de la pantalla con un flex:1 directo, sin depender de que
          un position:absolute sin top/left se centre "solo" (esa
          combinación es la que venía fallando: colapsaba arriba en vez
          de estirarse). CameraView, al ser absolute, no ocupa espacio
          de flujo, pero se sigue viendo detrás de `overlay` porque se
          dibuja primero (el orden en el JSX es el orden de apilado). */}
      <View style={styles.overlay}>
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <PressableScale onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="close" size={moderateScale(28)} color="#FFFFFF" />
          </PressableScale>
          <View style={styles.topBarRight}>
            <PressableScale
              onPress={() => setFlash((f) => (f === 'off' ? 'on' : 'off'))}
              hitSlop={12}
              style={styles.topBarIconSpacing}
            >
              <Ionicons
                name={flash === 'on' ? 'flash' : 'flash-off'}
                size={moderateScale(24)}
                color="#FFFFFF"
              />
            </PressableScale>
            <PressableScale
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
              hitSlop={12}
            >
              <Ionicons name="camera-reverse" size={moderateScale(26)} color="#FFFFFF" />
            </PressableScale>
          </View>
        </View>

        <View style={styles.centerGuide} pointerEvents="none">
          <ViewfinderFrame size={FRAME_SIZE} />
          <Text style={styles.guideText}>Coloca la planta dentro del recuadro</Text>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
          {/* Antes galería y "Consejos" iban sueltos con
              justifyContent:'space-between' -- pero "Consejos" (ícono +
              texto) pesa más que el ícono solo de galería, así que el
              botón de capturar quedaba centrado respecto al espacio
              que sobraba entre los dos, no respecto al centro real de
              la pantalla. Envolviendo los 2 costados en cajas de ancho
              IGUAL (flex:1 cada una) el del medio siempre cae en el
              centro real, sea cual sea el ancho de pantalla. */}
          <View style={styles.bottomBarSide}>
            <PressableScale onPress={handleAbrirGaleria} hitSlop={12}>
              <Ionicons name="images-outline" size={moderateScale(26)} color="#FFFFFF" />
            </PressableScale>
          </View>

          <PressableScale onPress={handleCapturar} scaleTo={0.9}>
            <View style={styles.captureOuter}>
              <View style={styles.captureInner} />
            </View>
          </PressableScale>

          <View style={[styles.bottomBarSide, styles.bottomBarSideRight]}>
            <PressableScale onPress={() => setShowConsejos(true)} hitSlop={12} style={styles.consejosButton}>
              <Ionicons name="help-circle-outline" size={moderateScale(22)} color="#FFFFFF" />
              <Text style={styles.consejosLabel}>Consejos</Text>
            </PressableScale>
          </View>
        </View>
      </View>

      <ConsejosSheet visible={showConsejos} onClose={() => setShowConsejos(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  permissionIconWrapper: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    ...typography.h2,
    fontSize: moderateScale(22),
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  permissionDescription: {
    ...typography.body,
    fontSize: moderateScale(16),
    lineHeight: moderateScale(23),
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    alignSelf: 'stretch',
    paddingVertical: spacing.md + 2,
  },
  permissionCancel: {
    ...typography.body,
    fontSize: moderateScale(15),
    color: colors.textMuted,
  },
  // Overlay en columna sobre la cámara -- flex:1 normal, SIN
  // position:absolute (ver comentario en el JSX de más arriba sobre por
  // qué: con position:absolute colapsaba arriba en vez de estirarse).
  overlay: {
    flex: 1,
    flexDirection: 'column',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarIconSpacing: {
    marginRight: spacing.lg,
  },
  centerGuide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideText: {
    ...typography.body,
    color: '#FFFFFF',
    marginTop: spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  // flex:1 en los 2 costados: mismo ancho entre sí siempre, así el
  // botón de capturar (que no tiene flex, tamaño fijo) queda
  // matemáticamente en el centro real de la fila, no en el centro de
  // "lo que sobra" entre 2 elementos de tamaños distintos.
  bottomBarSide: {
    flex: 1,
  },
  bottomBarSideRight: {
    alignItems: 'flex-end',
  },
  captureOuter: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: '#FFFFFF',
  },
  consejosButton: {
    alignItems: 'center',
    gap: 2,
  },
  consejosLabel: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: moderateScale(11),
  },
});
