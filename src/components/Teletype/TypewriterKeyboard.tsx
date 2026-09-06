import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  BadgeCheckIcon,
  XCircleIcon,
  ArrowDownIcon,
  RefreshIcon,
} from 'react-native-heroicons/solid';
import { useTheme } from '../../theme';

export interface TypewriterKeyboardProps {
  onStamp?: () => void;
  onUnstamp?: () => void;
  onHighlight?: () => void;
  onAdvance: () => void;
  onRewind?: () => void;
  isCurrentStamped?: boolean;
  canRewind?: boolean;
  disabled?: boolean;
}

export const TypewriterKeyboard: React.FC<TypewriterKeyboardProps> = ({
  onStamp,
  onUnstamp,
  onHighlight,
  onAdvance,
  onRewind,
  isCurrentStamped = false,
  canRewind = false,
  disabled = false,
}) => {
  const { colors, isDark } = useTheme();

  const handlePressStamp = onStamp || onHighlight;
  const handlePressUnstamp = onUnstamp || handlePressStamp;

  const keyBaseBg = isDark ? '#1C1C24' : '#F2EFEB';
  const keyBorder = isDark ? '#333342' : '#C8C2B4';
  const rimColor = isDark ? '#2A2A38' : '#DBD5C8';

  return (
    <View style={styles.keyboardContainer}>
      {/* Tecla 1: Retroceder / Deshacer (⌫) */}
      <TouchableOpacity
        style={[
          styles.roundKey,
          {
            backgroundColor: keyBaseBg,
            borderColor: keyBorder,
            opacity: !canRewind || disabled ? 0.35 : 1,
          },
        ]}
        onPress={onRewind}
        disabled={!canRewind || disabled}
        activeOpacity={0.7}
        accessibilityLabel="Retroceder cinta"
      >
        <View style={[styles.innerKeyRim, { borderColor: rimColor }]}>
          <RefreshIcon size={18} color={colors.text2} />
        </View>
        <Text style={[styles.keyLegend, { color: colors.text3 }]}>Retroceso</Text>
      </TouchableOpacity>

      {/* Tecla 2: Avanzar Carro / Rodillo (⏎) */}
      <TouchableOpacity
        style={[
          styles.advanceBarKey,
          {
            backgroundColor: keyBaseBg,
            borderColor: keyBorder,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
        onPress={onAdvance}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityLabel="Avanzar rollo sin sellar"
      >
        <View style={styles.advanceKeyContent}>
          <ArrowDownIcon size={16} color={colors.text} />
          <Text style={[styles.advanceKeyText, { color: colors.text }]}>
            Avanzar rollo
          </Text>
        </View>
        <Text style={[styles.keyLegend, { color: colors.text3 }]}>Paso de línea</Text>
      </TouchableOpacity>

      {/* Tecla 3: Seleccionar / Deseleccionar */}
      <TouchableOpacity
        style={[
          styles.highlightKey,
          {
            backgroundColor: isCurrentStamped
              ? (isDark ? '#2B1E22' : '#FCEEED')
              : colors.salmon,
            borderColor: isCurrentStamped ? colors.salmon : '#D45D44',
            opacity: disabled ? 0.4 : 1,
          },
        ]}
        onPress={isCurrentStamped ? handlePressUnstamp : handlePressStamp}
        disabled={disabled}
        activeOpacity={0.75}
        accessibilityLabel={isCurrentStamped ? 'Deseleccionar y quitar sello' : 'Sellar como seleccionado'}
      >
        <View style={styles.highlightKeyContent}>
          {isCurrentStamped ? (
            <XCircleIcon size={19} color={colors.salmon} />
          ) : (
            <BadgeCheckIcon size={19} color="#FFFFFF" />
          )}
          <Text
            style={[
              styles.highlightKeyText,
              { color: isCurrentStamped ? colors.salmon : '#FFFFFF' },
            ]}
          >
            {isCurrentStamped ? 'Deseleccionar' : 'Seleccionar'}
          </Text>
        </View>
        <Text
          style={[
            styles.highlightKeyLegend,
            { color: isCurrentStamped ? colors.salmon : colors.text3 },
          ]}
        >
          {isCurrentStamped ? 'Quitar sello' : 'Estampar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  roundKey: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  innerKeyRim: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLegend: {
    position: 'absolute',
    bottom: -16,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  advanceBarKey: {
    flex: 1,
    maxWidth: 145,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  advanceKeyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  advanceKeyText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  highlightKey: {
    flex: 1,
    maxWidth: 145,
    height: 58,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#E8735A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  highlightKeyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  highlightKeyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  highlightKeyLegend: {
    position: 'absolute',
    bottom: -16,
    fontSize: 9,
    fontWeight: '800',
    color: '#E8735A',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
