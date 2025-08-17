import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useProfile } from '../context/ProfileContext';
import Simulator from '../pages/Simulator';

export interface TabScreenConfig {
  name: string;
  component: React.ComponentType<any>;
  title?: string;
  icon?: string; // Ionicons icon name
}

interface MainLayoutProps {
  screens: TabScreenConfig[];
}

const Tab = createBottomTabNavigator();

export const MainLayout: React.FC<MainLayoutProps> = ({ screens }) => {
  const { profile } = useProfile();
  const augmentedScreens = useMemo(() => {
    if (profile?.area_interes) {
      // avoid duplicate if already included
      const exists = screens.some(s => s.name === 'Simulator');
      if (!exists) {
        return [
          ...screens,
          { name: 'Simulator', component: Simulator, title: 'Probar simulador', icon: 'rocket-outline' },
        ];
      }
    }
    return screens;
  }, [screens, profile?.area_interes]);

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarActiveTintColor: (colors as any)?.primary || '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const screen = augmentedScreens.find(s => s.name === route.name);
          const iconName = screen?.icon || 'ellipse-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        }
      })}
    >
      {augmentedScreens.map(scr => (
        <Tab.Screen
          key={scr.name}
          name={scr.name}
          component={scr.component}
          options={{ title: scr.title || scr.name }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default MainLayout;
