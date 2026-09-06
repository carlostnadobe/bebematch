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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SunIcon, MoonIcon, ArrowRightIcon } from 'react-native-heroicons/outline';
import { UserGroupIcon, UserIcon } from 'react-native-heroicons/solid';
import { useTheme } from '../src/theme';
import { useRoom } from '../src/contexts/RoomContext';

const VALID_CODE_REGEX = /^[A-Z2-9]*$/;

export default function Home() {
  const { colors, isDark, toggleTheme, spacing, typography } = useTheme();
  const router = useRouter();
  const {
    createRoom,
    joinRoom,
    error,
    savedRoomCode,
    clearSavedRoom,
  } = useRoom();

  const [joinCode, setJoinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(Boolean(savedRoomCode));

  const handleCodeChange = (text: string) => {
    const uppercase = text.toUpperCase().trim();
    // Filtrar caracteres válidos (A-Z y 2-9 sin ambigüedades)
    if (VALID_CODE_REGEX.test(uppercase) && uppercase.length <= 4) {
      setJoinCode(uppercase);
      setErrorMessage(null);
    }
  };

  const handleCreateRoom = async () => {
    setErrorMessage(null);
    setIsCreating(true);
    try {
      await createRoom();
      router.push('/waiting');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creando sala';
      setErrorMessage(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (targetCode?: string) => {
    const code = (targetCode || joinCode).trim().toUpperCase();
    if (code.length !== 4) {
      setErrorMessage('El código debe tener 4 caracteres');
      return;
    }
    setErrorMessage(null);
    setIsJoining(true);
    const success = await joinRoom(code);
    setIsJoining(false);
    if (success) {
      if (showResumeModal) setShowResumeModal(false);
      router.push('/waiting');
    } else {
      setErrorMessage(error || 'Sala no encontrada. ¿El código es correcto?');
    }
  };

  const handleSolo = () => {
    router.push('/setup?mode=solo');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {isDark ? (
                  <SunIcon size={16} color={colors.text} />
                ) : (
                  <MoonIcon size={16} color={colors.text} />
                )}
                <Text style={[styles.themeToggleText, { color: colors.text }]}>
                  {isDark ? 'Claro' : 'Oscuro'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Contenido principal centrado */}
          <View style={[styles.mainSection, { paddingHorizontal: spacing.lg }]}>
            {/* Logo y Encabezado según especificación */}
            <View style={styles.brandContainer}>
              <Text style={[styles.brandTitle, { color: colors.salmon }]}>
                bebématch
              </Text>
              <Text style={[styles.brandByline, { color: colors.text3 }]}>
                BY CARLOS TN
              </Text>
              <Text style={[styles.brandTagline, { color: colors.text2 }]}>
                encontrad juntos el nombre perfecto
              </Text>
            </View>

            {/* Acciones principales */}
            <View style={styles.actionsContainer}>
              {/* Botón primario: Crear sala nueva */}
              <TouchableOpacity
                onPress={handleCreateRoom}
                disabled={isCreating || isJoining}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.salmon },
                ]}
                activeOpacity={0.8}
              >
                {isCreating ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Conectando…</Text>
                  </View>
                ) : (
                  <View style={styles.buttonInnerRow}>
                    <UserGroupIcon size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Crear sala nueva</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Botón secundario: Modo un jugador */}
              <TouchableOpacity
                onPress={handleSolo}
                disabled={isCreating || isJoining}
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border2,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.buttonInnerRow}>
                  <UserIcon size={18} color={colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    Modo un jugador
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Separador */}
              <View style={styles.separatorContainer}>
                <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.separatorText, { color: colors.text3 }]}>
                  o únete a una sala
                </Text>
                <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Campo directo de código de sala + Botón Unirse (especificación directa sin modal) */}
              <View style={styles.joinInputRow}>
                <TextInput
                  value={joinCode}
                  onChangeText={handleCodeChange}
                  placeholder="CÓDIGO"
                  placeholderTextColor={colors.text3}
                  maxLength={4}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={[
                    styles.joinInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border2,
                      color: colors.text,
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => handleJoin()}
                  disabled={joinCode.length !== 4 || isJoining}
                  style={[
                    styles.joinButton,
                    {
                      backgroundColor:
                        joinCode.length === 4 ? colors.salmon : colors.surface2,
                      borderColor:
                        joinCode.length === 4 ? colors.salmon : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  {isJoining ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={styles.buttonInnerRow}>
                      <Text
                        style={[
                          styles.joinButtonText,
                          {
                            color:
                              joinCode.length === 4 ? '#FFFFFF' : colors.text3,
                          },
                        ]}
                      >
                        Unirse
                      </Text>
                      <ArrowRightIcon
                        size={16}
                        color={joinCode.length === 4 ? '#FFFFFF' : colors.text3}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Mensaje de error si falla la unión */}
              {errorMessage && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errorMessage}
                </Text>
              )}

              {/* Nota explicativa inferior */}
              <Text style={[styles.helperNote, { color: colors.text3 }]}>
                Dos personas pueden conectarse desde cualquier dispositivo usando el mismo código de sala
              </Text>
            </View>
          </View>

          {/* Pie de página sutil */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: colors.text3, fontSize: typography.fontSize.xs },
              ]}
            >
              473 nombres seleccionados · Significados y curiosidades
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de reanudar sala si hay una sala activa guardada */}
      {savedRoomCode && (
        <Modal
          visible={showResumeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowResumeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border2,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                ¿Volver a tu sala?
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.text2 }]}>
                Tienes una partida en curso con el código:
              </Text>
              <Text style={[styles.modalCode, { color: colors.salmon }]}>
                {savedRoomCode}
              </Text>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  onPress={() => {
                    clearSavedRoom();
                    setShowResumeModal(false);
                  }}
                  style={[
                    styles.modalButtonCancel,
                    { backgroundColor: colors.surface2, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.modalButtonCancelText, { color: colors.text2 }]}>
                    Nueva sala
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleJoin(savedRoomCode)}
                  disabled={isJoining}
                  style={[
                    styles.modalButtonConfirm,
                    { backgroundColor: colors.salmon },
                  ]}
                >
                  {isJoining ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <View style={styles.buttonInnerRow}>
                      <Text style={styles.modalButtonConfirmText}>Volver</Text>
                      <ArrowRightIcon size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  topBar: {
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
  mainSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  brandTitle: {
    fontSize: 48,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontWeight: '600',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandByline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  brandTagline: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsContainer: {
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    fontSize: 12,
    marginHorizontal: 12,
    textTransform: 'lowercase',
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 12,
  },
  joinInput: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
  },
  joinButton: {
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  helperNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  footer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalCode: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
