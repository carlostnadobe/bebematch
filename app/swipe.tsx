import { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  LightningBoltIcon,
  FireIcon,
  SparklesIcon,
  AdjustmentsIcon,
  CheckIcon,
  BookmarkIcon,
} from 'react-native-heroicons/solid';
import { useTheme } from '../src/theme';
import { useSolo } from '../src/contexts/SoloContext';
import { useRoom } from '../src/contexts/RoomContext';
import {
  SwipeableCardDeck,
  SwipeableCardDeckRef,
  ActionButton,
  MatchModal,
  LikedMatchesModal,
  ConfirmExitModal,
  HeaderHomeButton,
} from '../src/components';

export default function SwipeScreen() {
  const { colors, spacing, isDark } = useTheme();
  const router = useRouter();
  const deckRef = useRef<SwipeableCardDeckRef>(null);

  const {
    deck,
    currentIndex,
    currentCard,
    totalCards,
    remainingCount,
    history,
    likedNames,
    isFinished,
    vote,
    startSession,
  } = useSolo();

  const {
    roomCode,
    partnerLikes,
    partnerDone,
    partnerProgress,
    rushMode,
    setRushMode,
    submitVote,
    notifyProgress,
    notifyDone,
    lastMatch,
    clearLastMatch,
    matches,
    leaveRoom,
  } = useRoom();

  const isPairMode = Boolean(roomCode);

  const [showExitModal, setShowExitModal] = useState(false);
  const [showLikedModal, setShowLikedModal] = useState(false);
  const [rushToastName, setRushToastName] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Si entra directamente a /swipe sin haber configurado, arrancamos con la baraja completa
  useEffect(() => {
    if (deck.length === 0) {
      startSession();
    }
  }, [deck.length, startSession]);

  // Al terminar la baraja: si es pareja y la pareja ya terminó, o si es solitario, ir al resumen
  useEffect(() => {
    if (!isFinished) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isPairMode) {
      notifyDone();
      if (partnerDone) {
        timer = setTimeout(() => router.replace('/summary'), 800);
      }
    } else {
      router.replace('/summary');
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFinished, isPairMode, partnerDone, notifyDone, router]);

  // Si la pareja termina mientras estamos esperando
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isFinished && isPairMode && partnerDone) {
      timer = setTimeout(() => router.replace('/summary'), 600);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFinished, isPairMode, partnerDone, router]);

  // Mostrar toast rápido de RUSH si hay match con modo RUSH activo
  useEffect(() => {
    if (lastMatch && rushMode) {
      setRushToastName(lastMatch.n);
      clearLastMatch();
      Animated.sequence([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1600),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setRushToastName(null));
    }
  }, [lastMatch, rushMode, clearLastMatch, toastOpacity]);

  const handleVote = (liked: boolean) => {
    if (!currentCard) return;
    if (isPairMode) {
      submitVote(currentCard, liked).catch(() => {});
      notifyProgress(currentIndex + 1).catch(() => {});
    }
    vote(liked);
  };

  const handleSkip = () => {
    // Saltar equivale a voto neutral/no decidir
    handleVote(false);
  };

  // Racha de me gustas consecutivos
  const streak = useMemo(() => {
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].liked) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [history]);

  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (isPairMode) {
      leaveRoom();
    }
    router.replace('/');
  };

  const handleChangeFiltersMidGame = () => {
    router.push('/setup?mode=solo&midGame=true');
  };

  const nextCard = currentIndex + 1 < deck.length ? deck[currentIndex + 1] : null;
  const thirdCard = currentIndex + 2 < deck.length ? deck[currentIndex + 2] : null;
  const isCurrentPartnerLiked = Boolean(currentCard && partnerLikes[currentCard.n]);
  const isNextPartnerLiked = Boolean(nextCard && partnerLikes[nextCard.n]);
  const isThirdPartnerLiked = Boolean(thirdCard && partnerLikes[thirdCard.n]);

  // Barra de progreso calculada (0 a 1)
  const myProgressRatio = totalCards > 0 ? currentIndex / totalCards : 0;
  const partnerProgressRatio =
    totalCards > 0 ? Math.min(1, partnerProgress / totalCards) : 0;

  // Si hemos terminado la baraja en pareja pero la pareja aún no: pantalla de espera de resumen
  if (isFinished && isPairMode && !partnerDone) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        <View style={styles.waitingSummaryContent}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.salmonLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <SparklesIcon size={40} color={colors.salmon} />
          </View>
          <Text style={[styles.waitingSummaryTitle, { color: colors.text }]}>
            ¡Ya has terminado!
          </Text>
          <Text style={[styles.waitingSummarySubtitle, { color: colors.text2 }]}>
            Esperando a que tu pareja termine de votar…
          </Text>

          <View
            style={[
              styles.partnerProgressCard,
              { backgroundColor: colors.surface, borderColor: colors.border2 },
            ]}
          >
            <View style={styles.partnerProgressHeader}>
              <Text style={[styles.partnerProgressLabel, { color: colors.text }]}>
                Progreso de tu pareja:
              </Text>
              <Text style={[styles.partnerProgressValue, { color: colors.salmon }]}>
                {partnerProgress} / {totalCards}
              </Text>
            </View>

            <View style={[styles.progressBarTrack, { backgroundColor: colors.surface2 }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.salmon,
                    width: `${partnerProgressRatio * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setShowLikedModal(true)}
            style={[
              styles.seeLikedButton,
              { backgroundColor: colors.surface2, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.seeLikedButtonText, { color: colors.text }]}>
              Ver mis votos ({likedNames.length}) y matches ({matches.length})
            </Text>
          </TouchableOpacity>
        </View>

        <LikedMatchesModal
          visible={showLikedModal}
          onClose={() => setShowLikedModal(false)}
          likedNames={likedNames}
          matches={matches}
          isSolo={!isPairMode}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Toast rápido para modo RUSH */}
      {rushToastName && (
        <Animated.View
          style={[
            styles.rushToast,
            {
              backgroundColor: colors.surface,
              borderColor: colors.salmon,
              opacity: toastOpacity,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BookmarkIcon size={16} color={colors.salmon} />
            <Text style={[styles.rushToastText, { color: colors.salmon }]}>
              ¡PÁGINA COMPARTIDA: {rushToastName.toUpperCase()}!
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Barra superior */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        {/* Botón Home con confirmación */}
        <HeaderHomeButton onPress={() => setShowExitModal(true)} />

        {/* Centro de la barra */}
        <View style={styles.headerCenter}>
          {isPairMode ? (
            <View style={styles.pairHeaderRow}>
              {/* Toggle RUSH */}
              <TouchableOpacity
                onPress={() => setRushMode(!rushMode)}
                style={[
                  styles.rushToggle,
                  {
                    backgroundColor: rushMode ? colors.salmon : colors.surface2,
                    borderColor: rushMode ? colors.salmon : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <LightningBoltIcon size={14} color={rushMode ? '#FFFFFF' : colors.text2} />
                  <Text
                    style={[
                      styles.rushToggleText,
                      { color: rushMode ? '#FFFFFF' : colors.text2 },
                    ]}
                  >
                    RUSH
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Contador de Matches interactivo */}
              <TouchableOpacity
                onPress={() => setShowLikedModal(true)}
                style={[
                  styles.matchesBadge,
                  {
                    backgroundColor:
                      matches.length > 0
                        ? isDark
                          ? 'rgba(232, 115, 90, 0.2)'
                          : 'rgba(212, 105, 79, 0.15)'
                        : colors.surface2,
                    borderColor:
                      matches.length > 0 ? colors.salmon : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <BookmarkIcon size={14} color={matches.length > 0 ? colors.salmon : colors.text2} />
                  <Text
                    style={[
                      styles.matchesBadgeText,
                      {
                        color:
                          matches.length > 0 ? colors.salmon : colors.text2,
                      },
                    ]}
                  >
                    {matches.length}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            /* En Solitario: botón para cambiar filtros a media partida */
            <TouchableOpacity
              onPress={handleChangeFiltersMidGame}
              style={[
                styles.midGameFilterBtn,
                { backgroundColor: colors.surface2, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AdjustmentsIcon size={14} color={colors.text2} />
                <Text style={[styles.midGameFilterText, { color: colors.text2 }]}>
                  Filtros
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Ver guardados / lista */}
        <TouchableOpacity
          onPress={() => setShowLikedModal(true)}
          style={[
            styles.headerCircleBtn,
            { backgroundColor: colors.surface2, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
        >
          <BookmarkIcon size={20} color={colors.text2} />
        </TouchableOpacity>
      </View>

      {/* Barras de Progreso */}
      <View style={[styles.progressSection, { paddingHorizontal: spacing.lg }]}>
        <View style={styles.progressTextRow}>
          <Text style={[styles.progressLabel, { color: colors.text2 }]}>
            {remainingCount} restantes
          </Text>
          {streak >= 3 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <FireIcon size={14} color={colors.salmon} />
              <Text style={[styles.streakBadge, { color: colors.salmon }]}>
                {streak} seguidos
              </Text>
            </View>
          )}
          {isPairMode && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <CheckIcon size={14} color={colors.success} />
              <Text style={[styles.partnerStatusText, { color: colors.success }]}>
                pareja lista
              </Text>
            </View>
          )}
        </View>

        {/* Barra de progreso propia (tú) */}
        <View style={[styles.progressBarTrack, { backgroundColor: colors.surface2 }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: colors.salmon,
                width: `${myProgressRatio * 100}%`,
              },
            ]}
          />
        </View>

        {/* Barra de progreso de pareja si está en modo sala */}
        {isPairMode && (
          <View
            style={[
              styles.progressBarTrack,
              styles.partnerTrack,
              { backgroundColor: colors.surface2 },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: '#A78BFA',
                  width: `${partnerProgressRatio * 100}%`,
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Baraja central */}
      <View style={[styles.deckContainer, { paddingHorizontal: spacing.lg }]}>
        {currentCard ? (
          <SwipeableCardDeck
            ref={deckRef}
            currentIndex={currentIndex}
            totalPages={deck.length}
            currentCard={currentCard}
            nextCard={nextCard}
            thirdCard={thirdCard}
            partnerLiked={isCurrentPartnerLiked}
            nextPartnerLiked={isNextPartnerLiked}
            thirdPartnerLiked={isThirdPartnerLiked}
            onSwipeLeft={() => handleVote(false)}
            onSwipeRight={() => handleVote(true)}
            onSwipeUp={handleSkip}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text2 }]}>
              Cargando cuaderno…
            </Text>
          </View>
        )}
      </View>

      {/* Botones inferiores del Cuaderno (Siguiente página · Anotar nombre) */}
      <View style={[styles.bottomBar, { paddingHorizontal: spacing.md }]}>
        <ActionButton
          type="dislike"
          onPress={() => deckRef.current?.swipeLeft()}
          disabled={!currentCard}
        />
        <ActionButton
          type="like"
          onPress={() => deckRef.current?.swipeRight()}
          disabled={!currentCard}
        />
      </View>

      {/* Modal de Match completo (solo cuando RUSH está desactivado) */}
      {!rushMode && (
        <MatchModal
          match={lastMatch}
          onClose={clearLastMatch}
          onViewList={() => {
            clearLastMatch();
            setShowLikedModal(true);
          }}
        />
      )}

      {/* Modal de Lista de Likes y Matches */}
      <LikedMatchesModal
        visible={showLikedModal}
        onClose={() => setShowLikedModal(false)}
        likedNames={likedNames}
        matches={matches}
        isSolo={!isPairMode}
      />

      {/* Modal de confirmación al salir */}
      <ConfirmExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
        isPairMode={isPairMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  headerCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 18,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pairHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rushToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  rushToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  matchesBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  matchesBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  midGameFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  midGameFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    paddingVertical: 8,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  partnerStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  partnerTrack: {
    marginTop: 4,
    height: 3,
  },
  deckContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  rushToast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  rushToastText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  waitingSummaryContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  waitingSummaryTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  waitingSummarySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  partnerProgressCard: {
    width: '100%',
    maxWidth: 340,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  partnerProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  partnerProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  partnerProgressValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  seeLikedButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  seeLikedButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
