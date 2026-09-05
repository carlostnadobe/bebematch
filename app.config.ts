import { ExpoConfig, getDefaultConfig } from 'expo/config';

const config = getDefaultConfig(__dirname);

const expoConfig: ExpoConfig = {
  ...config,
  name: 'BebéMatch',
  slug: 'bebematch',
  version: '0.1.0',
  scheme: 'bebematch',
  plugins: [
    'react-native-reanimated/plugin',
    'react-native-gesture-handler/plugin',
  ],
  extra: {
    ...config.extra,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://myakshqgodbvwnbnvjjn.supabase.co',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
};

export default expoConfig;
