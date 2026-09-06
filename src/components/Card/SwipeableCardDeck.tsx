import {
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
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
import { StarIcon } from 'react-native-heroicons/solid';
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
    const { colors } = useTheme();

    const activeSlot = useSharedValue(currentIndex % 3);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Sincronizar slot activo cuando cambia currentIndex externamente
    useEffect(() => {
      activeSlot.value = currentIndex % 3;
      translateX.value = 0;
      translateY.value = 0;
    }, [currentIndex, activeSlot, translateX, translateY]);

    // Métodos expuestos para los botones inferiores (Paso, Me gusta, Top 1)
    useImperativeHandle(
      ref,
      () => ({
        swipeLeft: () => {
          translateX.value = withTiming(
            -SCREEN_WIDTH * 1.5,
            { duration: 220 },
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
            { duration: 220 },
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
            -SCREEN_HEIGHT * 0.9,
            { duration: 240 },
            (finished) => {
              'worklet';
              if (finished) {
                translateX.value = 0;
                translateY.value = 0;
                activeSlot.value = (activeSlot.value + 1) % 3;
                if (onSwipeUp) {
                  runOnJS(onSwipeUp)();
                } else {
                  runOnJS(onSwipeRight)();
                }
              }
            }
          );
        },
      }),
      [onSwipeLeft, onSwipeRight, onSwipeUp, translateX, translateY, activeSlot]
    );

    // Gesto táctil Pan con detección en 3 direcciones (Izquierda: Paso, Derecha: Me gusta, Arriba: Top 1)
    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        'worklet';
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd(() => {
        'worklet';
        // 1. Arrastre hacia arriba: ⭐ Top 1 al Podio
        if (translateY.value < -SWIPE_THRESHOLD * 1.05 && Math.abs(translateY.value) > Math.abs(translateX.value) * 0.85) {
          translateY.value = withTiming(
            -SCREEN_HEIGHT * 0.9,
            { duration: 240 },
            (finished) => {
              'worklet';
              if (finished) {
                translateX.value = 0;
                translateY.value = 0;
                activeSlot.value = (activeSlot.value + 1) % 3;
                if (onSwipeUp) {
                  runOnJS(onSwipeUp)();
                } else {
                  runOnJS(onSwipeRight)();
                }
              }
            }
          );
        } else if (translateX.value > SWIPE_THRESHOLD) {
          // 2. Arrastre a la derecha: 👍 Me gusta (lista larga)
          translateX.value = withTiming(
            SCREEN_WIDTH * 1.5,
            { duration: 220 },
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
          // 3. Arrastre a la izquierda: 👎 Paso
          translateX.value = withTiming(
            -SCREEN_WIDTH * 1.5,
            { duration: 220 },
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
        } else {
          // Retorno elástico al centro
          translateX.value = withSpring(0, { damping: 16, stiffness: 140 });
          translateY.value = withSpring(0, { damping: 16, stiffness: 140 });
        }
      });

    // Creador de estilos animados para cada slot de la baraja
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

    // Resplandor dorado al elevar hacia el Podio
    const createGlowGoldStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        if (activeSlot.value !== slotIndex) {
          return { opacity: 0 };
        }
        if (translateY.value < -20 && Math.abs(translateY.value) > Math.abs(translateX.value) * 0.7) {
          const opacity = interpolate(translateY.value, [-20, -100], [0, 0.95], Extrapolation.CLAMP);
          return { opacity };
        }
        return { opacity: 0 };
      });
    };

    // Sellos visuales en tiempo real: ME GUSTA, PASO y ⭐ TOP 1
    const createStampStyle = (slotIndex: number, type: 'like' | 'nope' | 'top1') => {
      return useAnimatedStyle(() => {
        if (activeSlot.value !== slotIndex) {
          return { opacity: 0 };
        }
        if (type === 'top1') {
          if (translateY.value < -25 && Math.abs(translateY.value) > Math.abs(translateX.value) * 0.75) {
            const opacity = interpolate(translateY.value, [-25, -85], [0, 1], Extrapolation.CLAMP);
            const scale = interpolate(translateY.value, [-25, -85], [0.85, 1.05], Extrapolation.CLAMP);
            return { opacity, transform: [{ scale }] };
          }
          return { opacity: 0 };
        }
        if (type === 'like') {
          // Visible al deslizar a la derecha si no está subiendo hacia el podio
          if (translateY.value > -40) {
            const opacity = interpolate(translateX.value, [20, 90], [0, 1], Extrapolation.CLAMP);
            return { opacity, transform: [{ rotate: '-12deg' }] };
          }
          return { opacity: 0 };
        } else {
          // Visible al deslizar a la izquierda si no está subiendo hacia el podio
          if (translateY.value > -40) {
            const opacity = interpolate(translateX.value, [-90, -20], [1, 0], Extrapolation.CLAMP);
            return { opacity, transform: [{ rotate: '12deg' }] };
          }
          return { opacity: 0 };
        }
      });
    };

    const slot0LikeStamp = createStampStyle(0, 'like');
    const slot0NopeStamp = createStampStyle(0, 'nope');
    const slot0Top1Stamp = createStampStyle(0, 'top1');
    const slot0GlowGold = createGlowGoldStyle(0);

    const slot1LikeStamp = createStampStyle(1, 'like');
    const slot1NopeStamp = createStampStyle(1, 'nope');
    const slot1Top1Stamp = createStampStyle(1, 'top1');
    const slot1GlowGold = createGlowGoldStyle(1);

    const slot2LikeStamp = createStampStyle(2, 'like');
    const slot2NopeStamp = createStampStyle(2, 'nope');
    const slot2Top1Stamp = createStampStyle(2, 'top1');
    const slot2GlowGold = createGlowGoldStyle(2);

    // Mapeo ordenado de datos de cartas a slots rotativos
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
          {/* ================= SLOT 0 ================= */}
          {slot0Data.card && (
            <Animated.View style={[styles.cardWrapper, slot0Style]}>
              <CardName item={slot0Data.card} partnerLiked={slot0Data.liked} />

              {/* Halo dorado al elevar hacia el Podio */}
              <Animated.View style={[styles.goldHaloBorder, slot0GlowGold]} pointerEvents="none" />

              {/* Sello ⭐ TOP 1 AL PODIO */}
              <Animated.View style={[styles.top1Stamp, slot0Top1Stamp]} pointerEvents="none">
                <StarIcon size={20} color="#F59E0B" />
                <Text style={styles.top1StampText}>TOP 1 · AL PODIO</Text>
              </Animated.View>

              {/* Sello ME GUSTA */}
              <Animated.View
                style={[
                  styles.stamp,
                  styles.likeStamp,
                  { borderColor: colors.success },
                  slot0LikeStamp,
                ]}
                pointerEvents="none"
              >
                <Text style={[styles.stampText, { color: colors.success }]}>ME GUSTA</Text>
              </Animated.View>

              {/* Sello PASO */}
              <Animated.View
                style={[
                  styles.stamp,
                  styles.nopeStamp,
                  { borderColor: colors.salmon },
                  slot0NopeStamp,
                ]}
                pointerEvents="none"
              >
                <Text style={[styles.stampText, { color: colors.salmon }]}>PASO</Text>
              </Animated.View>
            </Animated.View>
          )}

          {/* ================= SLOT 1 ================= */}
          {slot1Data.card && (
            <Animated.View style={[styles.cardWrapper, slot1Style]}>
              <CardName item={slot1Data.card} partnerLiked={slot1Data.liked} />

              <Animated.View style={[styles.goldHaloBorder, slot1GlowGold]} pointerEvents="none" />

              <Animated.View style={[styles.top1Stamp, slot1Top1Stamp]} pointerEvents="none">
                <StarIcon size={20} color="#F59E0B" />
                <Text style={styles.top1StampText}>TOP 1 · AL PODIO</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.stamp,
                  styles.likeStamp,
                  { borderColor: colors.success },
                  slot1LikeStamp,
                ]}
                pointerEvents="none"
              >
                <Text style={[styles.stampText, { color: colors.success }]}>ME GUSTA</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.stamp,
                  styles.nopeStamp,
                  { borderColor: colors.salmon },
                  slot1NopeStamp,
                ]}
                pointerEvents="none"
              >
                <Text style={[styles.stampText, { color: colors.salmon }]}>PASO</Text>
              </Animated.View>
            </Animated.View>
          )}

          {/* ================= SLOT 2 ================= */}
          {slot2Data.card && (
            <Animated.View style={[styles.cardWrapper, slot2Style]}>
              <CardName item={slot2Data.card} partnerLiked={slot2Data.liked} />

              <Animated.View style={[styles.goldHaloBorder, slot2GlowGold]} pointerEvents="none" />

              <Animated.View style={[styles.top1Stamp, slot2Top1Stamp]} pointerEvents="none">
                <StarIcon size={20} color="#F59E0B" />
                <Text style={styles.top1StampText}>TOP 1 · AL PODIO</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.stamp,
                  styles.likeStamp,
                  { borderColor: colors.success },
                  slot2LikeStamp,
                ]}
                pointerEvents="none"
              >
                <Text style={[styles.stampText, { color: colors.success }]}>ME GUSTA</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.stamp,
                  styles.nopeStamp,
                  { borderColor: colors.salmon },
                  slot2NopeStamp,
                ]}
                pointerEvents="none"
              >
                <Text style={[styles.stampText, { color: colors.salmon }]}>PASO</Text>
              </Animated.View>
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
  goldHaloBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 12,
    right: 12,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 12,
  },
  stamp: {
    position: 'absolute',
    top: 36,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2.5,
    zIndex: 15,
  },
  likeStamp: {
    left: 24,
  },
  nopeStamp: {
    right: 24,
  },
  stampText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  top1Stamp: {
    position: 'absolute',
    top: 28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 20,
  },
  top1StampText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
