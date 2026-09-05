import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = ['#E8735A', '#9B6FA1', '#4ADE80', '#FCD34D', '#60A5FA', '#FF6B9D'];
const NUM_CONFETTI = 40;

interface ConfettiPieceProps {
  index: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ index }) => {
  const startX = Math.random() * SCREEN_WIDTH;
  const size = Math.random() * 8 + 6;
  const isCircle = index % 3 === 0;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const duration = 2200 + Math.random() * 800;
  const delay = Math.random() * 400;

  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotateZ = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT * 0.85, {
        duration,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      })
    );

    const swayOffset = (Math.random() - 0.5) * 80;
    translateX.value = withDelay(
      delay,
      withTiming(startX + swayOffset, {
        duration,
        easing: Easing.inOut(Easing.quad),
      })
    );

    rotateZ.value = withDelay(
      delay,
      withTiming(Math.random() * 720 - 360, {
        duration,
        easing: Easing.linear,
      })
    );

    opacity.value = withDelay(
      delay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  }, [delay, duration, opacity, rotateZ, startX, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotateZ.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: size,
          height: isCircle ? size : size * 1.6,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export const ConfettiEffect: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: NUM_CONFETTI }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 99,
  },
  piece: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
