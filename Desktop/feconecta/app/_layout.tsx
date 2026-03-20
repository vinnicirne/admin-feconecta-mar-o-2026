import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { PostsProvider } from '../contexts/PostsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PostsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
        </Stack>
        <StatusBar style="dark" />
      </PostsProvider>
    </AuthProvider>
  );
}