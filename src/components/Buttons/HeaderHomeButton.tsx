import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { HomeIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../theme';

export interface HeaderHomeButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

export const HeaderHomeButton: React.FC<HeaderHomeButtonProps> = ({
  onPress,
  accessibilityLabel = 'Volver al inicio',
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: colors.surface2,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <HomeIcon size={20} color={colors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
