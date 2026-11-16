import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Badge({ status, text }) {
  const { isDark } = useTheme();

  const getColors = () => {
    if (isDark) {
      switch (status) {
        case 'ACTIVE':
        case 'FOUND':
          return { bg: 'rgba(16, 185, 129, 0.18)', text: '#34d399', border: 'rgba(16, 185, 129, 0.45)', dot: '#10b981' };
        case 'INACTIVE':
          return { bg: 'rgba(245, 158, 11, 0.18)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.45)', dot: '#f59e0b' };
        case 'ARCHIVED':
          return { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)', dot: '#94a3b8' };
        case 'NOT_FOUND':
          return { bg: 'rgba(244, 63, 94, 0.18)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.45)', dot: '#f43f5e' };
        case 'INVALID':
          return { bg: 'rgba(245, 158, 11, 0.18)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.45)', dot: '#f59e0b' };
        default:
          return { bg: 'rgba(255, 255, 255, 0.08)', text: '#e2e8f0', border: 'rgba(255, 255, 255, 0.15)', dot: '#94a3b8' };
      }
    } else {
      switch (status) {
        case 'ACTIVE':
        case 'FOUND':
          return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', dot: '#10b981' };
        case 'INACTIVE':
          return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b' };
        case 'ARCHIVED':
          return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', dot: '#94a3b8' };
        case 'NOT_FOUND':
          return { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', dot: '#f43f5e' };
        case 'INVALID':
          return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b' };
        default:
          return { bg: '#f8fafc', text: '#334155', border: '#e2e8f0', dot: '#94a3b8' };
      }
    }
  };

  const getLabel = () => {
    if (text) return text;
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Tạm ngưng';
      case 'ARCHIVED':
        return 'Lưu trữ';
      case 'FOUND':
        return 'Tìm thấy';
      case 'NOT_FOUND':
        return 'Không tìm thấy';
      case 'INVALID':
        return 'Sai chuẩn';
      default:
        return status;
    }
  };

  const config = getColors();

  return (
    <View style={[styles.container, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.text, { color: config.text }]}>{getLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
