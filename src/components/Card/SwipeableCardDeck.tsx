import React, {
  useImperativeHandle,
  forwardRef,
} from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { BookmarkIcon } from 'react-native-heroicons/solid';
import { ArrowRightIcon, BookOpenIcon } from 'react-native-heroicons/outline';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { IName } from '../../types';
import { CardName } from './CardName';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 360);
const CARD_HEIGHT = 480;
const FLIP_THRESHOLD = CARD_WIDTH * 0.32;

export interface SwipeableCardDeckRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  swipeUp: () => void;
}

export interface SwipeableCardDeckProps {
  currentIndex?: number;
  totalPages?: number;
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

interface BackOfPageProps {
  isDark: boolean;
  pageNumber?: number;
}

/**
 * Reverso de la página (Dorso de papel editorial verjurado).
 * Se muestra cuando la hoja gira en el espacio 3D más de 90° (Turn.js).
 */
const BackOfPage: React.FC<BackOfPageProps> = ({ isDark, pageNumber }) => {
  const paperBg = isDark ? '#1C1C26' : '#FAF8F4';
  const watermarkText = isDark ? '#404052' : '#C8C1B4';
  const lineRule = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.04)';

  return (
    <View
      style={[
        styles.backOfPageContainer,
        {
          backgroundColor: paperBg,
          borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
        },
      ]}
      pointerEvents="none"
    >
      {/* Pautas tenues de cuaderno editorial en el dorso */}
      <View style={styles.backLinedArea}>
        <View style={[styles.backNotebookLine, { backgroundColor: lineRule }]} />
        <View style={[styles.backNotebookLine, { backgroundColor: lineRule }]} />
        <View style={[styles.backNotebookLine, { backgroundColor: lineRule }]} />
        <View style={[styles.backNotebookLine, { backgroundColor: lineRule }]} />
        <View style={[styles.backNotebookLine, { backgroundColor: lineRule }]} />
      </View>

      {/* Filigrana y grabado editorial central */}
      <View style={styles.backWatermark}>
        <BookOpenIcon size={32} color={watermarkText} />
        <Text style={[styles.backWatermarkTitle, { color: watermarkText }]}>
          ÁLBUM DE NACIMIENTO
        </Text>
        <Text style={[styles.backWatermarkSubtitle, { color: watermarkText }]}>
          — BebéMatch —
        </Text>
        {pageNumber !== undefined && (
          <Text style={[styles.backWatermarkPage, { color: watermarkText }]}>
            Pág. {pageNumber}
          </Text>
        )}
      </View>

      {/* Sombra interna de curvatura del papel en el dorso */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
          <Defs>
            <LinearGradient id="backCylinderShadow" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
              <Stop offset="30%" stopColor="#000000" stopOpacity="0.05" />
              <Stop offset="70%" stopColor="#000000" stopOpacity="0.02" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#backCylinderShadow)" />
        </Svg>
      </View>
    </View>
  );
};

export const SwipeableCardDeck = forwardRef<SwipeableCardDeckRef, SwipeableCardDeckProps>(
  (
    {
      currentIndex = 0,
      totalPages,
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
    const dragX = useSharedValue(0);
    const flipAngle = useSharedValue(0); // -180 a +180 deg
    const exitDirection = useSharedValue(0); // -1: descartar (izquierda), +1: anotar (derecha)
    const isFlipping = useSharedValue(0); // 1 si está en animación activa

    const resetValues = () => {
      'worklet';
      dragX.value = 0;
      flipAngle.value = 0;
      exitDirection.value = 0;
      isFlipping.value = 0;
      activeSlot.value = (activeSlot.value + 1) % 3;
    };

    useImperativeHandle(
      ref,
      () => ({
        swipeLeft: () => {
          'worklet';
          if (isFlipping.value === 1) return;
          isFlipping.value = 1;
          exitDirection.value = -1;
          flipAngle.value = withTiming(
            -180,
            { duration: 420, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
            (finished) => {
              'worklet';
              if (finished) {
                resetValues();
                runOnJS(onSwipeLeft)();
              }
            }
          );
        },
        swipeRight: () => {
          'worklet';
          if (isFlipping.value === 1) return;
          isFlipping.value = 1;
          exitDirection.value = 1;
          flipAngle.value = withTiming(
            180,
            { duration: 420, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
            (finished) => {
              'worklet';
              if (finished) {
                resetValues();
                runOnJS(onSwipeRight)();
              }
            }
          );
        },
        swipeUp: () => {
          'worklet';
          if (isFlipping.value === 1) return;
          isFlipping.value = 1;
          exitDirection.value = -1;
          flipAngle.value = withTiming(
            -180,
            { duration: 380, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
            (finished) => {
              'worklet';
              if (finished) {
                resetValues();
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
      [onSwipeLeft, onSwipeRight, onSwipeUp, activeSlot, dragX, flipAngle, exitDirection, isFlipping]
    );

    // Gesto táctil Pan: doblez 3D interactivo en tiempo real al estilo Turn.js
    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        'worklet';
        if (isFlipping.value === 1) return;
        dragX.value = event.translationX;

        if (event.translationX < 0) {
          // Descartar: pasar página hacia la izquierda (lomo en x=0%)
          exitDirection.value = -1;
          const progress = Math.min(1, Math.abs(event.translationX) / CARD_WIDTH);
          // Giro angular progresivo de 0° a -180°
          flipAngle.value = -progress * 180;
        } else {
          // Anotar: archivar / doblar hacia el álbum derecho (lomo en x=100%)
          exitDirection.value = 1;
          const progress = Math.min(1, event.translationX / CARD_WIDTH);
          flipAngle.value = progress * 180;
        }
      })
      .onEnd((event) => {
        'worklet';
        if (isFlipping.value === 1) return;

        const isLeftConfirm =
          dragX.value < -FLIP_THRESHOLD || (event.velocityX < -450 && dragX.value < -20);
        const isRightConfirm =
          dragX.value > FLIP_THRESHOLD || (event.velocityX > 450 && dragX.value > 20);

        if (isLeftConfirm) {
          // Completar volteo de página Turn.js hacia la izquierda
          isFlipping.value = 1;
          exitDirection.value = -1;
          flipAngle.value = withTiming(
            -180,
            { duration: 340, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
            (finished) => {
              'worklet';
              if (finished) {
                resetValues();
                runOnJS(onSwipeLeft)();
              }
            }
          );
        } else if (isRightConfirm) {
          // Completar volteo hacia el álbum derecho
          isFlipping.value = 1;
          exitDirection.value = 1;
          flipAngle.value = withTiming(
            180,
            { duration: 340, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
            (finished) => {
              'worklet';
              if (finished) {
                resetValues();
                runOnJS(onSwipeRight)();
              }
            }
          );
        } else {
          // Rebote de retorno con elasticidad de papel
          flipAngle.value = withSpring(0, { damping: 18, stiffness: 180 });
          dragX.value = withSpring(0, { damping: 18, stiffness: 180 });
          exitDirection.value = 0;
        }
      });

    // 1. Estilo de transformación 3D de la ranura de la tarjeta
    const createSlotStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        const isTop = activeSlot.value === slotIndex;
        const isMiddle = (activeSlot.value + 1) % 3 === slotIndex;

        if (isTop) {
          const isLeftTurn = exitDirection.value < 0 || (exitDirection.value === 0 && dragX.value < 0);
          const originX = isLeftTurn ? '0%' : '100%';
          const tiltSign = isLeftTurn ? -1 : 1;
          const absAngle = Math.abs(flipAngle.value);

          // Desvanecimiento suave: a partir de 100° se desvanece hasta desaparecer a 0 absoluto en 155°
          const exitOpacity = interpolate(
            absAngle,
            [0, 100, 155],
            [1, 0.95, 0],
            Extrapolation.CLAMP
          );

          // Vuelo suave hacia fuera de la pantalla para salir limpiamente del viewport
          const exitFlyX = interpolate(
            absAngle,
            [90, 175],
            [0, isLeftTurn ? -SCREEN_WIDTH * 0.35 : SCREEN_WIDTH * 0.35],
            Extrapolation.CLAMP
          );

          // Inclinación sutil vertical al levantar la hoja para máximo realismo
          const rotateZ = interpolate(
            absAngle,
            [0, 60, 120, 180],
            [0, 2.8 * tiltSign, 1.2 * tiltSign, 0],
            Extrapolation.CLAMP
          );

          // Elevación óptica en el eje Z/Y mientras la página cruza el punto álgido
          const translateY = interpolate(
            absAngle,
            [0, 90, 180],
            [0, -10, 0],
            Extrapolation.CLAMP
          );

          return {
            transformOrigin: [originX, '50%', 0],
            transform: [
              { perspective: 1400 },
              { translateX: exitFlyX },
              { translateY },
              { rotateY: `${flipAngle.value}deg` },
              { rotateZ: `${rotateZ}deg` },
            ],
            zIndex: 20,
            opacity: exitOpacity,
          };
        }

        if (isMiddle) {
          return {
            transformOrigin: ['0%', '50%', 0],
            transform: [{ perspective: 1400 }, { scale: 1 }, { translateY: 0 }],
            zIndex: 10,
            opacity: 1,
          };
        }

        // Slot de fondo / reserva: totalmente oculto para evitar reapariciones residuales
        return {
          transformOrigin: ['0%', '50%', 0],
          transform: [{ perspective: 1400 }, { scale: 0.985 }, { translateY: 0 }],
          zIndex: 0,
          opacity: 0,
        };
      });
    };

    // 2. Visibilidad de la cara frontal (se oculta al pasar de 90° en 3D)
    const createFrontFaceStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        if (activeSlot.value !== slotIndex) {
          return { opacity: 1 };
        }
        // Desvanecimiento instantáneo en la arista perpendicular (90°)
        const absAngle = Math.abs(flipAngle.value);
        const opacity = interpolate(absAngle, [87, 90], [1, 0], Extrapolation.CLAMP);
        return { opacity };
      });
    };

    // 3. Visibilidad de la cara trasera (reverso) (visible entre 90° y 180°)
    const createBackFaceStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        if (activeSlot.value !== slotIndex) {
          return { opacity: 0 };
        }
        const absAngle = Math.abs(flipAngle.value);
        const opacity = interpolate(absAngle, [90, 93], [0, 1], Extrapolation.CLAMP);
        return {
          opacity,
          transform: [{ rotateY: '180deg' }],
        };
      });
    };

    // 4. Sombra de curvatura cilíndrica sobre la hoja que gira (Spine Crease Shadow)
    const createTurnCreaseShadowStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        if (activeSlot.value !== slotIndex) {
          return { opacity: 0 };
        }
        const absAngle = Math.abs(flipAngle.value);
        // Sombra de curvatura máxima alrededor de 55°-75°, luego decae al quedar de perfil
        const opacity = interpolate(
          absAngle,
          [0, 35, 70, 90],
          [0, 0.45, 0.65, 0],
          Extrapolation.CLAMP
        );
        return { opacity };
      });
    };

