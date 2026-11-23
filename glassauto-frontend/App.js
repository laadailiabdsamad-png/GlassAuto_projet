import './global.css';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Barlow_400Regular } from '@expo-google-fonts/barlow/400Regular';
import { Barlow_500Medium } from '@expo-google-fonts/barlow/500Medium';
import { Barlow_600SemiBold } from '@expo-google-fonts/barlow/600SemiBold';
import { Barlow_700Bold } from '@expo-google-fonts/barlow/700Bold';
import { BarlowSemiCondensed_600SemiBold } from '@expo-google-fonts/barlow-semi-condensed/600SemiBold';
import { BarlowSemiCondensed_700Bold } from '@expo-google-fonts/barlow-semi-condensed/700Bold';
import { BarlowSemiCondensed_800ExtraBold_Italic } from '@expo-google-fonts/barlow-semi-condensed/800ExtraBold_Italic';
import { AuthProvider } from './src/context/AuthContext';
import { FeedbackProvider } from './src/context/FeedbackContext';
import { HrDataProvider } from './src/context/HrDataContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationTheme } from './src/theme';
import './src/utils/calendarLocale';

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function App() {
  const [loaded, error] = useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    BarlowSemiCondensed_600SemiBold,
    BarlowSemiCondensed_700Bold,
    BarlowSemiCondensed_800ExtraBold_Italic,
  });
  const ready = loaded || Boolean(error);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => null);
    }
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: navigationTheme.colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <PreferencesProvider>
        <HrDataProvider>
          <AuthProvider>
            <FeedbackProvider>
              <NavigationContainer theme={navigationTheme}>
                <RootNavigator />
              </NavigationContainer>
            </FeedbackProvider>
          </AuthProvider>
        </HrDataProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}
