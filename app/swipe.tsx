import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useSolo } from '../src/contexts/SoloContext';
import { useRoom } from '../src/contexts/RoomContext';
import { SwipeableCardDeck, ActionButton, MatchModal } from '../src/components';

export default function SwipeScreen() {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();

  const {
    deck,
    currentIndex,
    currentCard,
    totalCards,
    history,
    likedNames,
    isFinished,
    vote,
    undo,
    startSession,
  } = useSolo();

  const {
    roomCode,
    partnerLikes,
    submitVote,
    lastMatch,
    clearLastMatch,
    matches,
    leaveRoom,
  } = useRoom();

  // Si entra directamente a /swipe sin haber configurado, arrancamos con la baraja completa
  useEffect(() => {
    if (deck.length === 0) {
      startSession();
    }
  }, [deck.length, startSession]);

  // Si terminó la baraja, navegar a la pantalla de resumen
  useEffect(() => {
    if (isFinished) {
      router.replace('/summary');
    }
  }, [isFinished, router]);

  const handleVote = (liked: boolean) => {
    if (!currentCard) return;
    if (roomCode) {
      submitVote(currentCard, liked).catch(() => {});
    }
    vote(liked);
  };

  const handleExit = () => {
    if (roomCode) {
      Alert.alert(
        '¿Salir de la sala?',
        'Si sales de la sala se desconectará la sesión compartida.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Salir',
            style: 'destructive',
            onPress: () => {
              leaveRoom();
              router.replace('/');
            },
          },
        ]
      );
    } else {
      router.replace('/');
    }
  };

  const handleFinishEarly = () => {
    if (history.length === 0) {
      router.replace('/');
      return;
    }
    Alert.alert(
      '¿Ver resumen?',
      `Has visto ${history.length} nombres y te han gustado ${likedNames.length}. ¿Deseas ir al resumen?`,
      [
        { text: 'Continuar explorando', style: 'cancel' },
        {
          text: 'Ver resumen',
          onPress: () => router.push('/summary'),
        },
      ]
    );
  };

  const nextCard = currentIndex + 1 < deck.length ? deck[currentIndex + 1] : null;
  const isCurrentPartnerLiked = Boolean(currentCard && partnerLikes[currentCard.n]);
  const isNextPartnerLiked = Boolean(nextCard && partnerLikes[nextCard.n]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Cabecera */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity
          onPress={handleExit}
          style={[styles.headerButton, { backgroundColor: colors.surface2, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.headerButtonText, { color: colors.text2 }]}>Salir</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          {roomCode && (
            <Text style={[styles.roomCodeBadge, { color: colors.secondary, fontSize: typography.fontSize.xs }]}>
              SALA {roomCode} · {matches.length} Matches
            </Text>
          )}
          <Text style={[styles.progressText, { color: colors.text }]}>
            {totalCards > 0 ? `${currentIndex + 1} de ${totalCards}` : 'Cargando...'}
          </Text>
          <Text style={[styles.likedBadge, { color: colors.salmon, fontSize: typography.fontSize.xs }]}>
            ♥ {likedNames.length} guardados
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleFinishEarly}
          style={[styles.headerButton, { backgroundColor: colors.surface2, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.headerButtonText, { color: colors.salmon }]}>Resumen</Text>
        </TouchableOpacity>
      </View>

      {/* Baraja central */}
      <View style={styles.deckContainer}>
        {currentCard ? (
          <SwipeableCardDeck
            currentCard={currentCard}
            nextCard={nextCard}
            partnerLiked={isCurrentPartnerLiked}
            nextPartnerLiked={isNextPartnerLiked}
            onSwipeLeft={() => handleVote(false)}
            onSwipeRight={() => handleVote(true)}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text2 }]}>
              {isFinished ? '¡Has completado la baraja!' : 'Preparando baraja...'}
            </Text>
          </View>
        )}
      </View>

      {/* Controles de acción inferior */}
      <View style={[styles.bottomControls, { paddingBottom: spacing.lg }]}>
        {/* Descartar */}
        <ActionButton
          type="dislike"
          onPress={() => handleVote(false)}
          disabled={!currentCard}
        />

        {/* Deshacer */}
        <ActionButton
          type="undo"
          onPress={undo}
          disabled={history.length === 0}
        />

        {/* Me gusta */}
        <ActionButton
          type="like"
          onPress={() => handleVote(true)}
          disabled={!currentCard}
        />
      </View>

      {/* Modal de celebración de Match en Tiempo Real */}
      <MatchModal match={lastMatch} onClose={clearLastMatch} />
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
    paddingVertical: 12,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
  },
  roomCodeBadge: {
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  likedBadge: {
    fontWeight: '600',
    marginTop: 2,
  },
  deckContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
});
