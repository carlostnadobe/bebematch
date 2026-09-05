import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useSolo } from '../src/contexts/SoloContext';
import { useRoom } from '../src/contexts/RoomContext';
import { IName } from '../src/types';

export default function SummaryScreen() {
  const { colors, spacing, isDark } = useTheme();
  const router = useRouter();
  const { likedNames, history, restart } = useSolo();
  const { roomCode, matches, leaveRoom } = useRoom();

  const [activeTab, setActiveTab] = useState<'matches' | 'mine'>(
    matches.length > 0 ? 'matches' : 'mine'
  );

  const handleRestart = () => {
    restart();
    router.replace('/swipe');
  };

  const handleExit = () => {
    if (roomCode) {
      leaveRoom();
    }
    router.replace('/');
  };

  const renderNameCard = ({ item }: { item: IName }) => {
    const isGirl = item.g === 'girl';
    const isBoy = item.g === 'boy';
    const isMatch = matches.some((m) => m.n === item.n);

    const badgeColor = isGirl
      ? colors.salmon
      : isBoy
      ? isDark
        ? '#60A5FA'
        : '#2563EB'
      : isDark
      ? '#A78BFA'
      : '#7E22CE';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: isMatch ? colors.salmon : colors.border2,
            borderWidth: isMatch ? 1.8 : 1,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <Text style={[styles.nameTitle, { color: colors.text }]}>{item.n}</Text>
            {isMatch && (
              <View
                style={[
                  styles.matchTag,
                  { backgroundColor: isDark ? 'rgba(232, 115, 90, 0.2)' : 'rgba(212, 105, 79, 0.15)' },
                ]}
              >
                <Text style={[styles.matchTagText, { color: colors.salmon }]}>♥ MATCH</Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: isGirl
                  ? isDark
                    ? 'rgba(232, 115, 90, 0.15)'
                    : 'rgba(212, 105, 79, 0.12)'
                  : isBoy
                  ? isDark
                    ? 'rgba(96, 165, 250, 0.15)'
                    : 'rgba(37, 99, 235, 0.12)'
                  : isDark
                  ? 'rgba(167, 139, 250, 0.15)'
                  : 'rgba(126, 34, 206, 0.12)',
                borderColor: badgeColor,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {isGirl ? 'Niña' : isBoy ? 'Niño' : 'Unisex'}
            </Text>
          </View>
        </View>

        <Text style={[styles.originText, { color: colors.text3 }]}>
          Origen {item.o.toLowerCase()}
        </Text>

        <Text style={[styles.meaningText, { color: colors.text2 }]}>
          &ldquo;{item.m}&rdquo;
        </Text>

        {item.santo && (
          <Text style={[styles.santoText, { color: colors.text3 }]}>
            Santo: {item.santo}
          </Text>
        )}
      </View>
    );
  };

  const displayList = activeTab === 'matches' ? matches : likedNames;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Cabecera */}
      <View style={[styles.header, { paddingHorizontal: spacing.md, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleExit}
          style={[styles.headerButton, { backgroundColor: colors.surface2, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.headerButtonText, { color: colors.text }]}>Inicio</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {roomCode ? `Resumen Sala ${roomCode}` : 'Tus Favoritos'}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Selector de Pestañas (si hay sala) */}
      {roomCode && (
        <View style={[styles.tabsContainer, { paddingHorizontal: spacing.md, marginTop: 12 }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('matches')}
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === 'matches' ? colors.salmon : colors.surface2,
                borderColor: activeTab === 'matches' ? colors.salmon : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'matches' ? '#FFFFFF' : colors.text2 },
              ]}
            >
              💖 Matches ({matches.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('mine')}
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === 'mine' ? colors.salmon : colors.surface2,
                borderColor: activeTab === 'mine' ? colors.salmon : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'mine' ? '#FFFFFF' : colors.text2 },
              ]}
            >
              Mis Favoritos ({likedNames.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Resumen estadístico */}
      <View style={[styles.statsBanner, { backgroundColor: colors.surface2, margin: spacing.md }]}>
        {roomCode && (
          <>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.salmon }]}>{matches.length}</Text>
              <Text style={[styles.statLabel, { color: colors.text2 }]}>Matches</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          </>
        )}
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{likedNames.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text2 }]}>Mis Favoritos</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text3 }]}>{history.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text2 }]}>Explorados</Text>
        </View>
      </View>

      {/* Lista de nombres */}
      {displayList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { color: colors.text3 }]}>
            {activeTab === 'matches' ? '🤝' : '🤍'}
          </Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {activeTab === 'matches'
              ? 'Aún no tenéis matches'
              : 'No has seleccionado favoritos aún'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text2 }]}>
            {activeTab === 'matches'
              ? 'Seguid deslizando nombres; cuando los dos coincidáis en un nombre, aparecerá aquí.'
              : 'Desliza a la derecha o pulsa el botón de corazón para guardar los nombres que más te gusten.'}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/swipe')}
            style={[styles.emptyButton, { backgroundColor: colors.salmon }]}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyButtonText}>Seguir explorando</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={(item) => item.n}
          renderItem={renderNameCard}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: spacing.md }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Barra de acciones inferior */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            padding: spacing.md,
          },
        ]}
      >
        <View style={styles.footerButtons}>
          <TouchableOpacity
            onPress={() => router.push('/setup')}
            style={[
              styles.footerButtonSecondary,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.border2,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.footerButtonSecondaryText, { color: colors.text }]}>
              Cambiar filtros
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRestart}
            style={[styles.footerButtonPrimary, { backgroundColor: colors.salmon }]}
            activeOpacity={0.8}
          >
            <Text style={styles.footerButtonPrimaryText}>Explorar de nuevo</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  matchTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matchTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  meaningText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 2,
  },
  santoText: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  footerButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