    // 5. Sombra proyectada sobre la página que queda debajo (Under-page Drop Shadow)
    const createUnderPageShadowStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        const isMiddle = (activeSlot.value + 1) % 3 === slotIndex;
        if (!isMiddle) {
          return { opacity: 0 };
        }
        const absAngle = Math.abs(flipAngle.value);
        // La sombra se proyecta sobre la página descubierta mientras la superior gira
        const opacity = interpolate(
          absAngle,
          [0, 45, 90, 160, 180],
          [0, 0.45, 0.55, 0.15, 0],
          Extrapolation.CLAMP
        );
        return { opacity };
      });
    };

    // 6. Pestaña sutil superior: "Anotar en el álbum" (swipe right)
    const createSaveTabStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        if (activeSlot.value !== slotIndex) {
          return { opacity: 0 };
        }
        if (flipAngle.value > 15) {
          const opacity = interpolate(flipAngle.value, [15, 60], [0, 1], Extrapolation.CLAMP);
          const translateY = interpolate(flipAngle.value, [15, 60], [-8, 0], Extrapolation.CLAMP);
          return { opacity, transform: [{ translateY }] };
        }
        return { opacity: 0 };
      });
    };

    // 7. Pestaña sutil superior: "Siguiente página" (swipe left)
    const createNextTabStyle = (slotIndex: number) => {
      return useAnimatedStyle(() => {
        if (activeSlot.value !== slotIndex) {
          return { opacity: 0 };
        }
        if (flipAngle.value < -15) {
          const opacity = interpolate(flipAngle.value, [-15, -60], [0, 1], Extrapolation.CLAMP);
          const translateY = interpolate(flipAngle.value, [-15, -60], [-8, 0], Extrapolation.CLAMP);
          return { opacity, transform: [{ translateY }] };
        }
        return { opacity: 0 };
      });
    };

    // Instanciación estricta e incondicional de hooks para los 3 slots
    const slot0Style = createSlotStyle(0);
    const slot0Front = createFrontFaceStyle(0);
    const slot0Back = createBackFaceStyle(0);
    const slot0Crease = createTurnCreaseShadowStyle(0);
    const slot0UnderShadow = createUnderPageShadowStyle(0);
    const slot0SaveTab = createSaveTabStyle(0);
    const slot0NextTab = createNextTabStyle(0);

    const slot1Style = createSlotStyle(1);
    const slot1Front = createFrontFaceStyle(1);
    const slot1Back = createBackFaceStyle(1);
    const slot1Crease = createTurnCreaseShadowStyle(1);
    const slot1UnderShadow = createUnderPageShadowStyle(1);
    const slot1SaveTab = createSaveTabStyle(1);
    const slot1NextTab = createNextTabStyle(1);

    const slot2Style = createSlotStyle(2);
    const slot2Front = createFrontFaceStyle(2);
    const slot2Back = createBackFaceStyle(2);
    const slot2Crease = createTurnCreaseShadowStyle(2);
    const slot2UnderShadow = createUnderPageShadowStyle(2);
    const slot2SaveTab = createSaveTabStyle(2);
    const slot2NextTab = createNextTabStyle(2);

    // Mapeo ordenado de datos de cartas a cada slot físico
    const getSlotData = (slotIndex: number) => {
      const top = currentIndex % 3;
      const middle = (currentIndex + 1) % 3;
      const bottom = (currentIndex + 2) % 3;

      if (slotIndex === top) {
        return { card: currentCard, liked: partnerLiked, page: currentIndex + 1 };
      }
      if (slotIndex === middle) {
        return { card: nextCard, liked: nextPartnerLiked, page: currentIndex + 2 };
      }
      if (slotIndex === bottom) {
        return { card: thirdCard, liked: thirdPartnerLiked, page: currentIndex + 3 };
      }
      return { card: null, liked: false, page: 1 };
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
              {/* Cara Frontal (Anverso de la página) */}
              <Animated.View style={[styles.faceContainer, slot0Front]}>
                <CardName
                  item={slot0Data.card}
                  partnerLiked={slot0Data.liked}
                  pageNumber={slot0Data.page}
                  totalPages={totalPages}
                />

                {/* Sombra de curvatura de Turn.js en la cara frontal */}
                <Animated.View style={[styles.shadowOverlay, slot0Crease]} pointerEvents="none">
                  <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
                    <Defs>
                      <LinearGradient id="turnCreaseGrad0" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#000000" stopOpacity="0.38" />
                        <Stop offset="22%" stopColor="#000000" stopOpacity="0.14" />
                        <Stop offset="65%" stopColor="#000000" stopOpacity="0.03" />
                        <Stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
                      </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#turnCreaseGrad0)" />
                  </Svg>
                </Animated.View>

                {/* Pestaña superior: Anotar en el álbum */}
                <Animated.View
                  style={[
                    styles.tabIndicator,
                    styles.saveTab,
                    { backgroundColor: colors.salmon },
                    slot0SaveTab,
                  ]}
                  pointerEvents="none"
                >
                  <BookmarkIcon size={13} color="#FFFFFF" />
                  <Text style={styles.tabTextWhite}>Anotar en el álbum</Text>
                </Animated.View>

                {/* Pestaña superior: Siguiente página */}
                <Animated.View
                  style={[
                    styles.tabIndicator,
                    styles.nextTab,
                    { backgroundColor: colors.surface2, borderColor: colors.border2 },
                    slot0NextTab,
                  ]}
                  pointerEvents="none"
                >
                  <Text style={[styles.tabText, { color: colors.text }]}>Siguiente página</Text>
                  <ArrowRightIcon size={13} color={colors.text} />
                </Animated.View>
              </Animated.View>

              {/* Cara Trasera (Reverso de la página, visible tras girar 90°) */}
              <Animated.View style={[styles.faceContainer, slot0Back]} pointerEvents="none">
                <BackOfPage
                  isDark={isDark}
                  pageNumber={slot0Data.page}
                />
              </Animated.View>

              {/* Sombra proyectada sobre este slot cuando está debajo de otro que gira */}
              <Animated.View style={[styles.shadowOverlay, slot0UnderShadow]} pointerEvents="none">
                <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
                  <Defs>
                    <LinearGradient id="underPageGrad0" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
                      <Stop offset="35%" stopColor="#000000" stopOpacity="0.18" />
                      <Stop offset="80%" stopColor="#000000" stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#underPageGrad0)" />
                </Svg>
              </Animated.View>
            </Animated.View>
          )}

          {/* ================= SLOT 1 ================= */}
          {slot1Data.card && (
            <Animated.View style={[styles.cardWrapper, slot1Style]}>
              <Animated.View style={[styles.faceContainer, slot1Front]}>
                <CardName
                  item={slot1Data.card}
                  partnerLiked={slot1Data.liked}
                  pageNumber={slot1Data.page}
                  totalPages={totalPages}
                />

                <Animated.View style={[styles.shadowOverlay, slot1Crease]} pointerEvents="none">
                  <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
                    <Defs>
                      <LinearGradient id="turnCreaseGrad1" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#000000" stopOpacity="0.38" />
                        <Stop offset="22%" stopColor="#000000" stopOpacity="0.14" />
                        <Stop offset="65%" stopColor="#000000" stopOpacity="0.03" />
                        <Stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
                      </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#turnCreaseGrad1)" />
                  </Svg>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.tabIndicator,
                    styles.saveTab,
                    { backgroundColor: colors.salmon },
                    slot1SaveTab,
                  ]}
                  pointerEvents="none"
                >
                  <BookmarkIcon size={13} color="#FFFFFF" />
                  <Text style={styles.tabTextWhite}>Anotar en el álbum</Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.tabIndicator,
                    styles.nextTab,
                    { backgroundColor: colors.surface2, borderColor: colors.border2 },
                    slot1NextTab,
                  ]}
                  pointerEvents="none"
                >
                  <Text style={[styles.tabText, { color: colors.text }]}>Siguiente página</Text>
                  <ArrowRightIcon size={13} color={colors.text} />
                </Animated.View>
              </Animated.View>

              <Animated.View style={[styles.faceContainer, slot1Back]} pointerEvents="none">
                <BackOfPage
                  isDark={isDark}
                  pageNumber={slot1Data.page}
                />
              </Animated.View>

              <Animated.View style={[styles.shadowOverlay, slot1UnderShadow]} pointerEvents="none">
                <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
                  <Defs>
                    <LinearGradient id="underPageGrad1" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
                      <Stop offset="35%" stopColor="#000000" stopOpacity="0.18" />
                      <Stop offset="80%" stopColor="#000000" stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#underPageGrad1)" />
                </Svg>
              </Animated.View>
            </Animated.View>
          )}

          {/* ================= SLOT 2 ================= */}
          {slot2Data.card && (
            <Animated.View style={[styles.cardWrapper, slot2Style]}>
              <Animated.View style={[styles.faceContainer, slot2Front]}>
                <CardName
                  item={slot2Data.card}
                  partnerLiked={slot2Data.liked}
                  pageNumber={slot2Data.page}
                  totalPages={totalPages}
                />

                <Animated.View style={[styles.shadowOverlay, slot2Crease]} pointerEvents="none">
                  <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
                    <Defs>
                      <LinearGradient id="turnCreaseGrad2" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#000000" stopOpacity="0.38" />
                        <Stop offset="22%" stopColor="#000000" stopOpacity="0.14" />
                        <Stop offset="65%" stopColor="#000000" stopOpacity="0.03" />
                        <Stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
                      </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#turnCreaseGrad2)" />
                  </Svg>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.tabIndicator,
                    styles.saveTab,
                    { backgroundColor: colors.salmon },
                    slot2SaveTab,
                  ]}
                  pointerEvents="none"
                >
                  <BookmarkIcon size={13} color="#FFFFFF" />
                  <Text style={styles.tabTextWhite}>Anotar en el álbum</Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.tabIndicator,
                    styles.nextTab,
                    { backgroundColor: colors.surface2, borderColor: colors.border2 },
                    slot2NextTab,
                  ]}
                  pointerEvents="none"
                >
                  <Text style={[styles.tabText, { color: colors.text }]}>Siguiente página</Text>
                  <ArrowRightIcon size={13} color={colors.text} />
                </Animated.View>
              </Animated.View>

              <Animated.View style={[styles.faceContainer, slot2Back]} pointerEvents="none">
                <BackOfPage
                  isDark={isDark}
                  pageNumber={slot2Data.page}
                />
              </Animated.View>

              <Animated.View style={[styles.shadowOverlay, slot2UnderShadow]} pointerEvents="none">
                <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
                  <Defs>
                    <LinearGradient id="underPageGrad2" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
                      <Stop offset="35%" stopColor="#000000" stopOpacity="0.18" />
                      <Stop offset="80%" stopColor="#000000" stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#underPageGrad2)" />
                </Svg>
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
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  faceContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
  },
  shadowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    zIndex: 30,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  saveTab: {
    right: 16,
  },
  nextTab: {
    left: 16,
  },
  tabTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Reverso de la hoja (BackOfPage)
  backOfPageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backLinedArea: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 40,
    bottom: 40,
    justifyContent: 'space-around',
    opacity: 0.7,
  },
  backNotebookLine: {
    height: 1,
    width: '100%',
  },
  backWatermark: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 5,
    paddingHorizontal: 24,
  },
  backWatermarkTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  backWatermarkSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
  backWatermarkPage: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
