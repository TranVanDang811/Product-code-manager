import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { productApi } from '../api/productApi';
import { barcodeApi } from '../api/barcodeApi';
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import Badge from '../components/Badge';
import LoadingOverlay from '../components/LoadingOverlay';
import { formatDateTime } from '../utils/formatters';
import {
  Barcode,
  Package,
  Calendar,
  User,
  Archive,
  RefreshCw,
  Trash2,
  Hash,
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react-native';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { colors, isDark } = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productApi.getProductById(productId);
      if (res && res.data) {
        setProduct(res.data);
      }
    } catch (err) {
      console.error('Failed to load product detail', err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết sản phẩm.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDetail();
    });
    return unsubscribe;
  }, [navigation, fetchDetail]);

  const handleToggleStatus = async () => {
    if (!product) return;
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setActionLoading(true);
      await productApi.updateProductStatus(product.id, newStatus);
      fetchDetail();
      Alert.alert('Thành công', `Đã chuyển trạng thái sang ${newStatus}`);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đổi trạng thái.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = () => {
    Alert.alert(
      'Xác nhận lưu trữ',
      `Bạn có chắc chắn muốn chuyển sản phẩm [${product?.productCode}] sang trạng thái ARCHIVED? Không xóa vật lý dữ liệu.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Lưu trữ',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await productApi.archiveProduct(product.id);
              Alert.alert('Thành công', 'Đã lưu trữ sản phẩm.');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể lưu trữ sản phẩm.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Xác nhận xóa vĩnh viễn ⚠️',
      `Bạn có chắc chắn muốn XÓA HOÀN TOÀN sản phẩm [${product?.productCode} - ${product?.name}] khỏi cơ sở dữ liệu?\n\n• Dữ liệu sản phẩm sẽ bị xóa vĩnh viễn.\n• Mã vạch ${product?.barcode ? '[' + product.barcode + ']' : ''} sẽ được giải phóng hoàn toàn.\n• Thao tác này KHÔNG THỂ khôi phục!`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await productApi.deleteProduct(product.id);
              Alert.alert('Thành công', 'Đã xóa vĩnh viễn sản phẩm khỏi hệ thống.');
              navigation.goBack();
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

  const handleUnassignBarcode = () => {
    if (!product?.barcode) return;
    Alert.alert(
      'Hủy gán Barcode',
      `Bạn có muốn hủy liên kết mã vạch [${product.barcode}] khỏi sản phẩm này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hủy gán',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await barcodeApi.unassign(product.id);
              fetchDetail();
              Alert.alert('Thành công', 'Đã gỡ mã vạch khỏi sản phẩm.');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể hủy mã vạch.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateImage = () => {
    Alert.alert('Ảnh đại diện sản phẩm', 'Chọn phương thức cập nhật ảnh đại diện:', [
      {
        text: '📸 Chụp ảnh trực tiếp',
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền Camera.');
              return;
            }
            const res = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.6,
              base64: true,
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              const asset = res.assets[0];
              const mime = asset.mimeType || 'image/jpeg';
              const base64Data = `data:${mime};base64,${asset.base64}`;
              setActionLoading(true);
              await productApi.updateProduct(product.id, { imageUrl: base64Data });
              fetchDetail();
              Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện lên Firebase!');
            }
          } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể chụp ảnh.');
          } finally {
            setActionLoading(false);
          }
        },
      },
      {
        text: '🖼️ Chọn từ thư viện',
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền Thư viện ảnh.');
              return;
            }
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.6,
              base64: true,
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              const asset = res.assets[0];
              const mime = asset.mimeType || 'image/jpeg';
              const base64Data = `data:${mime};base64,${asset.base64}`;
              setActionLoading(true);
              await productApi.updateProduct(product.id, { imageUrl: base64Data });
              fetchDetail();
              Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện lên Firebase!');
            }
          } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể chọn ảnh.');
          } finally {
            setActionLoading(false);
          }
        },
      },
      {
        text: 'Hủy',
        style: 'cancel',
      },
    ]);
  };

  if (loading || !product) {
    return <LoadingOverlay visible={true} message="Đang tải dữ liệu..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. Hero Image */}
        <View
          style={[
            styles.imageCard,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: colors.bgTertiary }]}>
              <Package size={64} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={[styles.heroPlaceholderText, { color: colors.textSecondary }]}>
                Chưa có ảnh đại diện
              </Text>
            </View>
          )}

          {/* Floating Camera Button */}
          <TouchableOpacity
            style={[styles.changeImageFab, { backgroundColor: colors.primary }]}
            onPress={handleUpdateImage}
            activeOpacity={0.85}
          >
            <Camera size={16} color={colors.textOnPrimary || '#000000'} />
            <Text style={[styles.changeImageFabText, { color: colors.textOnPrimary || '#000000' }]}>
              {product.imageUrl ? 'Đổi ảnh' : 'Chụp / Thêm ảnh'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Product Basic Info Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View
              style={[
                styles.codeBadge,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primaryBorder,
                },
              ]}
            >
              <Hash size={13} color={colors.primary} style={{ marginRight: 3 }} />
              <Text style={[styles.codeText, { color: colors.primary }]}>
                {product.productCode}
              </Text>
            </View>
            <Badge status={product.status} />
          </View>

          <Text style={[styles.productName, { color: colors.textPrimary }]}>
            {product.name}
          </Text>

          {product.description ? (
            <Text style={[styles.productDesc, { color: colors.textSecondary }]}>
              {product.description}
            </Text>
          ) : null}
        </View>

        {/* 3. Barcode Mapping Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Mã vạch EAN-13 (Quan hệ 1 - 1)
          </Text>

          <View
            style={[
              styles.barcodeBox,
              {
                backgroundColor: colors.bgTertiary,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <Barcode size={30} color={colors.accent} strokeWidth={2} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.barcodeNumber, { color: colors.textPrimary }]}>
                {product.barcode ? product.barcode : 'CHƯA GÁN MÃ VẠCH'}
              </Text>
              <Text style={[styles.barcodeSub, { color: colors.textSecondary }]}>
                {product.barcode
                  ? 'Chuẩn GS1 Modulo-10 Checksum hợp lệ'
                  : 'Sản phẩm chưa có mã barcode tương ứng'}
              </Text>
            </View>
          </View>

          <View style={styles.barcodeActions}>
            <TouchableOpacity
              style={[styles.assignBtn, { backgroundColor: colors.primary }]}
              onPress={() =>
                navigation.navigate('AssignBarcode', {
                  productId: product.id,
                  productCode: product.productCode,
                  productName: product.name,
                  currentBarcode: product.barcode,
                })
              }
            >
              <Text style={[styles.assignBtnText, { color: colors.textOnPrimary || '#000000' }]}>
                {product.barcode ? 'Đổi mã vạch' : 'Gán mã vạch mới'}
              </Text>
            </TouchableOpacity>

            {product.barcode ? (
              <TouchableOpacity
                style={[
                  styles.unassignBtn,
                  {
                    backgroundColor: colors.dangerLight,
                    borderColor: colors.dangerBorder,
                  },
                ]}
                onPress={handleUnassignBarcode}
              >
                <Trash2 size={18} color={colors.danger} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* 4. Audit Meta Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Thông tin kiểm toán
          </Text>

          <View style={styles.metaRow}>
            <User size={15} color={colors.textMuted} />
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Người tạo:</Text>
            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
              {product.createdBy
                ? product.createdBy.fullName || product.createdBy.username
                : 'ADMIN'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Calendar size={15} color={colors.textMuted} />
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Thời gian tạo:</Text>
            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
              {formatDateTime(product.createdAt)}
            </Text>
          </View>
        </View>

        {/* 5. Bottom Status Actions */}
        <View style={styles.actionsContainer}>
          {product.status !== 'ARCHIVED' && (
            <TouchableOpacity
              style={[
                styles.statusToggleBtn,
                {
                  backgroundColor: colors.bgTertiary,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleToggleStatus}
            >
              <RefreshCw size={17} color={colors.primary} />
              <Text style={[styles.statusToggleText, { color: colors.primary }]}>
                {product.status === 'ACTIVE' ? 'Tạm ngưng sản phẩm' : 'Kích hoạt sản phẩm'}
              </Text>
            </TouchableOpacity>
          )}

          {product.status !== 'ARCHIVED' && (
            <TouchableOpacity
              style={[
                styles.archiveBtn,
                {
                  backgroundColor: colors.dangerLight,
                  borderColor: colors.dangerBorder,
                },
              ]}
              onPress={handleArchive}
            >
              <Archive size={17} color={colors.danger} />
              <Text style={[styles.archiveText, { color: colors.danger }]}>
                Lưu trữ sản phẩm (Archive)
              </Text>
            </TouchableOpacity>
          )}

          {/* Nút Xóa vĩnh viễn sản phẩm */}
          <TouchableOpacity
            style={[
              styles.deleteForeverBtn,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                borderColor: '#ef4444',
              },
            ]}
            onPress={handleDeleteProduct}
          >
            <Trash2 size={17} color="#ef4444" />
            <Text style={[styles.deleteForeverText, { color: '#ef4444' }]}>
              Xóa vĩnh viễn sản phẩm
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LoadingOverlay visible={actionLoading} message="Đang xử lý nghiệp vụ..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  imageCard: {
    width: '100%',
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  changeImageFab: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  changeImageFabText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  codeText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
    lineHeight: 26,
  },
  productDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  barcodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  barcodeNumber: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 1,
  },
  barcodeSub: {
    fontSize: 11,
    marginTop: 2,
  },
  barcodeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  assignBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  unassignBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 13,
    marginLeft: 8,
    width: 100,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 4,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  statusToggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  archiveText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteForeverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 4,
  },
  deleteForeverText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
