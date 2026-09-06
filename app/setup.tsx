import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../src/theme';
import { useSolo, filterNames } from '../src/contexts/SoloContext';
import { useRoom } from '../src/contexts/RoomContext';
import { NAMES_DB, ORIGINS } from '../src/data/names';
import { FilterGender, FilterDuration, FilterExtra, IFilters } from '../src/types';
import { FilterChip, ConfirmExitModal } from '../src/components';

export default function SetupScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; midGame?: string }>();

  const { filters: initialFilters, startSession } = useSolo();
  const { roomCode, isHost, publishFilters, leaveRoom } = useRoom();

  const isSolo = params.mode === 'solo' || (!roomCode && !isHost);
  const isMidGame = params.midGame === 'true';

  const [selectedGender, setSelectedGender] = useState<FilterGender>(
    initialFilters.gender || 'all'
  );
  const [selectedOrigin, setSelectedOrigin] = useState<string>(
    initialFilters.origins[0] || 'todos'
  );
  const [selectedDuration, setSelectedDuration] = useState<FilterDuration>(
    initialFilters.duration || 'normal'
  );
  const [selectedExtra, setSelectedExtra] = useState<FilterExtra>(
    initialFilters.extra || null
  );

  const [isStarting, setIsStarting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Comportamiento de extras exclusivos: al activar un extra se resetea origen
  const handleSelectExtra = (extra: FilterExtra) => {
    if (selectedExtra === extra) {
      setSelectedExtra(null);
    } else {
      setSelectedExtra(extra);
      setSelectedOrigin('todos');
    }
  };

  const handleSelectOrigin = (origin: string) => {
    setSelectedOrigin(origin);
    setSelectedExtra(null);
  };

  const activeFilters: IFilters = useMemo(
    () => ({
      gender: selectedGender,
      origins: selectedOrigin === 'todos' ? [] : [selectedOrigin],
      duration: selectedDuration,
      extra: selectedExtra,
    }),
    [selectedGender, selectedOrigin, selectedDuration, selectedExtra]
  );

  const availableCount = useMemo(() => {
    const allMatching = filterNames(NAMES_DB, activeFilters);
    if (selectedDuration === 'flash') return Math.min(5, allMatching.length);
    if (selectedDuration === 'normal') return Math.min(20, allMatching.length);
    if (selectedDuration === 'long') return Math.min(40, allMatching.length);
    return allMatching.length;
  }, [activeFilters, selectedDuration]);

  const handleStart = async () => {
    setIsStarting(true);
    if (!isSolo && roomCode) {
      // Flujo en Pareja: Host publica filtros y semilla aleatoria
      const seed = Math.floor(Math.random() * 1000000);
      await publishFilters(activeFilters, seed);
      startSession(activeFilters, seed, false);
      router.replace('/swipe');
    } else {
      // Flujo en Solitario: inicia baraja local (preserva historial si viene de mid-game)
      startSession(activeFilters, undefined, isMidGame);
      router.replace('/swipe');
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (!isSolo && roomCode) {
      leaveRoom();
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Cabecera */}
      <View
        style={[
          styles.header,
          { paddingHorizontal: spacing.md, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={[
            styles.backButton,
            { backgroundColor: colors.surface2, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: colors.text2 }]}>
            ← Volver
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isSolo ? 'Configuración' : 'Filtros de Sala'}
        </Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Título y subtítulo según rol */}
        <View style={styles.titleSection}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            Antes de empezar
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.text2 }]}>
            {isSolo
              ? 'Elige qué nombres quieres ver'
              : 'Elige qué nombres queréis ver'}
          </Text>
        </View>

        {/* Sección: Género */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Género
          </Text>
          <View style={styles.chipsRow}>
            <FilterChip
              label="Todos"
              selected={selectedGender === 'all'}
              onPress={() => setSelectedGender('all')}
            />
            <FilterChip
              label="Niña ♀"
              selected={selectedGender === 'girl'}
              onPress={() => setSelectedGender('girl')}
            />
            <FilterChip
              label="Niño ♂"
              selected={selectedGender === 'boy'}
              onPress={() => setSelectedGender('boy')}
            />
            <FilterChip
              label="Neutro ⚥"
              selected={selectedGender === 'neutral'}
              onPress={() => setSelectedGender('neutral')}
            />
          </View>
        </View>

        {/* Sección: Origen */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Origen
          </Text>
          <View style={styles.chipsWrap}>
            <FilterChip
              label="Todos"
              selected={selectedOrigin === 'todos'}
              onPress={() => handleSelectOrigin('todos')}
            />
            {ORIGINS.map((origin) => {
              const lower = origin.toLowerCase();
              return (
                <FilterChip
                  key={origin}
                  label={origin.charAt(0).toUpperCase() + origin.slice(1)}
                  selected={selectedOrigin === lower}
                  onPress={() => handleSelectOrigin(lower)}
                />
              );
            })}
          </View>
        </View>

        {/* Sección: Duración del juego */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Duración de la baraja
          </Text>
          <View style={styles.chipsRow}>
            <FilterChip
              label="Flash (~5)"
              selected={selectedDuration === 'flash'}
              onPress={() => setSelectedDuration('flash')}
            />
            <FilterChip
              label="Normal (~20)"
              selected={selectedDuration === 'normal'}
              onPress={() => setSelectedDuration('normal')}
            />
            <FilterChip
              label="Largo (~40)"
              selected={selectedDuration === 'long'}
              onPress={() => setSelectedDuration('long')}
            />
          </View>
        </View>

        {/* Sección: Extras (Packs temáticos) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Packs temáticos (extras)
          </Text>
          <View style={styles.chipsWrap}>
            <FilterChip
              label="🔥 Calorro"
              selected={selectedExtra === 'calorro'}
              onPress={() => handleSelectExtra('calorro')}
            />
            <FilterChip
              label="🌎 Sudamérica Fusión"
              selected={selectedExtra === 'sudamerica'}
              onPress={() => handleSelectExtra('sudamerica')}
            />
            <FilterChip
              label="👑 Reyes y Emperadores"
              selected={selectedExtra === 'reyes'}
              onPress={() => handleSelectExtra('reyes')}
            />
          </View>
        </View>

        {/* Nota en pareja */}
        {!isSolo && (
          <View
            style={[
              styles.pairNoteBox,
              { backgroundColor: colors.surface2, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.pairNoteText, { color: colors.salmon }]}>
              ℹ Solo tú eliges los filtros — tu pareja recibirá los mismos.
            </Text>
          </View>
        )}

        {/* Caja de Consejo */}
        <View
          style={[
            styles.tipBox,
            { backgroundColor: colors.surface, borderColor: colors.border2 },
          ]}
        >
          <Text style={[styles.tipTitle, { color: colors.text }]}>
            💡 Consejo:
          </Text>
          <Text style={[styles.tipText, { color: colors.text2 }]}>
            Al final de cada partida podrás explorar más nombres y cambiar los filtros. ¡No te preocupes demasiado!
          </Text>
        </View>

        {/* Contador de nombres listos */}
        <View style={styles.counterBox}>
          <Text style={[styles.counterText, { color: colors.text3 }]}>
            Baraja preparada: <Text style={{ color: colors.salmon, fontWeight: '700' }}>{availableCount}</Text> nombres
          </Text>
        </View>
      </ScrollView>

      {/* Botón inferior fijo */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={handleStart}
          disabled={isStarting || availableCount === 0}
          style={[
            styles.startButton,
            {
              backgroundColor:
                availableCount > 0 ? colors.salmon : colors.surface2,
            },
          ]}
          activeOpacity={0.8}
        >
          {isStarting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.startButtonText}>¡Empezar! →</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de confirmación al salir */}
      <ConfirmExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
        isPairMode={!isSolo}
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
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 24,
  },
  titleSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pairNoteBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  pairNoteText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  tipBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  counterBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  counterText: {
    fontSize: 13,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  startButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
