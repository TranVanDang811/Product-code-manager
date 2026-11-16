import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { productApi } from '../api/productApi';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CreateProductModal from '../components/CreateProductModal';
import LoadingOverlay from '../components/LoadingOverlay';
import { Search, Filter, Package, Plus, X } from 'lucide-react-native';

const STATUS_FILTERS = [
  { key: '', label: 'Tất cả' },
  { key: 'ACTIVE', label: 'Hoạt động' },
  { key: 'INACTIVE', label: 'Tạm ngưng' },
  { key: 'ARCHIVED', label: 'Lưu trữ' },
];

export default function ProductsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: 0,
        size: 50,
        keyword: searchQuery.trim() || undefined,
        status: selectedStatus || undefined,
        sortBy: 'createdAt',
        direction: 'desc',
      };

      const res = await productApi.getProducts(params);
      if (res && res.data) {
        setProducts(res.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const handleDeleteProduct = (prod) => {
    Alert.alert(
      'Xóa vĩnh viễn sản phẩm ⚠️',
      `Bạn có chắc chắn muốn XÓA HOÀN TOÀN sản phẩm [${prod.productCode} - ${prod.name}] khỏi cơ sở dữ liệu?\n\n• Dữ liệu sản phẩm sẽ bị xóa vĩnh viễn.\n• Mã vạch ${prod.barcode ? '[' + prod.barcode + ']' : ''} sẽ được giải phóng hoàn toàn.\n• Thao tác này KHÔNG THỂ khôi phục!`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await productApi.deleteProduct(prod.id);
              Alert.alert('Thành công', 'Đã xóa vĩnh viễn sản phẩm.');
              fetchProducts();
            } catch (err) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa sản phẩm.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Header
        title="Danh mục sản phẩm"
        subtitle={`Quản lý ${products.length} sản phẩm & mã EAN-13`}
        rightElement={
          <TouchableOpacity
            style={[styles.addHeaderBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color={colors.textOnPrimary || '#000000'} strokeWidth={2.5} />
            <Text style={[styles.addHeaderBtnText, { color: colors.textOnPrimary || '#000000' }]}>Thêm mới</Text>
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.headerBg,
          },
        ]}
      >
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: colors.bgTertiary,
              borderColor: colors.border,
            },
          ]}
        >
          <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Tìm theo tên hoặc mã 6 số..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View
        style={[
          styles.filterScrollWrapper,
          {
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.headerBorder,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {STATUS_FILTERS.map((item) => {
            const isSelected = selectedStatus === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.bgTertiary,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedStatus(item.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? (colors.textOnPrimary || '#000000') : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            onDelete={handleDeleteProduct}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: colors.bgTertiary, borderColor: colors.border },
                ]}
              >
                <Package size={44} color={colors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Không tìm thấy sản phẩm
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút thêm mới
              </Text>
              <TouchableOpacity
                style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Plus size={16} color={colors.textOnPrimary || '#000000'} style={{ marginRight: 6 }} />
                <Text style={[styles.emptyAddBtnText, { color: colors.textOnPrimary || '#000000' }]}>Thêm sản phẩm mới</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
        onPress={() => setIsCreateModalVisible(true)}
        activeOpacity={0.85}
      >
        <Plus size={26} color={colors.textOnPrimary || '#000000'} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* CREATE PRODUCT MODAL */}
      <CreateProductModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          fetchProducts(true);
        }}
      />

      <LoadingOverlay visible={actionLoading} message="Đang xóa sản phẩm..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
  },
  filterScrollWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 88,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  addHeaderBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
});
