import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { IName } from '../../types';
import { CardName } from './CardName';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export interface SwipeableCardDeckProps {
  currentCard: IName | null;
  nextCard: IName | null;
  partnerLiked?: boolean;
  nextPartnerLiked?: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export const SwipeableCardDeck: React.FC<SwipeableCardDeckProps> = ({
  currentCard,
  nextCard,
  partnerLiked = false,
  nextPartnerLiked = false,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const { colors } = useTheme();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Reiniciar posición cuando cambia la carta
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [currentCard, translateX, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.4; // Menos movimiento vertical
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        // Deslizar hacia la derecha (Me gusta)
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 250 }, () => {
          runOnJS(onSwipeRight)();
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Deslizar hacia la izquierda (Descartar)
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 250 }, () => {
          runOnJS(onSwipeLeft)();
        });
      } else {
        // Regresar a la posición inicial
        translateX.value = withSpring(0, { damping: 15, stiffness: 120 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [20, 100], [0, 1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ rotate: '-15deg' }],
    };
  });

  const nopeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [-100, -20], [1, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ rotate: '15deg' }],
    };
  });

  const nextCardAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.94, 1],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.65, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  if (!currentCard) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Carta siguiente en el fondo (profundidad visual) */}
      {nextCard && (
        <Animated.View style={[styles.cardWrapper, styles.backgroundCard, nextCardAnimatedStyle]}>
          <CardName item={nextCard} partnerLiked={nextPartnerLiked} />
        </Animated.View>
      )}

      {/* Carta activa principal con gestos */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardWrapper, styles.activeCard, cardAnimatedStyle]}>
          <CardName item={currentCard} partnerLiked={partnerLiked} />

          {/* Sello animado: ME GUSTA */}
          <Animated.View
            style={[
              styles.stamp,
              styles.likeStamp,
              { borderColor: colors.success },
              likeStampStyle,
            ]}
            pointerEvents="none"
          >
            <Text style={[styles.stampText, { color: colors.success }]}>ME GUSTA</Text>
          </Animated.View>

          {/* Sello animado: DESCARTAR */}
          <Animated.View
            style={[
              styles.stamp,
              styles.nopeStamp,
              { borderColor: colors.salmon },
              nopeStampStyle,
            ]}
            pointerEvents="none"
          >
            <Text style={[styles.stampText, { color: colors.salmon }]}>PASAR</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 520,
  },
  cardWrapper: {
    position: 'absolute',
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  activeCard: {
    zIndex: 10,
    elevation: 10,
  },
  backgroundCard: {
    zIndex: 1,
    elevation: 2,
  },
  stamp: {
    position: 'absolute',
    top: 36,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 3,
    zIndex: 10,
  },
  likeStamp: {
    left: 24,
  },
  nopeStamp: {
    right: 24,
  },
  stampText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
