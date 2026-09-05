import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BebéMatch</Text>
      <Text style={styles.subtitle}>Tinder de nombres de bebé</Text>

      <View style={styles.content}>
        <Link href="/waiting" style={[styles.button, styles.buttonPrimary]}>
          <Text style={styles.buttonText}>Modo Pareja</Text>
        </Link>

        <Link href="/setup" style={[styles.button, styles.buttonSecondary]}>
          <Text style={styles.buttonText}>Modo Solitario</Text>
        </Link>
      </View>

      <Text style={styles.version}>v0.1.0 (Fase 1)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#E8735A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 32,
  },
  content: {
    width: '100%',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#E8735A',
  },
  buttonSecondary: {
    backgroundColor: '#9B6FA1',
  },
  buttonText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    marginTop: 32,
    color: '#606060',
    fontSize: 12,
  },
});
