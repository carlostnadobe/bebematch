import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme, SoloProvider, RoomProvider } from '../src/contexts';

function RootNavigation() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="waiting" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="swipe" />
        <Stack.Screen name="summary" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RoomProvider>
          <SoloProvider>
            <RootNavigation />
          </SoloProvider>
        </RoomProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
