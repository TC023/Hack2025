import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainLayout from './layout/MainLayout';
import { StyleSheet, Text, View, Button } from 'react-native';

const Stack = createNativeStackNavigator();

import { HomeScreen } from './pages/HomeScreen';
import { DetailsScreen } from './pages/DetailsScreen';
import Quiz from './pages/Quiz';
import { AuthProvider } from './context/AuthContext';
import { Start } from './pages/Start'
import { SignUp } from './pages/SignUp';
import { LogIn } from './pages/LogIn';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Start" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Start" component={Start} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="LogIn" component={LogIn} />
          {/* Main app area with bottom tabs */}
          <Stack.Screen name="Main" children={() => (
            <MainLayout
              screens={[
                { name: 'Home', component: HomeScreen, title: 'Inicio', icon: 'home-outline' },
                { name: 'Quiz', component: Quiz, title: 'Evaluación', icon: 'help-circle-outline' },
                { name: 'Details', component: DetailsScreen, title: 'Detalles', icon: 'list-outline' },
              ]}
            />
          )} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
