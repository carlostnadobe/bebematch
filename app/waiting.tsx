import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useRoom } from '../src/contexts/RoomContext';
import { useSolo } from '../src/contexts/SoloContext';
import { ConfirmExitModal } from '../src/components';

export default function WaitingScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const {
    roomCode,
    isHost,
    partnerConnected,
    roomFilters,
    roomSeed,
    leaveRoom,
    isLoading,
    error,
  } = useRoom();
  const { startSession } = useSolo();

  const [copied, setCopied] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const hasNavigatedRef = useRef(false);

  // Transición 1 (Host): Cuando el guest se conecta, el host avanza automáticamente a /setup
  useEffect(() => {
    if (hasNavigatedRef.current) return;
    if (isHost && partnerConnected) {
      hasNavigatedRef.current = true;
      router.replace('/setup');
    }
  }, [isHost, partnerConnected, router]);

  // Transición 2 (Guest): Cuando el host publica los filtros, el guest entra a /swipe con la misma baraja
  useEffect(() => {
    if (hasNavigatedRef.current) return;
    if (!isHost && roomFilters) {
      hasNavigatedRef.current = true;
      startSession(roomFilters, roomSeed ?? undefined);
      router.replace('/swipe');
    }
  }, [isHost, roomFilters, roomSeed, startSession, router]);

  const handleCopyCode = async () => {
    if (!roomCode) return;
    await Clipboard.setStringAsync(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!roomCode) return;
    try {
      await Share.share({
        message: `👶 ¡Únete a mi sala de BebéMatch con el código: ${roomCode} y elijamos el nombre de nuestro bebé juntos!`,
      });
    } catch (err) {
      console.warn('Error al compartir:', err);
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    leaveRoom();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Cabecera */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={[
            styles.backButton,
            { backgroundColor: colors.surface2, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: colors.text2 }]}>
            ← Volver al inicio
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Modo Pareja
        </Text>
        <View style={{ width: 100 }} />
      </View>

      <View style={[styles.content, { padding: spacing.lg }]}>
        {isHost ? (
          /* ================= PANTALLA DE ESPERA DEL HOST ================= */
          <View style={styles.cardContainer}>
            {/* Estado con punto verde pulsante */}
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: partnerConnected ? colors.success : '#22C55E' },
                ]}
              />
              <Text style={[styles.statusPillText, { color: colors.text }]}>
                {partnerConnected
                  ? '¡Pareja conectada! Redirigiendo a filtros…'
                  : 'Esperando a tu pareja...'}
              </Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              Tu código de sala
            </Text>

            {/* Código de sala en grande (serif) */}
            <View
              style={[
                styles.codeBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border2,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.salmon} />
              ) : (
                <Text
                  style={[
                    styles.codeText,
                    {
                      color: colors.salmon,
                      fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                    },
                  ]}
                >
                  {roomCode || '----'}
                </Text>
              )}
            </View>

            {/* Acciones de compartir / copiar */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                onPress={handleCopyCode}
                disabled={!roomCode}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  {copied ? '✓ ¡Copiado!' : '📋 Copiar código'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                disabled={!roomCode}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  📤 Compartir
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.instructionsText, { color: colors.text2 }]}>
              Comparte el código con tu pareja para empezar juntos.
            </Text>

            {!partnerConnected && (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.salmon} />
                <Text style={[styles.loadingHint, { color: colors.text3 }]}>
                  Detectando conexión automáticamente…
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* ================= PANTALLA DEL GUEST (ESPERANDO FILTROS) ================= */
          <View style={styles.cardContainer}>
            <View style={styles.statusPill}>
              <View style={[styles.dot, { backgroundColor: colors.salmon }]} />
              <Text style={[styles.statusPillText, { color: colors.text }]}>
                Esperando filtros...
              </Text>
            </View>

            <Text style={styles.emojiHero}>👀</Text>

            <Text style={[styles.title, { color: colors.text }]}>
              Estate al loro 👀
            </Text>

            <Text style={[styles.guestMessage, { color: colors.text2 }]}>
              Tu pareja ha creado la sala y está eligiendo el sexo y el origen de los nombres con los que vais a jugar.
            </Text>

            <Text style={[styles.guestPunchline, { color: colors.salmon }]}>
              ¡Que no te la líe!
            </Text>

            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.salmon} />
              <Text style={[styles.loadingHint, { color: colors.text3 }]}>
                Conectado a sala {roomCode}. Esperando a que el host inicie…
              </Text>
            </View>
          </View>
        )}

        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        )}
      </View>

      {/* Modal de confirmación al salir */}
      <ConfirmExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
        isPairMode={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emojiHero: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeBox: {
    width: '100%',
    paddingVertical: 24,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  codeText: {
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  guestMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  guestPunchline: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  loadingHint: {
    fontSize: 13,
  },
  errorText: {
    marginTop: 16,
    fontSize: 13,
    textAlign: 'center',
  },
});
