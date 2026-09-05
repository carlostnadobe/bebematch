import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Placeholder</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>← Volver a Home</Text>
      </Link>
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
    fontSize: 24,
    fontWeight: '600',
    color: '#E8735A',
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    color: '#9B6FA1',
    fontSize: 14,
  },
});
