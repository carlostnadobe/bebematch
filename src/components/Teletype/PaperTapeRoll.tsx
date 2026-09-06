import React, {
  useImperativeHandle,
  forwardRef,
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { BookmarkIcon, BadgeCheckIcon } from 'react-native-heroicons/solid';
import { IName, Gender } from '../../types';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAPE_WIDTH = Math.min(SCREEN_WIDTH * 0.94, 380);
const FRAME_HEIGHT = 490;
const ROLLER_HEIGHT = 14;
const SLOT_HEIGHT = FRAME_HEIGHT - ROLLER_HEIGHT * 2; // 462 pt exactos
const SWIPE_THRESHOLD = 70;

export interface PaperTapeRollRef {
  stamp: () => void;
  stampAndAdvance: () => void;
  advanceWithoutStamp: () => void;
  highlightAndAdvance: () => void;
  advanceWithoutHighlight: () => void;
  rewind: () => void;
}

export interface PaperTapeRollProps {
  deck: IName[];
  currentIndex: number;
  totalCards: number;
  partnerLikes?: Record<string, boolean>;
  selectedMap?: Record<string, boolean>;
  onStampVote: () => void;
  onAdvance: () => void;
  onRewind?: () => void;
}

// Orificios mecánicos de tractor continuo de papel
const TractorHoles = React.memo<{ isDark: boolean }>(({ isDark }) => {
  const holeColor = isDark ? '#0A0A0E' : '#E8E4DA';
  const holeBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <View style={styles.tractorColumn}>
      {Array.from({ length: 14 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.tractorHole,
            { backgroundColor: holeColor, borderColor: holeBorder },
          ]}
        />
      ))}
    </View>
  );
});

TractorHoles.displayName = 'TractorHoles';

// Componente Sello de Tinta de Máquina / Notarial "SELECCIONADO"
// Ubicado en la parte inferior derecha con opacidad sutil para no interferir con el texto
interface InkStampProps {
  isDark: boolean;
  animatedStyle?: ReturnType<typeof useAnimatedStyle>;
}

