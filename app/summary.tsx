import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HeartIcon, FilterIcon } from 'react-native-heroicons/solid';
import { ShareIcon, RefreshIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../src/theme';
import { useSolo } from '../src/contexts/SoloContext';
import { useRoom } from '../src/contexts/RoomContext';
import { IName } from '../src/types';
import { ConfettiEffect, ConfirmExitModal, HeaderHomeButton } from '../src/components';

export default function SummaryScreen() {
  const { colors, spacing, isDark } = useTheme();
  const router = useRouter();
  const { likedNames, history, refineSession } = useSolo();
  const {
    roomCode,
    matches,
    partnerLikes,
    leaveRoom,
  } = useRoom();

  const isPairMode = Boolean(roomCode);
  const [showExitModal, setShowExitModal] = useState(false);

  // Estadísticas calculadas (según especificación del flujo en pareja)
  const seenCount = history.length;
  const partnerLikesCount = Object.values(partnerLikes).filter(Boolean).length;
  const matchPercentage =
    seenCount > 0 ? Math.round((matches.length / seenCount) * 100) : 0;

  // Nombres que solo le gustaron al usuario (en pareja)
  const onlyMyLikes = useMemo(() => {
    const matchNamesSet = new Set(matches.map((m) => m.n));
    return likedNames.filter((n) => !matchNamesSet.has(n.n));
  }, [likedNames, matches]);

  const handleShare = async () => {
    try {
      if (isPairMode) {
        const namesList = matches.map((m) => m.n).join(', ');
        await Share.share({
          message: `¡Nuestros nombres favoritos de BebéMatch son: ${namesList}!`,
        });
      } else {
        const namesList = likedNames.map((n) => n.n).join(', ');
        await Share.share({
          message: `Mis nombres favoritos en BebéMatch son: ${namesList}`,
        });
      }
    } catch (e) {
      console.warn('Error compartiendo:', e);
    }
  };

  const handleRefine = () => {
    if (matches.length < 2) return;
    refineSession(matches);
    router.replace('/swipe');
  };

  const handleExploreMore = () => {
    // Vuelve al setup conservando los filtros actuales
    if (isPairMode) {
      router.replace('/setup');
    } else {
      router.replace('/setup?mode=solo');
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (isPairMode) {
      leaveRoom();
    }
    router.replace('/');
  };

  const renderNameCard = (item: IName, rank?: number, isMatchCard?: boolean) => {
    const isGirl = item.g === 'girl';
    const isBoy = item.g === 'boy';
    const genderLabel = isGirl ? 'Niña' : isBoy ? 'Niño' : 'Unisex';

    return (
      <View
        key={item.n}
        style={[
          styles.nameCard,
          {
            backgroundColor: colors.surface,
            borderColor: isMatchCard ? colors.salmon : colors.border2,
            borderWidth: isMatchCard ? 1.5 : 1,
          },
        ]}
      >
        <View style={styles.nameHeaderRow}>
          <View style={styles.nameLeft}>
            {rank !== undefined && (
              <Text style={[styles.rankBadge, { color: colors.salmon }]}>
                #{rank}
              </Text>
            )}
            <Text
              style={[
                styles.nameTitle,
                {
                  color: colors.text,
                  fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                },
              ]}
            >
              {item.n}
            </Text>
          </View>

          <View style={styles.badgesRow}>
            {isMatchCard && (
              <View
                style={[
                  styles.matchBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(232, 115, 90, 0.2)'
                      : 'rgba(212, 105, 79, 0.15)',
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <HeartIcon size={12} color={colors.salmon} />
                  <Text style={[styles.matchBadgeText, { color: colors.salmon }]}>
                    Coincidencia
                  </Text>
                </View>
              </View>
            )}
            <Text style={[styles.genderSymbol, { color: colors.text3 }]}>
              {genderLabel}
            </Text>
          </View>
        </View>

        <Text style={[styles.meaningText, { color: colors.text2 }]}>
          &ldquo;{item.m}&rdquo;
        </Text>
        <Text style={[styles.originText, { color: colors.text3 }]}>
          Origen {item.o.toLowerCase()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Confetti festivo si hay matches o ≥ 3 favoritos en solitario */}
      {(matches.length > 0 || likedNames.length >= 3) && <ConfettiEffect />}

      {/* Cabecera */}
      <View
        style={[
          styles.header,
          { paddingHorizontal: spacing.md, borderBottomColor: colors.border },
        ]}
      >
        <HeaderHomeButton onPress={() => setShowExitModal(true)} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isPairMode ? `Resumen Sala ${roomCode}` : 'Tus Favoritos'}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md }]}
        ListHeaderComponent={
          <>
            {/* Título Principal */}
            <View style={styles.titleSection}>
              {isPairMode ? (
                <>
                  <Text style={[styles.heroTitle, { color: colors.text }]}>
                    {matches.length > 0
                      ? `${matches.length} coincidencias encontradas`
                      : '¡Habéis terminado!'}
                  </Text>
                  <Text style={[styles.heroSubtitle, { color: colors.text2 }]}>
                    {matches.length > 0
                      ? 'Nombres que os encantan a los dos'
                      : 'No hubo coincidencias directas. ¡Prueba a afinar filtros!'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.heroTitle, { color: colors.text }]}>
                    {likedNames.length > 0
                      ? `${likedNames.length} favoritos guardados`
                      : '¡Has terminado!'}
                  </Text>
                  <Text style={[styles.heroSubtitle, { color: colors.text2 }]}>
                    {likedNames.length > 0
                      ? 'Los nombres que más te han gustado'
                      : 'No has marcado ningún favorito. Prueba con otros filtros.'}
                  </Text>
                </>
              )}
            </View>

            {/* Tira de estadísticas (solo en pareja) */}
            {isPairMode && (
              <View
                style={[
                  styles.statsRow,
                  { backgroundColor: colors.surface, borderColor: colors.border2 },
                ]}
              >
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {seenCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.text3 }]}>
                    VISTOS
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: colors.salmon }]}>
                    {likedNames.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.text3 }]}>
                    TUS LIKES
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#A78BFA' }]}>
                    {partnerLikesCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.text3 }]}>
                    SUS LIKES
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: colors.success }]}>
                    {matchPercentage}%
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.text3 }]}>
                    % MATCH
                  </Text>
                </View>
              </View>
            )}

            {/* Lista rankeada de matches (en pareja) */}
            {isPairMode && matches.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <HeartIcon size={18} color={colors.salmon} />
                  <Text style={[styles.sectionHeading, { color: colors.salmon, marginBottom: 0 }]}>
                    VUESTRAS COINCIDENCIAS
                  </Text>
                </View>
                {matches.map((item, index) =>
                  renderNameCard(item, index + 1, true)
                )}
              </View>
            )}

            {/* Lista rankeada de favoritos (en solitario) */}
            {!isPairMode && likedNames.length > 0 && (
              <View style={styles.sectionContainer}>
                {likedNames.map((item, index) =>
                  renderNameCard(item, index + 1, false)
                )}
              </View>
            )}

            {/* Sección: Solo a ti te gustaron (en pareja) */}
            {isPairMode && onlyMyLikes.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionHeading, { color: colors.text2 }]}>
                  SOLO A TI TE GUSTARON ({onlyMyLikes.length})
                </Text>
                {onlyMyLikes.map((item) => renderNameCard(item, undefined, false))}
              </View>
            )}

            {/* Botones de acción principales */}
            <View style={styles.actionsContainer}>
              {/* Compartir */}
              <TouchableOpacity
                onPress={handleShare}
                style={[styles.primaryActionBtn, { backgroundColor: colors.salmon }]}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ShareIcon size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>
                    {isPairMode ? 'Compartir coincidencias' : 'Compartir favoritos'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Afinar — votar solo los matches (requiere ≥ 2 matches) */}
              {isPairMode && matches.length >= 2 && (
                <TouchableOpacity
                  onPress={handleRefine}
                  style={[
                    styles.secondaryActionBtn,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: colors.salmon,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <FilterIcon size={18} color={colors.salmon} />
                    <Text
                      style={[
                        styles.secondaryActionBtnText,
                        { color: colors.salmon },
                      ]}
                    >
                      Afinar — votar solo las coincidencias
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Explorar más nombres */}
              <TouchableOpacity
                onPress={handleExploreMore}
                style={[
                  styles.secondaryActionBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border2,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RefreshIcon size={18} color={colors.text} />
                  <Text
                    style={[styles.secondaryActionBtnText, { color: colors.text }]}
                  >
                    Explorar más nombres
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        }
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 36,
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  nameCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nameLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankBadge: {
    fontSize: 16,
    fontWeight: '800',
  },
  nameTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  genderSymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  meaningText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  originText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  primaryActionBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
