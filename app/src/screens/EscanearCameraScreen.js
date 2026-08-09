import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '../components/PressableScale';
import ViewfinderFrame from '../components/ViewfinderFrame';
import ConsejosSheet from '../components/ConsejosSheet';
import GaleriaOverlay from '../components/GaleriaOverlay';
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
//  3. "Consejos" y "Galería" son overlays que suben/aparecen ENCIMA de
//     esta misma pantalla (no navegan a otra ruta) -- ver ConsejosSheet
//     y GaleriaOverlay.
//
// Lo que pasa DESPUÉS de tener una foto (mandarla a PlantNet y mostrar
// el resultado con % de coincidencia) todavía no está construido -- por
// ahora, al capturar o elegir una foto, se guarda en `fotoUri` como
// paso intermedio visible, listo para conectar el resultado en el
// siguiente paso.
export default function EscanearCameraScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [showConsejos, setShowConsejos] = useState(false);
  const [showGaleria, setShowGaleria] = useState(false);
  const [fotoUri, setFotoUri] = useState(null);

  const handleCapturar = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    setFotoUri(photo.uri);
    // TODO(paso 7, siguiente entrega): mandar photo.uri a PlantNet y
    // navegar al resultado con el % de coincidencia.
  };

  const handleElegirDeGaleria = (uri) => {
    setShowGaleria(false);
    setFotoUri(uri);
    // TODO(paso 7, siguiente entrega): mismo destino que handleCapturar.
  };

  // Sin permiso todavía: pantalla propia (no el diálogo pelado del
  // sistema) pidiendo el permiso antes de intentar mostrar la cámara.
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Ionicons name="camera-outline" size={moderateScale(56)} color={colors.primary} />
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
        <PressableScale onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }}>
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

      {/* Barra superior: X para volver, flash + voltear cámara. */}
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

      {/* Guía central: recuadro + instrucción. */}
      <View style={styles.centerGuide} pointerEvents="none">
        <ViewfinderFrame size={FRAME_SIZE} />
        <Text style={styles.guideText}>Coloca la planta dentro del recuadro</Text>
      </View>

      {/* Barra inferior: galería, capturar, consejos. */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <PressableScale onPress={() => setShowGaleria(true)} hitSlop={12}>
          <Ionicons name="images-outline" size={moderateScale(26)} color="#FFFFFF" />
        </PressableScale>

        <PressableScale onPress={handleCapturar} scaleTo={0.9}>
          <View style={styles.captureOuter}>
            <View style={styles.captureInner} />
          </View>
        </PressableScale>

        <PressableScale onPress={() => setShowConsejos(true)} hitSlop={12} style={styles.consejosButton}>
          <Ionicons name="help-circle-outline" size={moderateScale(22)} color="#FFFFFF" />
          <Text style={styles.consejosLabel}>Consejos</Text>
        </PressableScale>
      </View>

      <ConsejosSheet visible={showConsejos} onClose={() => setShowConsejos(false)} />
      <GaleriaOverlay
        visible={showGaleria}
        onClose={() => setShowGaleria(false)}
        onSelect={handleElegirDeGaleria}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  permissionTitle: {
    ...typography.h2,
    color: colors.textDark,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  permissionDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    alignSelf: 'stretch',
  },
  permissionCancel: {
    ...typography.body,
    color: colors.textMuted,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideText: {
    ...typography.body,
    color: '#FFFFFF',
    marginTop: FRAME_SIZE / 2 + spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
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
