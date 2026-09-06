import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HeartIcon } from 'react-native-heroicons/solid';
import { IName, Gender } from '../../types';
import { useTheme } from '../../theme';
import { borderRadius } from '../../theme/spacing';

export interface CardNameProps {
  item: IName;
  partnerLiked?: boolean;
}

export const CardName: React.FC<CardNameProps> = React.memo(({ item, partnerLiked = false }) => {
  const { colors, spacing, typography, isDark } = useTheme();

  const genderInfo = useMemo(() => {
    switch (item.g as Gender) {
      case 'girl':
        return {
          bg: isDark ? 'rgba(232, 115, 90, 0.16)' : 'rgba(212, 105, 79, 0.12)',
          text: colors.salmon,
          border: isDark ? 'rgba(232, 115, 90, 0.3)' : 'rgba(212, 105, 79, 0.25)',
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
        styles.cardContainer,
        {
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          borderColor: colors.border2,
          shadowOpacity: isDark ? 0.35 : 0.12,
        },
      ]}
    >
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={[styles.scrollContent, { paddingVertical: spacing.sm }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Cabecera: género y origen */}
        <View style={[styles.headerRow, { marginBottom: spacing.md }]}>
          <View
            style={[
              styles.genderBadge,
              {
                backgroundColor: genderInfo.bg,
                borderColor: genderInfo.border,
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs,
              },
            ]}
          >
            <Text
              style={[
                styles.genderText,
                {
                  color: genderInfo.text,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                },
              ]}
            >
              {genderInfo.label}
            </Text>
          </View>

          <Text
            style={[
              styles.originText,
              {
                color: colors.text3,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
              },
            ]}
          >
            {item.o ? item.o.toUpperCase() : 'ORIGEN'}
          </Text>
        </View>

        {/* Separador sutil */}
        <View style={[styles.accentLine, { backgroundColor: colors.surface3, marginBottom: spacing.md }]} />

        {/* Nombre principal */}
        <Text
          style={[
            styles.nameText,
            {
              color: colors.text,
              fontWeight: typography.fontWeight.bold,
              marginBottom: spacing.xs,
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
              marginBottom: spacing.lg,
            },
          ]}
        >
          &ldquo;{item.m}&rdquo;
        </Text>

        {/* Información enriquecida si existe */}
        {(item.santo || item.curioso || (item.famosos && item.famosos.length > 0)) && (
          <View
            style={[
              styles.detailsContainer,
              {
                borderTopColor: colors.border,
                paddingTop: spacing.md,
                gap: spacing.sm,
              },
            ]}
          >
            {/* Santo */}
            {item.santo && (
              <View style={[styles.detailRow, { gap: spacing.xs }]}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: colors.text3,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                    },
                  ]}
                >
                  Santo:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: colors.text,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                    },
                  ]}
                >
                  {item.santo}
                </Text>
              </View>
            )}

            {/* Curiosidad */}
            {item.curioso && (
              <View
                style={[
                  styles.curiosoBox,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                    padding: spacing.sm + 2,
                    marginTop: spacing.xs,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.curiosoTitle,
                    {
                      color: colors.salmon,
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.bold,
                    },
                  ]}
                >
                  ¿SABÍAS QUE...?
                </Text>
                <Text
                  style={[
                    styles.curiosoText,
                    {
                      color: colors.text2,
                      fontSize: typography.fontSize.xs + 1,
                    },
                  ]}
                >
                  {item.curioso}
                </Text>
              </View>
            )}

            {/* Famosos */}
            {item.famosos && item.famosos.length > 0 && (
              <View style={[styles.famososSection, { marginTop: spacing.xs }]}>
                <Text
                  style={[
                    styles.famososLabel,
                    {
                      color: colors.text3,
                      fontSize: typography.fontSize.xs,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  LO LLEVAN
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
                          paddingHorizontal: spacing.sm,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: colors.text2,
                            fontSize: typography.fontSize.xs,
                          },
                        ]}
                      >
                        {famoso}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Indicador de voto de pareja */}
        {partnerLiked && (
          <View
            style={[
              styles.partnerVotedContainer,
              {
                marginTop: spacing.md,
                paddingVertical: spacing.xs + 2,
                paddingHorizontal: spacing.md,
                backgroundColor: isDark ? 'rgba(74, 222, 128, 0.12)' : 'rgba(46, 158, 91, 0.12)',
                borderColor: isDark ? 'rgba(74, 222, 128, 0.3)' : 'rgba(46, 158, 91, 0.3)',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <HeartIcon size={13} color={colors.success} />
              <Text
                style={[
                  styles.partnerVotedText,
                  {
                    color: colors.success,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                  },
                ]}
              >
                A tu pareja le gusta este nombre
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
});

CardName.displayName = 'CardName';

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 480,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  scrollContent: {
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  genderBadge: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  genderText: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  originText: {
    letterSpacing: 1.2,
  },
  accentLine: {
    width: 36,
    height: 2,
    borderRadius: 1,
  },
  nameText: {
    fontSize: 40,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  meaningText: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    maxWidth: 280,
  },
  detailsContainer: {
    width: '100%',
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  detailLabel: {},
  detailValue: {},
  curiosoBox: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  curiosoTitle: {
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  curiosoText: {
    lineHeight: 18,
  },
  famososSection: {
    alignItems: 'center',
  },
  famososLabel: {
    letterSpacing: 0.5,
  },
  famososChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    borderRadius: borderRadius.sm,
    paddingVertical: 3,
    borderWidth: 1,
  },
  chipText: {},
  partnerVotedContainer: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  partnerVotedText: {},
});
