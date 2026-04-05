import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register-choice" />
      <Stack.Screen name="register-user" />
      <Stack.Screen name="register-stylist" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
