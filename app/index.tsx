import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useRoom } from '../src/contexts/RoomContext';

export default function Home() {
  const { colors, isDark, toggleTheme, spacing, typography } = useTheme();
  const router = useRouter();
  const { joinRoom, isLoading, error } = useRoom();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoinSubmit = async () => {
    setJoinError(null);
    const code = joinCodeInput.trim().toUpperCase();
    if (code.length !== 4) {
      setJoinError('El código debe tener 4 caracteres');
      return;
    }
    const success = await joinRoom(code);
    if (success) {
      setShowJoinModal(false);
      setJoinCodeInput('');
      router.push('/waiting');
    } else {
      setJoinError(error || 'No se pudo conectar a la sala');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Barra superior con selector de tema */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.md }]}>
        <View />
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.themeToggle,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.border2,
            },
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.themeToggleText, { color: colors.text }]}>
            {isDark ? '☀️ Claro' : '🌙 Oscuro'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido principal centrado */}
      <View style={[styles.mainContent, { paddingHorizontal: spacing.lg }]}>
        {/* Logo / Emblema central */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>👶</Text>
        </View>

        {/* Textos de Bienvenida */}
        <Text style={[styles.title, { color: colors.salmon }]}>BebéMatch</Text>
        <Text style={[styles.subtitle, { color: colors.text2 }]}>
          Descubre y elige el nombre de tu bebé en pareja o a tu propio ritmo
        </Text>

        {/* Los 3 Botones Principales */}
        <View style={styles.buttonsContainer}>
          {/* 1. Crear Sala */}
          <TouchableOpacity
            onPress={() => router.push('/waiting')}
            style={[styles.primaryButton, { backgroundColor: colors.salmon }]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Crear sala</Text>
            <Text style={styles.buttonHintLight}>Modo pareja · Crea código e invita</Text>
          </TouchableOpacity>

          {/* 2. Unirse a Sala */}
          <TouchableOpacity
            onPress={() => {
              setJoinError(null);
              setShowJoinModal(true);
            }}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.salmon,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.salmon }]}>
              Unirse a sala
            </Text>
            <Text style={[styles.buttonHint, { color: colors.text3 }]}>
              Introduce el código de tu pareja
            </Text>
          </TouchableOpacity>

          {/* 3. Modo Solitario */}
          <TouchableOpacity
            onPress={() => router.push('/setup')}
            style={[
              styles.tertiaryButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border2,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tertiaryButtonText, { color: colors.text }]}>
              Modo solitario
            </Text>
            <Text style={[styles.buttonHint, { color: colors.text3 }]}>
              Explora y guarda tus favoritos sin red
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pie sutil */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text3, fontSize: typography.fontSize.xs }]}>
          473 nombres seleccionados · Significados y curiosidades
        </Text>
      </View>

      {/* Modal para Unirse con Código */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border2,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Unirse a Sala</Text>
            <Text style={[styles.modalSubtitle, { color: colors.text2 }]}>
              Introduce el código de 4 caracteres que te compartió tu pareja:
            </Text>

            <TextInput
              value={joinCodeInput}
              onChangeText={(text) => setJoinCodeInput(text.toUpperCase())}
              placeholder="ABCD"
              placeholderTextColor={colors.text3}
              maxLength={4}
              autoCapitalize="characters"
              autoCorrect={false}
              style={[
                styles.inputCode,
                {
                  backgroundColor: colors.surface2,
                  borderColor: colors.border2,
                  color: colors.salmon,
                },
              ]}
            />

            {(joinError || error) && (
              <Text style={[styles.modalError, { color: colors.error }]}>
                {joinError || error}
              </Text>
            )}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowJoinModal(false)}
                style={[styles.modalButtonCancel, { backgroundColor: colors.surface2 }]}
              >
                <Text style={[styles.modalButtonCancelText, { color: colors.text2 }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleJoinSubmit}
                disabled={isLoading}
                style={[styles.modalButtonConfirm, { backgroundColor: colors.salmon }]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  themeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(232, 115, 90, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 36,
    maxWidth: 320,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 340,
    gap: 14,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  buttonHintLight: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  secondaryButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
  },
  buttonHint: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tertiaryButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputCode: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
    marginBottom: 12,
  },
  modalError: {
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
