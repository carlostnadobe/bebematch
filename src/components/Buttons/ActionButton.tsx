import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

export type ActionButtonType = 'like' | 'dislike' | 'undo';

export interface ActionButtonProps {
  type: ActionButtonType;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onPress,
  disabled = false,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const config = (() => {
    switch (type) {
      case 'like':
        return {
          icon: '♥',
          size: 64,
          fontSize: 28,
          bg: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(46, 158, 91, 0.12)',
          border: isDark ? 'rgba(74, 222, 128, 0.4)' : 'rgba(46, 158, 91, 0.35)',
          color: colors.success,
          accessibilityLabel: 'Me gusta',
        };
      case 'dislike':
        return {
          icon: '✕',
          size: 64,
          fontSize: 24,
          bg: isDark ? 'rgba(232, 115, 90, 0.15)' : 'rgba(212, 105, 79, 0.12)',
          border: isDark ? 'rgba(232, 115, 90, 0.4)' : 'rgba(212, 105, 79, 0.35)',
          color: colors.salmon,
          accessibilityLabel: 'Descartar',
        };
      case 'undo':
        return {
          icon: '↺',
          size: 48,
          fontSize: 20,
          bg: colors.surface2,
          border: colors.border2,
          color: colors.text2,
          accessibilityLabel: 'Deshacer',
        };
    }
  })();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityLabel={config.accessibilityLabel}
      style={[
        styles.button,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.bg,
          borderColor: config.border,
          opacity: disabled ? 0.4 : 1,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.25 : 0.1,
        },
        style,
      ]}
    >
      <Text style={[styles.iconText, { color: config.color, fontSize: config.fontSize }]}>
        {config.icon}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  iconText: {
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
