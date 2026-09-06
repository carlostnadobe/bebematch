import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { HeartIcon, XIcon, RefreshIcon } from 'react-native-heroicons/solid';
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
          renderIcon: (color: string) => <HeartIcon size={30} color={color} />,
          size: 64,
          bg: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(46, 158, 91, 0.12)',
          border: isDark ? 'rgba(74, 222, 128, 0.4)' : 'rgba(46, 158, 91, 0.35)',
          color: colors.success,
          accessibilityLabel: 'Me gusta',
        };
      case 'dislike':
        return {
          renderIcon: (color: string) => <XIcon size={30} color={color} />,
          size: 64,
          bg: isDark ? 'rgba(232, 115, 90, 0.15)' : 'rgba(212, 105, 79, 0.12)',
          border: isDark ? 'rgba(232, 115, 90, 0.4)' : 'rgba(212, 105, 79, 0.35)',
          color: colors.salmon,
          accessibilityLabel: 'Descartar',
        };
      case 'undo':
        return {
          renderIcon: (color: string) => <RefreshIcon size={22} color={color} />,
          size: 48,
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
        },
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
  iconText: {
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
