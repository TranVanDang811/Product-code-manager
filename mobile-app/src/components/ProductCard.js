import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Badge from './Badge';
import { Package, ChevronRight, Barcode, Hash, Trash2 } from 'lucide-react-native';

export default function ProductCard({ product, onPress, onDelete }) {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          shadowOpacity: isDark ? 0.35 : 0.06,
        },
      ]}
      activeOpacity={0.75}
      onPress={onPress}
      onLongPress={() => onDelete && onDelete(product)}
    >
      {/* Product Image Thumbnail */}
      <View
        style={[
          styles.imageContainer,
          {
            backgroundColor: colors.bgTertiary,
            borderColor: colors.borderLight,
          },
        ]}
      >
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Package size={24} color={isDark ? '#64748b' : '#94a3b8'} strokeWidth={1.75} />
          </View>
        )}
      </View>

      {/* Info Container */}
      <View style={styles.info}>
        <View style={styles.headerRow}>
          {/* Internal Code Metallic Chip */}
          <View
            style={[
              styles.codeBadge,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primaryBorder,
              },
            ]}
          >
            <Hash size={11} color={colors.primary} style={{ marginRight: 2 }} />
            <Text style={[styles.codeText, { color: colors.primary }]}>
              {product.productCode}
            </Text>
          </View>

          <Badge status={product.status} />
        </View>

        {/* Product Name */}
        <Text
          style={[styles.name, { color: colors.textPrimary }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>

        {/* Barcode Mapping Row */}
        <View style={styles.barcodeRow}>
          <Barcode size={13} color={colors.accent} strokeWidth={2} />
          <Text
            style={[
              styles.barcodeText,
              { color: product.barcode ? colors.textSecondary : colors.textMuted },
            ]}
          >
            {product.barcode ? product.barcode : 'Chưa gán mã vạch'}
          </Text>
        </View>
      </View>

      {onDelete && (
        <TouchableOpacity
          style={[
            styles.deleteBtn,
            {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
            },
          ]}
          onPress={() => onDelete(product)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={15} color="#ef4444" />
        </TouchableOpacity>
      )}

      <View style={[styles.chevronWrapper, { backgroundColor: colors.bgTertiary }]}>
        <ChevronRight size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    marginRight: 14,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  barcodeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  chevronWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
