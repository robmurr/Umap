import React from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation/Navigation';
import LoginScreen from './src/screens/LoginScreen';
import MapScreen from './src/screens/MapScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
}
