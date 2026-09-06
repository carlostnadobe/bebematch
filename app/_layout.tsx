import 'react-native-gesture-handler';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme, SoloProvider, RoomProvider } from '../src/contexts';

function RootApp() {
  const { isDark, colors, isLoaded } = useTheme();

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.bg }}>
        <RoomProvider>
          <SoloProvider>
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
              <StatusBar style={isDark ? 'light' : 'dark'} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.bg },
                  animation: 'fade',
                  animationDuration: 180,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="waiting" />
                <Stack.Screen name="setup" />
                <Stack.Screen name="swipe" />
                <Stack.Screen name="summary" />
              </Stack>
            </View>
          </SoloProvider>
        </RoomProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootApp />
    </ThemeProvider>
  );
}
