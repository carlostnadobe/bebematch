import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { IName } from '../../types';

interface LikedMatchesModalProps {
  visible: boolean;
  onClose: () => void;
  likedNames: IName[];
  matches: IName[];
  isSolo?: boolean;
}

export const LikedMatchesModal: React.FC<LikedMatchesModalProps> = ({
  visible,
  onClose,
  likedNames,
  matches,
  isSolo = false,
}) => {
  const { colors, spacing, isDark } = useTheme();

  const matchNamesSet = new Set(matches.map((m) => m.n));

  const renderItem = ({ item }: { item: IName }) => {
    const isMatch = matchNamesSet.has(item.n);
    const isGirl = item.g === 'girl';
    const isBoy = item.g === 'boy';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: isMatch ? colors.salmon : colors.border2,
            borderWidth: isMatch ? 1.5 : 1,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.nameContainer}>
            <Text style={[styles.nameText, { color: colors.text }]}>{item.n}</Text>
            {!isSolo && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isMatch
                      ? isDark
                        ? 'rgba(232, 115, 90, 0.2)'
                        : 'rgba(212, 105, 79, 0.15)'
                      : colors.surface2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: isMatch ? colors.salmon : colors.text3 },
                  ]}
                >
                  {isMatch ? '💞 Match' : 'Solo tú'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.genderTag, { color: colors.text3 }]}>
            {isGirl ? '♀' : isBoy ? '♂' : '⚥'}
          </Text>
        </View>

        <Text style={[styles.meaningText, { color: colors.text2 }]}>
          &ldquo;{item.m}&rdquo;
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        {/* Cabecera */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.backButton,
              { backgroundColor: colors.surface2, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>
              ← Seguir buscando
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isSolo ? 'Tus favoritos ♥' : 'Vuestros matches 💞'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Subtítulo informativo */}
        <View style={[styles.subHeader, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.subHeaderText, { color: colors.text2 }]}>
            {isSolo
              ? `${likedNames.length} nombres guardados`
              : matches.length > 0
              ? `${matches.length} coincidencia${matches.length === 1 ? '' : 's'} con tu pareja`
              : 'Aún sin matches con tu pareja. ¡Sigue votando!'}
          </Text>
        </View>

        {/* Lista */}
        {likedNames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🤍</Text>
            <Text style={[styles.emptyText, { color: colors.text2 }]}>
              Aún no has dado ♥ a ningún nombre
            </Text>
          </View>
        ) : (
          <FlatList
            data={likedNames}
            keyExtractor={(item) => item.n}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  subHeader: {
    paddingVertical: 10,
  },
  subHeaderText: {
    fontSize: 13,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  genderTag: {
    fontSize: 16,
    fontWeight: '600',
  },
  meaningText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
