import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';

interface ConfirmExitModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isPairMode?: boolean;
}

export const ConfirmExitModal: React.FC<ConfirmExitModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  isPairMode = false,
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialogCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border2,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>¿Volver al inicio?</Text>
          <Text style={[styles.message, { color: colors.text2 }]}>
            {isPairMode
              ? 'Si tu pareja sigue jugando se desconectará de tu sesión. Los matches se perderán.'
              : '¿Deseas volver a la pantalla principal? Se perderá el progreso de esta baraja.'}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onCancel}
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: colors.surface2, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text2 }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.button, styles.confirmButton, { backgroundColor: colors.error }]}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {},
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