const InkStamp = React.memo<InkStampProps>(({ isDark, animatedStyle }) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      style={[
        styles.stampContainer,
        {
          borderColor: colors.salmon,
          backgroundColor: isDark ? 'rgba(232, 115, 90, 0.10)' : 'rgba(232, 115, 90, 0.05)',
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <View style={[styles.stampInnerBorder, { borderColor: colors.salmon }]}>
        <View style={styles.stampHeaderRow}>
          <BadgeCheckIcon size={10} color={colors.salmon} />
          <Text style={[styles.stampSubText, { color: colors.salmon }]}>
            BEBÉMATCH · FAVORITO
          </Text>
        </View>
        <Text style={[styles.stampMainText, { color: colors.salmon }]}>
          SELECCIONADO
        </Text>
      </View>
    </Animated.View>
  );
});

InkStamp.displayName = 'InkStamp';

interface NameTicketProps {
  item: IName | null;
  pageNumber: number;
  totalPages: number;
  partnerLiked?: boolean;
  isStamped?: boolean;
  stampAnimatedStyle?: ReturnType<typeof useAnimatedStyle>;
  isDark: boolean;
}

const NameTicket = React.memo<NameTicketProps>(
  ({ item, pageNumber, totalPages, partnerLiked = false, isStamped = false, stampAnimatedStyle, isDark }) => {
    const { colors, spacing } = useTheme();

    const genderInfo = useMemo(() => {
      if (!item) return { bg: 'transparent', text: colors.text3, border: 'transparent', label: '' };
      switch (item.g as Gender) {
        case 'girl':
          return {
            bg: isDark ? 'rgba(232, 115, 90, 0.16)' : 'rgba(195, 83, 56, 0.12)',
            text: colors.salmon,
            border: isDark ? 'rgba(232, 115, 90, 0.3)' : 'rgba(195, 83, 56, 0.25)',
            label: 'NIÑA',
          };
        case 'boy':
          return {
            bg: isDark ? 'rgba(96, 165, 250, 0.16)' : 'rgba(59, 130, 246, 0.12)',
            text: isDark ? '#60A5FA' : '#2563EB',
            border: isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.25)',
            label: 'NIÑO',
          };
        case 'neutral':
        default:
          return {
            bg: isDark ? 'rgba(167, 139, 250, 0.16)' : 'rgba(147, 51, 234, 0.12)',
            text: isDark ? '#A78BFA' : '#7E22CE',
            border: isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(147, 51, 234, 0.25)',
            label: 'UNISEX',
          };
      }
    }, [item, colors.salmon, isDark]);

    if (!item) {
      return (
        <View style={styles.ticketContainer}>
          <Text style={[styles.emptyTapeText, { color: colors.text3 }]}>Fin del rollo</Text>
        </View>
      );
    }

    return (
      <View style={styles.ticketContainer}>
        {/* Marcapáginas si la pareja lo seleccionó */}
        {partnerLiked && (
          <View style={[styles.partnerLikedRibbon, { backgroundColor: colors.salmon }]}>
            <BookmarkIcon size={12} color="#FFFFFF" />
            <Text style={styles.partnerLikedText}>Seleccionado por tu pareja</Text>
          </View>
        )}

        {/* Cabecera del ticket de teletipo */}
        <View style={styles.ticketHeader}>
          <View
            style={[
              styles.typewriterBadge,
              { backgroundColor: genderInfo.bg, borderColor: genderInfo.border },
            ]}
          >
            <Text style={[styles.typewriterBadgeText, { color: genderInfo.text }]}>
              {genderInfo.label}
            </Text>
          </View>

          <Text style={[styles.typewriterMetaText, { color: colors.text3 }]}>
            FICHA {pageNumber}{totalPages > 0 ? ` / ${totalPages}` : ''}
          </Text>

          <Text style={[styles.typewriterMetaText, { color: colors.text3 }]}>
            {item.o ? item.o.toUpperCase() : 'ORIGEN'}
          </Text>
        </View>

        {/* Línea perforada divisoria superior */}
        <View
          style={[
            styles.dashedRule,
            { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
          ]}
        />

        {/* Bloque principal del nombre */}
        <View style={styles.ticketBody}>
          <View style={styles.nameContainer}>
            <Text style={[styles.nameTitle, { color: colors.text }]}>{item.n}</Text>
          </View>

          {/* Significado en cursiva */}
          <Text style={[styles.meaningText, { color: colors.text2 }]}>
            &ldquo;{item.m}&rdquo;
          </Text>

          {/* Información adicional con formato de teletipo */}
          {(item.santo || item.curioso || (item.famosos && item.famosos.length > 0)) && (
            <View
              style={[
                styles.detailsBox,
                {
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                },
              ]}
            >
              {item.santo && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.text3 }]}>ONOMÁSTICA:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{item.santo}</Text>
                </View>
              )}

              {item.curioso && (
                <View style={[styles.curiosoBlock, item.santo ? { marginTop: spacing.xs } : null]}>
                  <Text style={[styles.detailLabel, { color: colors.salmon, marginBottom: 2 }]}>
                    ANOTACIÓN CURIOSA:
                  </Text>
                  <Text style={[styles.curiosoText, { color: colors.text2 }]}>{item.curioso}</Text>
                </View>
              )}

              {item.famosos && item.famosos.length > 0 && (
                <View style={{ marginTop: spacing.xs }}>
                  <Text style={[styles.detailLabel, { color: colors.text3, marginBottom: 4 }]}>
                    REFERENCIAS CÉLEBRES:
                  </Text>
                  <View style={styles.chipsRow}>
                    {item.famosos.map((famoso, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: colors.text2 }]}>{famoso}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Línea perforada de corte inferior de la bobina */}
        <View
          style={[
            styles.dashedRuleBottom,
            { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
          ]}
        />

        {/* Sello Notarial oficial situado en la parte inferior derecha para mínima interferencia */}
        {isStamped && !stampAnimatedStyle && <InkStamp isDark={isDark} />}
        {stampAnimatedStyle && <InkStamp isDark={isDark} animatedStyle={stampAnimatedStyle} />}
      </View>
    );
  }
);

NameTicket.displayName = 'NameTicket';

export const PaperTapeRoll = forwardRef<PaperTapeRollRef, PaperTapeRollProps>(
  (
    {
      deck,
      currentIndex,
      totalCards,
      partnerLikes = {},
      selectedMap = {},
      onStampVote,
      onAdvance,
      onRewind,
    },
    ref
  ) => {
    const { isDark } = useTheme();

    const rollTranslateY = useSharedValue(-currentIndex * SLOT_HEIGHT);
    const startTranslateY = useSharedValue(-currentIndex * SLOT_HEIGHT);
    const stampScale = useSharedValue(1);
    const stampOpacity = useSharedValue(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const lastIndexRef = useRef(currentIndex);
    const hasAnimatedInitialHint = useRef(false);

    // Muestra inicial de la dirección del swipe al entrar por primera vez
    useEffect(() => {
      if (currentIndex !== 0 || hasAnimatedInitialHint.current || deck.length <= 1) {
        return;
      }
      hasAnimatedInitialHint.current = true;
      const timer = setTimeout(() => {
        // Desplazamiento hacia arriba que asoma el siguiente nombre y rebota elásticamente a su posición
        rollTranslateY.value = withSequence(
          withTiming(-65, {
            duration: 380,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
          }),
          withSpring(0, {
            damping: 12,
            stiffness: 140,
          })
        );
      }, 500);
      return () => clearTimeout(timer);
    }, [currentIndex, deck.length, rollTranslateY]);

    // Sincronización absoluta de posición cuando currentIndex cambia
    useEffect(() => {
      if (lastIndexRef.current !== currentIndex) {
        lastIndexRef.current = currentIndex;
        if (!isAnimating) {
          rollTranslateY.value = -currentIndex * SLOT_HEIGHT;
        }
        stampOpacity.value = 0;
        stampScale.value = 1;
        setIsAnimating(false);
      }
    }, [currentIndex, isAnimating, rollTranslateY, stampOpacity, stampScale]);

    // Red de seguridad
    useEffect(() => {
      if (!isAnimating) return;
      const timer = setTimeout(() => {
        setIsAnimating(false);
        stampOpacity.value = 0;
        stampScale.value = 1;
        rollTranslateY.value = -currentIndex * SLOT_HEIGHT;
      }, 750);
      return () => clearTimeout(timer);
    }, [isAnimating, currentIndex, rollTranslateY, stampOpacity, stampScale]);

    const performStamp = () => {
      if (isAnimating || currentIndex >= deck.length) return;
      setIsAnimating(true);

      // Golpe e impacto del sello en la esquina inferior derecha SIN avanzar la cinta
      stampScale.value = 1.5;
      stampOpacity.value = 0;
      stampScale.value = withTiming(1, { duration: 150, easing: Easing.bezier(0.1, 0.9, 0.2, 1) });
      stampOpacity.value = withTiming(0.48, { duration: 90 }, (stampDone) => {
        'worklet';
        if (stampDone) {
          runOnJS(setIsAnimating)(false);
          runOnJS(onStampVote)();
        }
      });
    };

    const performAdvanceWithoutStamp = () => {
      if (isAnimating || currentIndex >= deck.length) return;
      setIsAnimating(true);

      const targetY = -(currentIndex + 1) * SLOT_HEIGHT;
      rollTranslateY.value = withTiming(
        targetY,
        { duration: 260, easing: Easing.bezier(0.25, 1, 0.5, 1) },
        (rollDone) => {
          'worklet';
          if (rollDone) {
            runOnJS(onAdvance)();
          }
        }
      );
    };

    useImperativeHandle(
      ref,
      () => ({
        stamp: performStamp,
        stampAndAdvance: performStamp,
        advanceWithoutStamp: performAdvanceWithoutStamp,
        highlightAndAdvance: performStamp,
        advanceWithoutHighlight: performAdvanceWithoutStamp,
        rewind: () => {
          if (isAnimating || !onRewind || currentIndex === 0) return;
          setIsAnimating(true);

          // Rueda la cinta hacia abajo mostrando la ficha anterior
          const targetY = -(currentIndex - 1) * SLOT_HEIGHT;
          rollTranslateY.value = withTiming(
            targetY,
            { duration: 240, easing: Easing.bezier(0.25, 1, 0.5, 1) },
            (rewindDone) => {
              'worklet';
              if (rewindDone) {
                runOnJS(onRewind)();
              }
            }
          );
        },
      }),
      [isAnimating, currentIndex, deck.length, onStampVote, onAdvance, onRewind, rollTranslateY, stampOpacity, stampScale]
    );

    // Gesto táctil Pan vertical para avanzar o retroceder la cinta con el dedo
    const panGesture = Gesture.Pan()
      .onStart(() => {
        'worklet';
        startTranslateY.value = rollTranslateY.value;
      })
      .onUpdate((event) => {
        'worklet';
        if (isAnimating) return;
        if (currentIndex === 0 && event.translationY > 0) {
          rollTranslateY.value = startTranslateY.value + event.translationY * 0.15;
        } else {
          rollTranslateY.value = startTranslateY.value + event.translationY;
        }
      })
      .onEnd((event) => {
        'worklet';
        if (isAnimating) return;

        const basePos = -currentIndex * SLOT_HEIGHT;
        const delta = rollTranslateY.value - basePos;

        // 1. Arrastre hacia arriba (avanzar rollo)
        if ((delta < -SWIPE_THRESHOLD || event.velocityY < -350) && currentIndex < deck.length - 1) {
          runOnJS(setIsAnimating)(true);
          const targetY = -(currentIndex + 1) * SLOT_HEIGHT;
          rollTranslateY.value = withTiming(
            targetY,
            { duration: 220, easing: Easing.bezier(0.25, 1, 0.5, 1) },
            (rollDone) => {
              'worklet';
              if (rollDone) {
                runOnJS(onAdvance)();
              }
            }
          );
        }
        // 2. Arrastre hacia abajo (retroceder rollo)
        else if ((delta > SWIPE_THRESHOLD || event.velocityY > 350) && currentIndex > 0 && onRewind) {
          runOnJS(setIsAnimating)(true);
          const targetY = -(currentIndex - 1) * SLOT_HEIGHT;
          rollTranslateY.value = withTiming(
            targetY,
            { duration: 220, easing: Easing.bezier(0.25, 1, 0.5, 1) },
            (rollDone) => {
              'worklet';
              if (rollDone) {
                runOnJS(onRewind)();
              }
            }
          );
        }
        // 3. Retorno elástico a posición
        else {
          rollTranslateY.value = withSpring(basePos, { damping: 22, stiffness: 220 });
        }
      });

    // Estilo animado de la cinta continua que rueda
    const rollStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: rollTranslateY.value }],
      };
    });

    // Estilo animado del sello estampado en vivo
    const stampAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotate: '-7deg' }, { scale: stampScale.value }],
        opacity: stampOpacity.value,
      };
    });

    const paperBg = isDark ? '#181822' : '#FDFCF8';
    const paperBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)';

    // Ventana deslizante de índices visibles (anterior, actual, siguiente y siguientes precargados)
    const startIndex = Math.max(0, currentIndex - 2);
    const endIndex = Math.min(deck.length - 1, currentIndex + 3);

    const visibleIndices = useMemo(() => {
      const list: number[] = [];
      for (let i = startIndex; i <= endIndex; i++) {
        list.push(i);
      }
      return list;
    }, [startIndex, endIndex]);

    return (
      <View style={styles.frameContainer}>
        {/* Rodillo / Chasis metálico superior de la máquina */}
        <View
          style={[
            styles.platenRollerBar,
            styles.rollerTop,
            {
              backgroundColor: isDark ? '#121218' : '#ECE8DE',
              borderBottomColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            },
          ]}
        >
          <View style={[styles.rollerNotch, { backgroundColor: isDark ? '#2E2E3C' : '#D5CFC2' }]} />
          <View style={[styles.rollerNotch, { backgroundColor: isDark ? '#2E2E3C' : '#D5CFC2' }]} />
          <View style={[styles.rollerNotch, { backgroundColor: isDark ? '#2E2E3C' : '#D5CFC2' }]} />
        </View>

        {/* Ventana de visualización de la cinta continua */}
        <GestureDetector gesture={panGesture}>
          <View
            style={[
              styles.tapeViewport,
              {
                backgroundColor: paperBg,
                borderColor: paperBorder,
              },
            ]}
          >
            {/* Margen perforado izquierdo fijo (Tractor Feed) */}
            <TractorHoles isDark={isDark} />

            {/* Bobina móvil continua con posicionamiento absoluto inmutable de fichas */}
            <View style={styles.centerTapeContent}>
              <Animated.View style={[styles.continuousPaperTrack, rollStyle]}>
                {visibleIndices.map((i) => {
                  const card = deck[i];
                  if (!card) return null;
                  const isCurrent = i === currentIndex;
                  const isCardStamped = Boolean(selectedMap[card.n]);

                  return (
                    <View
                      key={card.n}
                      style={[
                        styles.ticketSlotWrapper,
                        {
                          top: i * SLOT_HEIGHT,
                        },
                      ]}
                    >
                      <NameTicket
                        item={card}
                        pageNumber={i + 1}
                        totalPages={totalCards}
                        partnerLiked={Boolean(partnerLikes[card.n])}
                        isStamped={isCardStamped}
                        stampAnimatedStyle={isCurrent && isAnimating ? stampAnimatedStyle : undefined}
                        isDark={isDark}
                      />
                    </View>
                  );
                })}
              </Animated.View>
            </View>

            {/* Margen perforado derecho fijo (Tractor Feed) */}
            <TractorHoles isDark={isDark} />
          </View>
        </GestureDetector>

        {/* Rodillo / Chasis metálico inferior de la máquina */}
        <View
          style={[
            styles.platenRollerBar,
            styles.rollerBottom,
            {
              backgroundColor: isDark ? '#121218' : '#ECE8DE',
              borderTopColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            },
          ]}
        >
          <View style={[styles.rollerNotch, { backgroundColor: isDark ? '#2E2E3C' : '#D5CFC2' }]} />
          <View style={[styles.rollerNotch, { backgroundColor: isDark ? '#2E2E3C' : '#D5CFC2' }]} />
          <View style={[styles.rollerNotch, { backgroundColor: isDark ? '#2E2E3C' : '#D5CFC2' }]} />
        </View>
      </View>
    );
  }
);

