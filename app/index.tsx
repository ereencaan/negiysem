import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';
import { colors } from '../src/constants/theme';

const ONBOARDING_KEY = 'negiysem_onboarding_seen';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      setNeedsOnboarding(val !== 'true');
      setCheckingOnboarding(false);
    });
  }, []);

  useEffect(() => {
    if (checkingOnboarding || isLoading) return;

    if (needsOnboarding) {
      router.replace('/(auth)/onboarding');
    } else if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [checkingOnboarding, isLoading, isAuthenticated, needsOnboarding]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
