import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { SparklesIcon } from 'react-native-heroicons/solid';
import { IName } from '../../types';
import { useTheme } from '../../theme';
import { ConfettiEffect } from './ConfettiEffect';

export interface MatchModalProps {
  match: IName | null;
  onClose: () => void;
  onViewList?: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ match, onClose, onViewList }) => {
  const { colors, isDark } = useTheme();

  if (!match) return null;

  const isGirl = match.g === 'girl';
  const isBoy = match.g === 'boy';
  const genderLabel = isGirl ? 'Niña' : isBoy ? 'Niño' : 'Unisex';
  const genderColor = isGirl
    ? colors.salmon
    : isBoy
    ? isDark
      ? '#60A5FA'
      : '#2563EB'
    : isDark
    ? '#A78BFA'
    : '#7E22CE';

  return (
    <Modal
      visible={Boolean(match)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ConfettiEffect />
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border2,
            },
          ]}
        >
          {/* Cabecera festiva */}
          <View
            style={[
              styles.celebrationBadge,
              { backgroundColor: colors.salmonLight, borderColor: colors.salmon },
            ]}
          >
            <SparklesIcon size={36} color={colors.salmon} />
          </View>

          <Text style={[styles.title, { color: colors.salmon }]}>¡ES UN MATCH!</Text>
          <Text style={[styles.subtitle, { color: colors.text2 }]}>
            ¡Los dos adoráis este nombre para vuestro bebé!
          </Text>

          {/* Tarjeta destacada del nombre del Match */}
          <View
            style={[
              styles.nameBox,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.genderBadge,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    borderColor: genderColor,
                  },
                ]}
              >
                <Text style={[styles.genderText, { color: genderColor }]}>{genderLabel}</Text>
              </View>
              <Text style={[styles.originText, { color: colors.text3 }]}>
                {match.o.toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.matchName, { color: colors.text }]}>{match.n}</Text>

            <Text style={[styles.meaning, { color: colors.text2 }]}>
              &ldquo;{match.m}&rdquo;
            </Text>
          </View>

          {/* Botones de acción según especificación de pantalla 6 */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.continueButton, { backgroundColor: colors.salmon }]}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Seguir explorando</Text>
            </TouchableOpacity>

            {onViewList && (
              <TouchableOpacity
                onPress={onViewList}
                style={[
                  styles.viewListButton,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewListButtonText, { color: colors.text }]}>
                  Ver todos los matches
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(232, 115, 90, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  celebrationEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  nameBox: {
    width: '100%',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  genderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  originText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  matchName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  meaning: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  viewListButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewListButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