PaperTapeRoll.displayName = 'PaperTapeRoll';

const styles = StyleSheet.create({
  frameContainer: {
    width: TAPE_WIDTH,
    height: FRAME_HEIGHT,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  platenRollerBar: {
    width: '100%',
    height: ROLLER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 15,
  },
  rollerTop: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
  },
  rollerBottom: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
  },
  rollerNotch: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
  },
  tapeViewport: {
    width: '100%',
    height: SLOT_HEIGHT,
    flexDirection: 'row',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  tractorColumn: {
    width: 20,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    zIndex: 10,
  },
  tractorHole: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
  },
  centerTapeContent: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  continuousPaperTrack: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  ticketSlotWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SLOT_HEIGHT,
  },
  ticketContainer: {
    width: '100%',
    height: SLOT_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  emptyTapeText: {
    textAlign: 'center',
    marginTop: 180,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  partnerLikedRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  partnerLikedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  typewriterBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  typewriterBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  typewriterMetaText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dashedRule: {
    width: '100%',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  dashedRuleBottom: {
    width: '100%',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginTop: 'auto',
  },
  ticketBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    paddingHorizontal: 12,
    minHeight: 52,
    width: '100%',
  },
  nameTitle: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    zIndex: 2,
  },
  // Sello oficial "SELECCIONADO" en la parte inferior derecha con opacidad transparente
  stampContainer: {
    position: 'absolute',
    right: 14,
    bottom: 29,
    transform: [{ rotate: '-7deg' }],
    borderWidth: 1.5,
    borderRadius: 7,
    padding: 2,
    zIndex: 10,
    opacity: 0.48,
    shadowColor: '#E8735A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 3,
  },
  stampInnerBorder: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 1,
  },
  stampSubText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  stampMainText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  meaningText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 270,
    marginBottom: 10,
  },
  detailsBox: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  curiosoBlock: {
    alignItems: 'center',
  },
  curiosoText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
