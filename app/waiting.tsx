import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useRoom } from '../src/contexts/RoomContext';
import { useSolo } from '../src/contexts/SoloContext';

export default function WaitingScreen() {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const { roomCode, partnerConnected, createRoom, leaveRoom, isLoading, error } = useRoom();
  const { startSession } = useSolo();

  // Si no hay sala creada aún, crear una automáticamente al entrar
  useEffect(() => {
    if (!roomCode && !isLoading) {
      createRoom().catch(() => {});
    }
  }, [roomCode, isLoading, createRoom]);

  // Cuando la pareja se conecta, inicializamos la baraja y pasamos a la pantalla de swipe
  useEffect(() => {
    if (!partnerConnected || !roomCode) {
      return;
    }
    startSession();
    const timer = setTimeout(() => {
      router.replace('/swipe');
    }, 1200);
    return () => clearTimeout(timer);
  }, [partnerConnected, roomCode, startSession, router]);

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

  const handleCancel = () => {
    leaveRoom();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Cabecera */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity
          onPress={handleCancel}
          style={[styles.backButton, { backgroundColor: colors.surface2, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: colors.text2 }]}>✕ Cancelar</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Modo Pareja</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Ícono / Avatar */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>{partnerConnected ? '💖' : '👶'}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {partnerConnected ? '¡Pareja Conectada!' : 'Sala de Espera'}
        </Text>

        <Text style={[styles.subtitle, { color: colors.text2 }]}>
          {partnerConnected
            ? '¡Todo listo! Entrando a la baraja de nombres...'
            : 'Comparte este código con tu pareja para sincronizar vuestras votaciones en tiempo real.'}
        </Text>

        {/* Tarjeta del Código de Sala */}
        <View
          style={[
            styles.codeCard,
            {
              backgroundColor: colors.surface,
              borderColor: partnerConnected ? colors.success : colors.border2,
            },
          ]}
        >
          <Text style={[styles.codeLabel, { color: colors.text3, fontSize: typography.fontSize.xs }]}>
            CÓDIGO DE SALA
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.salmon} style={{ marginVertical: 12 }} />
          ) : (
            <Text style={[styles.codeText, { color: colors.salmon }]}>
              {roomCode || '----'}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleShare}
            disabled={!roomCode}
            style={[styles.shareButton, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.shareButtonText, { color: colors.text }]}>
              📤 Compartir código
            </Text>
          </TouchableOpacity>
        </View>

        {/* Estado de conexión de la pareja */}
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: partnerConnected
                ? 'rgba(74, 222, 128, 0.12)'
                : colors.surface2,
              borderColor: partnerConnected ? colors.success : colors.border,
            },
          ]}
        >
          {!partnerConnected ? (
            <>
              <ActivityIndicator size="small" color={colors.salmon} style={{ marginRight: 10 }} />
              <Text style={[styles.statusText, { color: colors.text2 }]}>
                Esperando a que tu pareja se una...
              </Text>
            </>
          ) : (
            <Text style={[styles.statusText, { color: colors.success, fontWeight: '700' }]}>
              ✓ Tu pareja se ha conectado
            </Text>
          )}
        </View>

        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        )}
      </View>
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
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(232, 115, 90, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 28,
  },
  codeCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  codeLabel: {
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 6,
    marginVertical: 6,
  },
  shareButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 320,
    width: '100%',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 14,
    fontSize: 13,
    textAlign: 'center',
  },
});
