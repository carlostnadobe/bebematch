import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { HeartIcon, XIcon, RefreshIcon, StarIcon } from 'react-native-heroicons/solid';
import { useTheme } from '../../theme';

export type ActionButtonType = 'like' | 'dislike' | 'undo' | 'top1';

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
      case 'top1':
        return {
          renderIcon: (color: string) => <StarIcon size={34} color={color} />,
          size: 72,
          bg: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.16)',
          border: isDark ? '#F59E0B' : '#D97706',
          color: '#F59E0B',
          accessibilityLabel: 'Top 1 Imprescindible',
          isGold: true,
        };
      case 'like':
        return {
          renderIcon: (color: string) => <HeartIcon size={28} color={color} />,
          size: 60,
          bg: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(46, 158, 91, 0.12)',
          border: isDark ? 'rgba(74, 222, 128, 0.4)' : 'rgba(46, 158, 91, 0.35)',
          color: colors.success,
          accessibilityLabel: 'Me gusta',
          isGold: false,
        };
      case 'dislike':
        return {
          renderIcon: (color: string) => <XIcon size={28} color={color} />,
          size: 60,
          bg: isDark ? 'rgba(232, 115, 90, 0.15)' : 'rgba(212, 105, 79, 0.12)',
          border: isDark ? 'rgba(232, 115, 90, 0.4)' : 'rgba(212, 105, 79, 0.35)',
          color: colors.salmon,
          accessibilityLabel: 'Paso',
          isGold: false,
        };
      case 'undo':
        return {
          renderIcon: (color: string) => <RefreshIcon size={22} color={color} />,
          size: 46,
          bg: colors.surface2,
          border: colors.border2,
          color: colors.text2,
          accessibilityLabel: 'Deshacer',
          isGold: false,
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
        },
        config.isGold && styles.goldButton,
        style,
      ]}
    >
      {config.renderIcon(config.color)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldButton: {
    borderWidth: 2,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  iconText: {
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
