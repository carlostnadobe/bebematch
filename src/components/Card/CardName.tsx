import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BookmarkIcon } from 'react-native-heroicons/solid';
import { IName, Gender } from '../../types';
import { useTheme } from '../../theme';
import { borderRadius } from '../../theme/spacing';

export interface CardNameProps {
  item: IName;
  partnerLiked?: boolean;
  pageNumber?: number;
  totalPages?: number;
}

export const CardName: React.FC<CardNameProps> = React.memo(
  ({ item, partnerLiked = false, pageNumber, totalPages }) => {
    const { colors, spacing, typography, isDark } = useTheme();

    const genderInfo = useMemo(() => {
      switch (item.g as Gender) {
        case 'girl':
          return {
            bg: isDark ? 'rgba(232, 115, 90, 0.16)' : 'rgba(195, 83, 56, 0.12)',
            text: colors.salmon,
            border: isDark ? 'rgba(232, 115, 90, 0.3)' : 'rgba(195, 83, 56, 0.25)',
            label: 'Niña',
          };
        case 'boy':
          return {
            bg: isDark ? 'rgba(96, 165, 250, 0.16)' : 'rgba(59, 130, 246, 0.12)',
            text: isDark ? '#60A5FA' : '#2563EB',
            border: isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.25)',
            label: 'Niño',
          };
        case 'neutral':
        default:
          return {
            bg: isDark ? 'rgba(167, 139, 250, 0.16)' : 'rgba(147, 51, 234, 0.12)',
            text: isDark ? '#A78BFA' : '#7E22CE',
            border: isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(147, 51, 234, 0.25)',
            label: 'Unisex',
          };
      }
    }, [item.g, colors.salmon, isDark]);

    return (
      <View
        style={[
          styles.pageContainer,
          {
            backgroundColor: isDark ? '#1A1A22' : '#FDFCF9',
            borderColor: colors.border2,
          },
        ]}
      >
        {/* Marcapáginas de pareja (si la pareja anotó esta página) */}
        {partnerLiked && (
          <View
            style={[
              styles.bookmarkRibbon,
              { backgroundColor: colors.salmon },
            ]}
          >
            <BookmarkIcon size={12} color="#FFFFFF" />
            <Text style={styles.bookmarkText}>Anotado por tu pareja</Text>
          </View>
        )}

        <View style={styles.pageContentArea}>
          <ScrollView
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={[styles.scrollContent, { paddingVertical: spacing.xs }]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Cabecera de la página: género, número de página y origen */}
            <View style={[styles.pageHeaderRow, { marginBottom: spacing.sm }]}>
            <View
              style={[
                styles.genderBadge,
                {
                  backgroundColor: genderInfo.bg,
                  borderColor: genderInfo.border,
                },
              ]}
            >
              <Text style={[styles.genderText, { color: genderInfo.text }]}>
                {genderInfo.label}
              </Text>
            </View>

            {pageNumber ? (
              <Text style={[styles.pageNumberText, { color: colors.text3 }]}>
                PÁGINA {pageNumber}
                {totalPages ? ` / ${totalPages}` : ''}
              </Text>
            ) : null}

            <Text style={[styles.originText, { color: colors.text3 }]}>
              {item.o ? item.o.toUpperCase() : 'ORIGEN'}
            </Text>
          </View>

          {/* Línea divisoria editorial sutil */}
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: colors.border },
            ]}
          />

          {/* Nombre principal */}
          <Text
            style={[
              styles.nameText,
              {
                color: colors.text,
                fontWeight: typography.fontWeight.bold,
                marginVertical: spacing.sm,
              },
            ]}
          >
            {item.n}
          </Text>

          {/* Significado */}
          <Text
            style={[
              styles.meaningText,
              {
                color: colors.text2,
                fontSize: typography.fontSize.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            &ldquo;{item.m}&rdquo;
          </Text>

          {/* Información complementaria en estilo anotación */}
          {(item.santo || item.curioso || (item.famosos && item.famosos.length > 0)) && (
            <View
              style={[
                styles.notesContainer,
                {
                  borderTopColor: colors.border,
                  paddingTop: spacing.sm,
                  gap: spacing.xs,
                },
              ]}
            >
              {/* Santo */}
              {item.santo && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.text3 }]}>
                    Santo:
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {item.santo}
                  </Text>
                </View>
              )}

              {/* Anotación curiosa */}
              {item.curioso && (
                <View
                  style={[
                    styles.curiosoBox,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: colors.border,
                      padding: spacing.sm,
                      marginTop: spacing.xs,
                    },
                  ]}
                >
                  <Text style={[styles.curiosoTitle, { color: colors.salmon }]}>
                    ANOTACIÓN DEL CUADERNO
                  </Text>
                  <Text style={[styles.curiosoText, { color: colors.text2 }]}>
                    {item.curioso}
                  </Text>
                </View>
              )}

              {/* Figuras históricas / famosos */}
              {item.famosos && item.famosos.length > 0 && (
                <View style={[styles.famososSection, { marginTop: spacing.xs }]}>
                  <Text style={[styles.famososLabel, { color: colors.text3 }]}>
                    FIGURAS NOTABLES
                  </Text>
                  <View style={[styles.famososChips, { gap: spacing.xs }]}>
                    {item.famosos.map((famoso, index) => (
                      <View
                        key={index}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: colors.surface2,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: colors.text2 }]}>
                          {famoso}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
          </ScrollView>
        </View>
      </View>
    );
  }
);

CardName.displayName = 'CardName';

const styles = StyleSheet.create({
  pageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  pageContentArea: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  bookmarkRibbon: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  bookmarkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrollContent: {
    alignItems: 'center',
  },
  pageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  genderBadge: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pageNumberText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  originText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  dividerLine: {
    width: '100%',
    height: 1,
    marginVertical: 4,
  },
  nameText: {
    fontSize: 38,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  meaningText: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    maxWidth: 290,
  },
  notesContainer: {
    width: '100%',
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  curiosoBox: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  curiosoTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  curiosoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  famososSection: {
    alignItems: 'center',
  },
  famososLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  famososChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
});
