import {
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

export interface SwipeableCardDeckRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  swipeUp: () => void;
}

export interface SwipeableCardDeckProps {
  currentIndex?: number;
  currentCard: IName | null;
  nextCard: IName | null;
  thirdCard?: IName | null;
  partnerLiked?: boolean;
  nextPartnerLiked?: boolean;
  thirdPartnerLiked?: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp?: () => void;
}

export const SwipeableCardDeck = forwardRef<SwipeableCardDeckRef, SwipeableCardDeckProps>(
  (
    {
      currentIndex = 0,
      currentCard,
      nextCard,
      thirdCard = null,
      partnerLiked = false,
      nextPartnerLiked = false,
      thirdPartnerLiked = false,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
    },
    ref
  ) => {
    const { colors, isDark } = useTheme();

    const activeSlot = useSharedValue(currentIndex % 3);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Sincronizar slot activo cuando cambia currentIndex externamente
    useEffect(() => {
      activeSlot.value = currentIndex % 3;
      translateX.value = 0;
      translateY.value = 0;
    }, [currentIndex, activeSlot, translateX, translateY]);

    // Métodos expuestos para los botones inferiores
    useImperativeHandle(
      ref,
      () => ({
        swipeLeft: () => {
          translateX.value = withTiming(
            -SCREEN_WIDTH * 1.5,
            { duration: 200 },
            (finished) => {
              'worklet';
              if (finished) {
                translateX.value = 0;
                translateY.value = 0;
                activeSlot.value = (activeSlot.value + 1) % 3;
                runOnJS(onSwipeLeft)();
              }
            }
          );
        },
        swipeRight: () => {
          translateX.value = withTiming(
            SCREEN_WIDTH * 1.5,
            { duration: 200 },
            (finished) => {
              'worklet';
              if (finished) {
                translateX.value = 0;
                translateY.value = 0;
                activeSlot.value = (activeSlot.value + 1) % 3;
                runOnJS(onSwipeRight)();
              }
            }
          );
        },
        swipeUp: () => {
          translateY.value = withTiming(
            -SCREEN_HEIGHT * 0.8,
            { duration: 200 },
            (finished) => {
              'worklet';
              if (finished) {
                translateX.value = 0;
                translateY.value = 0;
                activeSlot.value = (activeSlot.value + 1) % 3;
                if (onSwipeUp) {
                  runOnJS(onSwipeUp)();
                } else {
                  runOnJS(onSwipeLeft)();
                }
              }
            }
          );
        },
      }),
      [onSwipeLeft, onSwipeRight, onSwipeUp, translateX, translateY, activeSlot]
    );

    // Gesto táctil Pan en el contenedor
    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        'worklet';
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.5;
      })
      .onEnd(() => {
        'worklet';
        if (translateX.value > SWIPE_THRESHOLD) {
          translateX.value = withTiming(
            SCREEN_WIDTH * 1.5,
            { duration: 200 },
            (finished) => {
              'worklet';
              if (finished) {
                translateX.value = 0;
                translateY.value = 0;
                activeSlot.value = (activeSlot.value + 1) % 3;
                runOnJS(onSwipeRight)();
              }
            }
          );
        } else if (translateX.value < -SWIPE_THRESHOLD) {
          translateX.value = withTiming(
            -SCREEN_WIDTH * 1.5,
            { duration: 200 },
            (finished) => {
              'worklet';
              if (finished) {
                translateX.value = 0;
                translateY.value = 0;
                activeSlot.value = (activeSlot.value + 1) % 3;
                runOnJS(onSwipeLeft)();
              }
            }
          );
        } else if (translateY.value < -SWIPE_THRESHOLD * 1.4) {
          translateY.value = withTiming(
            -SCREEN_HEIGHT * 0.8,
            { duration: 200 },
            (finished) => {
              'worklet';
              if (finished) {
                translateX.value = 0;
                translateY.value = 0;
                activeSlot.value = (activeSlot.value + 1) % 3;
                if (onSwipeUp) {
                  runOnJS(onSwipeUp)();
                } else {
                  runOnJS(onSwipeLeft)();
                }
              }
            }
          );
        } else {
          translateX.value = withSpring(0, { damping: 16, stiffness: 140 });
          translateY.value = withSpring(0, { damping: 16, stiffness: 140 });
        }
      });

    // Creador de estilos animados para cada slot de la pila
    const createSlotStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        const isTop = activeSlot.value === slotIndex;
        const isMiddle = (activeSlot.value + 1) % 3 === slotIndex;

        if (isTop) {
          const rotate = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-10, 0, 10],
            Extrapolation.CLAMP
          );
          return {
            transform: [
              { translateX: translateX.value },
              { translateY: translateY.value },
              { rotate: `${rotate}deg` },
            ],
            zIndex: 10,
            opacity: 1,
          };
        }

        if (isMiddle) {
          const dragProgress = Math.min(
            1,
            (Math.abs(translateX.value) + Math.abs(translateY.value)) / SWIPE_THRESHOLD
          );
          const scale = interpolate(dragProgress, [0, 1], [0.95, 1], Extrapolation.CLAMP);
          const translateYPos = interpolate(dragProgress, [0, 1], [10, 0], Extrapolation.CLAMP);
          const opacity = interpolate(dragProgress, [0, 1], [0.88, 1], Extrapolation.CLAMP);
          return {
            transform: [{ scale }, { translateY: translateYPos }],
            zIndex: 5,
            opacity,
          };
        }

        // isBottom
        const dragProgress = Math.min(
          1,
          (Math.abs(translateX.value) + Math.abs(translateY.value)) / SWIPE_THRESHOLD
        );
        const scale = interpolate(dragProgress, [0, 1], [0.90, 0.95], Extrapolation.CLAMP);
        const translateYPos = interpolate(dragProgress, [0, 1], [20, 10], Extrapolation.CLAMP);
        const opacity = interpolate(dragProgress, [0, 1], [0.65, 0.88], Extrapolation.CLAMP);
        return {
          transform: [{ scale }, { translateY: translateYPos }],
          zIndex: 1,
          opacity,
        };
      });
    };

    const slot0Style = createSlotStyle(0);
    const slot1Style = createSlotStyle(1);
    const slot2Style = createSlotStyle(2);

    // 1. Resplandor (Glow) del borde y fondo de la tarjeta al arrastrar
    const createGlowStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        if (activeSlot.value !== slotIndex) {
          return { opacity: 0 };
        }
        if (translateX.value > 0) {
          const opacity = interpolate(translateX.value, [10, 100], [0, 1], Extrapolation.CLAMP);
          return {
            opacity,
            borderColor: colors.salmon,
            backgroundColor: colors.salmonLight,
          };
        } else {
          const opacity = interpolate(translateX.value, [-100, -10], [1, 0], Extrapolation.CLAMP);
          return {
            opacity,
            borderColor: colors.border2,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
          };
        }
      });
    };

    const slot0Glow = createGlowStyle(0);
    const slot1Glow = createGlowStyle(1);
    const slot2Glow = createGlowStyle(2);

    // Mapeo estable de cartas a slots rotativos (la carta visible NUNCA cambia su contenido)
    const getSlotData = (slotIndex: number) => {
      const top = currentIndex % 3;
      const middle = (currentIndex + 1) % 3;
      const bottom = (currentIndex + 2) % 3;

      if (slotIndex === top) {
        return { card: currentCard, liked: partnerLiked };
      }
      if (slotIndex === middle) {
        return { card: nextCard, liked: nextPartnerLiked };
      }
      if (slotIndex === bottom) {
        return { card: thirdCard, liked: thirdPartnerLiked };
      }
      return { card: null, liked: false };
    };

    const slot0Data = getSlotData(0);
    const slot1Data = getSlotData(1);
    const slot2Data = getSlotData(2);

    if (!currentCard) {
      return null;
    }

    return (
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          {/* Slot 0 */}
          {slot0Data.card && (
            <Animated.View style={[styles.cardWrapper, slot0Style]}>
              <CardName item={slot0Data.card} partnerLiked={slot0Data.liked} />
              <Animated.View style={[styles.glowBorder, slot0Glow]} pointerEvents="none" />
            </Animated.View>
          )}

          {/* Slot 1 */}
          {slot1Data.card && (
            <Animated.View style={[styles.cardWrapper, slot1Style]}>
              <CardName item={slot1Data.card} partnerLiked={slot1Data.liked} />
              <Animated.View style={[styles.glowBorder, slot1Glow]} pointerEvents="none" />
            </Animated.View>
          )}

          {/* Slot 2 */}
          {slot2Data.card && (
            <Animated.View style={[styles.cardWrapper, slot2Style]}>
              <CardName item={slot2Data.card} partnerLiked={slot2Data.liked} />
              <Animated.View style={[styles.glowBorder, slot2Glow]} pointerEvents="none" />
            </Animated.View>
          )}
        </View>
      </GestureDetector>
    );
  }
);

SwipeableCardDeck.displayName = 'SwipeableCardDeck';

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
    alignItems: 'center',
  },
  activeCard: {
    zIndex: 10,
    elevation: 10,
  },
  backgroundCard: {
    zIndex: 5,
    elevation: 5,
  },
  thirdCard: {
    zIndex: 1,
    elevation: 2,
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: Math.min(SCREEN_WIDTH * 0.9, 360),
    borderRadius: 24,
    borderWidth: 2.5,
    zIndex: 12,
  },
});
