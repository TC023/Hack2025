import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

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
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarActiveTintColor: (colors as any)?.primary || '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const screen = screens.find(s => s.name === route.name);
          const iconName = screen?.icon || 'ellipse-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        }
      })}
    >
      {screens.map(scr => (
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
