import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useSolo, filterNames } from '../src/contexts/SoloContext';
import { NAMES_DB, ORIGINS } from '../src/data/names';
import { FilterGender, IFilters } from '../src/types';
import { FilterChip } from '../src/components';

export default function SetupScreen() {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const { filters: initialFilters, startSession } = useSolo();

  const [selectedGender, setSelectedGender] = useState<FilterGender>(initialFilters.gender);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>(initialFilters.origins);

  const activeFilters: IFilters = useMemo(
    () => ({
      gender: selectedGender,
      origins: selectedOrigins,
    }),
    [selectedGender, selectedOrigins]
  );

  const availableCount = useMemo(() => {
    return filterNames(NAMES_DB, activeFilters).length;
  }, [activeFilters]);

  const toggleOrigin = (origin: string) => {
    setSelectedOrigins((prev) => {
      const lower = origin.toLowerCase();
      if (prev.includes(lower)) {
        return prev.filter((o) => o !== lower);
      } else {
        return [...prev, lower];
      }
    });
  };

  const handleStart = () => {
    startSession(activeFilters);
    router.push('/swipe');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Cabecera */}
      <View style={[styles.header, { paddingHorizontal: spacing.md, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface2, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
          <Text style={[styles.backButtonText, { color: colors.text }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configurar Filtros</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección: Género */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.md }]}>
            ¿Qué tipo de nombres buscas?
          </Text>
          <View style={styles.chipsRow}>
            <FilterChip
              label="Todos"
              selected={selectedGender === 'all'}
              onPress={() => setSelectedGender('all')}
            />
            <FilterChip
              label="Niña"
              selected={selectedGender === 'girl'}
              onPress={() => setSelectedGender('girl')}
            />
            <FilterChip
              label="Niño"
              selected={selectedGender === 'boy'}
              onPress={() => setSelectedGender('boy')}
            />
            <FilterChip
              label="Unisex"
              selected={selectedGender === 'neutral'}
              onPress={() => setSelectedGender('neutral')}
            />
          </View>
        </View>

        {/* Sección: Origen */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.md }]}>
              Origen cultural o lingüístico
            </Text>
            {selectedOrigins.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedOrigins([])}>
                <Text style={[styles.clearText, { color: colors.salmon }]}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.text3, fontSize: typography.fontSize.xs }]}>
            Selecciona uno o varios para afinar. Si no seleccionas ninguno, se incluirán todos.
          </Text>

          <View style={styles.chipsWrap}>
            {ORIGINS.map((origin) => {
              const isSelected = selectedOrigins.includes(origin.toLowerCase());
              return (
                <FilterChip
                  key={origin}
                  label={origin.charAt(0).toUpperCase() + origin.slice(1)}
                  selected={isSelected}
                  onPress={() => toggleOrigin(origin)}
                />
              );
            })}
          </View>
        </View>

        {/* Indicador de nombres disponibles */}
        <View
          style={[
            styles.counterBox,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.counterNumber, { color: colors.salmon }]}>{availableCount}</Text>
          <Text style={[styles.counterLabel, { color: colors.text2 }]}>
            {availableCount === 1 ? 'nombre disponible' : 'nombres disponibles con estos filtros'}
          </Text>
        </View>
      </ScrollView>

      {/* Botón inferior fijo */}
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
        <TouchableOpacity
          onPress={handleStart}
          disabled={availableCount === 0}
          style={[
            styles.startButton,
            {
              backgroundColor: availableCount > 0 ? colors.salmon : colors.surface3,
              opacity: availableCount > 0 ? 1 : 0.6,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>
            {availableCount > 0
              ? `Comenzar a explorar (${availableCount})`
              : 'No hay nombres con este filtro'}
          </Text>
        </TouchableOpacity>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
  },
  backArrow: {
    fontSize: 15,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 17,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
    lineHeight: 17,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: -4,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
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
  counterBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  counterNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  footer: {
    borderTopWidth: 1,
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
