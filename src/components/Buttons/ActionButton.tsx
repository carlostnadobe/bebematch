import React from 'react';
import { TouchableOpacity, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import { HeartIcon } from 'react-native-heroicons/solid';
import { ArrowRightIcon, RefreshIcon } from 'react-native-heroicons/outline';
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
  const { colors } = useTheme();

  const config = (() => {
    switch (type) {
      case 'like':
        return {
          renderIcon: (color: string) => <HeartIcon size={20} color={color} />,
          label: 'Me gusta',
          bg: colors.salmon,
          border: colors.salmon,
          color: '#FFFFFF',
          isPill: true,
          accessibilityLabel: 'Me gusta',
        };
      case 'dislike':
        return {
          renderIcon: (color: string) => <ArrowRightIcon size={18} color={color} />,
          label: 'Pasar',
          bg: colors.surface2,
          border: colors.border2,
          color: colors.text,
          isPill: true,
          accessibilityLabel: 'Pasar al siguiente nombre',
        };
      case 'undo':
        return {
          renderIcon: (color: string) => <RefreshIcon size={20} color={color} />,
          label: '',
          bg: colors.surface2,
          border: colors.border2,
          color: colors.text2,
          isPill: false,
          accessibilityLabel: 'Deshacer',
        };
    }
  })();

  if (!config.isPill) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityLabel={config.accessibilityLabel}
        accessibilityRole="button"
        style={[
          styles.circleButton,
          {
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
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityLabel={config.accessibilityLabel}
      accessibilityRole="button"
      style={[
        styles.pillButton,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {config.renderIcon(config.color)}
      <Text style={[styles.pillLabel, { color: config.color }]}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pillButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  pillLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
