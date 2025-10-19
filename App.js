import React from 'react';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

export default function App() {
  return (
        <SafeAreaProvider>
            <FavoritesProvider>
              <AppNavigator />
            </FavoritesProvider>
        </SafeAreaProvider>
  );
}