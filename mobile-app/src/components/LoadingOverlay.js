import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function LoadingOverlay({ visible, message = 'Đang xử lý...' }) {
  const { colors, isDark } = useTheme();
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.bgElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
    minWidth: 180,
  },
  message: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
  },
});
