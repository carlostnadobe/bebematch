import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { borderRadius } from '../../theme/spacing';

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  count?: number;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  style,
  count,
}) => {
  const { colors, typography, isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? isDark
              ? 'rgba(232, 115, 90, 0.22)'
              : 'rgba(212, 105, 79, 0.15)'
            : colors.surface2,
          borderColor: selected ? colors.salmon : colors.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected ? colors.salmon : colors.text2,
            fontSize: typography.fontSize.sm,
            fontWeight: selected
              ? typography.fontWeight.bold
              : typography.fontWeight.medium,
          },
        ]}
      >
        {label}
        {count !== undefined && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 0.2,
  },
});
