import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { checkStoredAuth } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import AssignBarcodeScreen from '../screens/AssignBarcodeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await dispatch(checkStoredAuth());
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [dispatch]);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bgPrimary,
      card: colors.headerBg,
      text: colors.textPrimary,
      border: colors.headerBorder,
      primary: colors.primary,
    },
  };

  if (initializing) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{
                headerShown: true,
                title: 'Chi tiết sản phẩm',
                headerTintColor: colors.primary,
                headerBackTitle: 'Quay lại',
                headerStyle: { backgroundColor: colors.headerBg },
                headerTitleStyle: { fontWeight: '800', color: colors.textPrimary },
              }}
            />
            <Stack.Screen
              name="AssignBarcode"
              component={AssignBarcodeScreen}
              options={{
                headerShown: true,
                title: 'Gán mã vạch EAN-13',
                headerTintColor: colors.primary,
                headerBackTitle: 'Quay lại',
                headerStyle: { backgroundColor: colors.headerBg },
                headerTitleStyle: { fontWeight: '800', color: colors.textPrimary },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
