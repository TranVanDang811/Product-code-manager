import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ScannerScreen from '../screens/ScannerScreen';
import ProductsScreen from '../screens/ProductsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { ScanLine, Package, History, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

function TabIconWrapper({ focused, children, colors }) {
  return (
    <View
      style={[
        styles.iconContainer,
        focused && {
          backgroundColor: colors.primaryLight,
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 4,
        },
      ]}
    >
      {children}
    </View>
  );
}

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDark ? 0.35 : 0.08,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'Quét mã',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIconWrapper focused={focused} colors={colors}>
              <ScanLine size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIconWrapper>
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Sản phẩm',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIconWrapper focused={focused} colors={colors}>
              <Package size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIconWrapper>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Lịch sử',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIconWrapper focused={focused} colors={colors}>
              <History size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIconWrapper>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Cài đặt',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIconWrapper focused={focused} colors={colors}>
              <Settings size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
            </TabIconWrapper>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
