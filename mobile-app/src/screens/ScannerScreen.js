import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { barcodeApi } from '../api/barcodeApi';
import { useTheme } from '../context/ThemeContext';
import Badge from '../components/Badge';
import LoadingOverlay from '../components/LoadingOverlay';
import CreateProductModal from '../components/CreateProductModal';
import {
  Camera,
  SwitchCamera,
  Flashlight,
  FlashlightOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  X,
  ArrowRight,
  Plus,
  Hash,
  Barcode,
  Sparkles,
} from 'lucide-react-native';

export default function ScannerScreen({ navigation }) {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);

  // Manual input modal
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  // Create product modal
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [pendingNewBarcode, setPendingNewBarcode] = useState('');

  const lastScannedRef = useRef(0);
  const laserAnim = useRef(new Animated.Value(0)).current;

  // Smooth glowing laser animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 160,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [laserAnim]);

  // Auto-request permission on mount
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = async ({ data }) => {
    const now = Date.now();
    if (now - lastScannedRef.current < 2500 || loading) return;
    lastScannedRef.current = now;
    lookupBarcode(data);
  };

  const lookupBarcode = async (barcode) => {
    if (!barcode) return;
    let cleanBarcode = String(barcode).trim();
    if (cleanBarcode.length === 12 && isValidEan13('0' + cleanBarcode)) {
      cleanBarcode = '0' + cleanBarcode;
    }

    try {
      setLoading(true);
      const res = await barcodeApi.lookup({
        barcode: cleanBarcode,
        deviceInfo: `Mobile App (${Platform.OS})`,
      });

      if (res && res.data) {
        if (res.data.status === 'NOT_FOUND') {
          // Mã vạch chưa có trong dữ liệu -> Tự động gán ngay vào input và mở form tạo sản phẩm!
          const code = res.data.barcodeScanned || res.data.barcode || cleanBarcode;
          setPendingNewBarcode(String(code));
          setIsResultModalVisible(false);
          setIsCreateModalVisible(true);
          return;
        }

        setResult(res.data);
        setIsResultModalVisible(true);
      }
    } catch (err) {
      console.error('Barcode lookup failed', err);
      Alert.alert('Lỗi tra cứu', 'Không thể kết nối đến cơ sở dữ liệu Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLookup = () => {
    if (!manualBarcode.trim()) return;
    setIsManualModalVisible(false);
    lookupBarcode(manualBarcode.trim());
    setManualBarcode('');
  };

  const handleCloseResultModal = () => {
    setIsResultModalVisible(false);
    setResult(null);
  };

  if (!permission) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bgPrimary }]}>
        <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
          Đang khởi tạo Camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bgPrimary }]}>
        <View style={[styles.permissionIconCircle, { backgroundColor: colors.bgTertiary }]}>
          <Camera size={44} color={colors.primary} />
        </View>
        <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>
          Cần quyền truy cập Camera
        </Text>
        <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
          Ứng dụng cần quyền Camera để quét mã vạch sản phẩm EAN-13 trong kho hàng.
        </Text>
        <TouchableOpacity
          style={[styles.permissionBtn, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={[styles.permissionBtnText, { color: colors.textOnPrimary || '#000000' }]}>Cấp quyền Camera ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Fullscreen Camera View */}
      {isFocused && (
        <CameraView
          style={styles.camera}
          facing={facing}
          enableTorch={torchEnabled}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'upc_a', 'code128', 'qr'],
          }}
          onBarcodeScanned={isResultModalVisible ? undefined : handleBarcodeScanned}
          onCameraReady={() => console.log('CAMERA_READY_ACTIVE')}
          onMountError={(err) => console.error('CAMERA_MOUNT_ERR', err)}
        />
      )}

      {/* 2. Floating Cyberpunk / Clean Glass Overlay */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Top Floating Glass Bar */}
        <View style={[styles.topControls, { paddingTop: Math.max(insets.top, 24) + 10 }]}>
          {/* Flash & Flip */}
          <View style={styles.topLeftButtons}>
            <TouchableOpacity
              style={[
                styles.glassIconBtn,
                torchEnabled && styles.glassIconBtnActive,
              ]}
              onPress={() => setTorchEnabled((prev) => !prev)}
              activeOpacity={0.8}
            >
              {torchEnabled ? (
                <FlashlightOff size={20} color="#facc15" />
              ) : (
                <Flashlight size={20} color="#ffffff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.glassIconBtn, { marginLeft: 10 }]}
              onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
              activeOpacity={0.8}
            >
              <SwitchCamera size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Action Pills */}
          <View style={styles.topRightButtons}>
            <TouchableOpacity
              style={styles.glassActionPill}
              onPress={() => setIsManualModalVisible(true)}
              activeOpacity={0.8}
            >
              <Search size={14} color="#ffffff" />
              <Text style={styles.glassActionText}>Nhập tay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.glassActionPill, styles.glassActionPillAccent]}
              onPress={() => {
                setPendingNewBarcode('');
                setIsCreateModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#ffffff" />
              <Text style={styles.glassActionText}>+ Mới</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Glowing Viewfinder */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder}>
            {/* 4 Neon glowing corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Neon Cyan Laser Line */}
            <Animated.View
              style={[
                styles.laser,
                {
                  transform: [{ translateY: laserAnim }],
                },
              ]}
            />
          </View>

          {/* Subtle Glowing Hint Pill */}
          <View style={styles.hintBadge}>
            <Sparkles size={14} color="#00f0ff" style={{ marginRight: 6 }} />
            <Text style={styles.hintText}>Căn chỉnh mã EAN-13 vào giữa khung</Text>
          </View>
        </View>

        {/* Bottom Subtitle Pill */}
        <View style={[styles.bottomInfo, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.bottomSubText}>Tự động nhận diện chuẩn 13 chữ số GS1</Text>
        </View>
      </View>

      {/* 3. RESULT MODAL */}
      <Modal
        visible={isResultModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseResultModal}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.bgElevated,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Kết quả tra cứu</Text>
              <TouchableOpacity
                onPress={handleCloseResultModal}
                style={[styles.closeBtn, { backgroundColor: colors.bgTertiary }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* FOUND STATE */}
            {result && result.status === 'FOUND' && result.product ? (
              <View style={styles.resultBody}>
                {/* Glowing Success Banner */}
                <View
                  style={[
                    styles.statusBanner,
                    {
                      backgroundColor: colors.successLight,
                      borderColor: colors.successBorder,
                    },
                  ]}
                >
                  <CheckCircle2 size={20} color={colors.success} />
                  <Text style={[styles.statusBannerText, { color: colors.success }]}>
                    ĐÃ TÌM THẤY SẢN PHẨM TRONG HỆ THỐNG
                  </Text>
                </View>

                {/* Prominent 6-Digit Code Hero Card */}
                <View
                  style={[
                    styles.codeHeroBox,
                    {
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.primaryBorder,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Hash size={14} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.codeHeroLabel, { color: colors.textSecondary }]}>
                      MÃ NỘI BỘ
                    </Text>
                  </View>
                  <Text style={[styles.codeHeroNumber, { color: colors.primary }]}>
                    {result.product.productCode}
                  </Text>
                </View>

                {/* Product Detail Card */}
                <View
                  style={[
                    styles.productRow,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {result.product.imageUrl ? (
                    <Image
                      source={{ uri: result.product.imageUrl }}
                      style={styles.productImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.productImgPlaceholder,
                        { backgroundColor: colors.bgTertiary },
                      ]}
                    >
                      <Package size={28} color={colors.textMuted} />
                    </View>
                  )}

                  <View style={styles.productInfo}>
                    <View style={styles.statusPillRow}>
                      <Badge status={result.product.status} />
                    </View>
                    <Text
                      style={[styles.productTitle, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {result.product.name}
                    </Text>
                    <View style={styles.barcodeSubRow}>
                      <Barcode size={13} color={colors.accent} />
                      <Text style={[styles.barcodeSub, { color: colors.textSecondary }]}>
                        {result?.barcodeScanned || result?.barcode}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                  style={[
                    styles.detailBtn,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    handleCloseResultModal();
                    navigation.navigate('ProductDetail', { productId: result.product.id });
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.detailBtnText, { color: colors.textOnPrimary || '#000000' }]}>Xem chi tiết sản phẩm</Text>
                  <ArrowRight size={16} color={colors.textOnPrimary || '#000000'} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ) : result && result.status === 'NOT_FOUND' ? (
              /* NOT FOUND STATE */
              <View style={styles.resultBody}>
                <View
                  style={[
                    styles.statusBanner,
                    {
                      backgroundColor: colors.dangerLight,
                      borderColor: colors.dangerBorder,
                    },
                  ]}
                >
                  <AlertTriangle size={20} color={colors.danger} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.statusBannerTitle, { color: colors.danger }]}>
                      Mã vạch chưa có trong dữ liệu
                    </Text>
                    <Text style={[styles.statusBannerDesc, { color: colors.danger }]}>
                      Mã [{result?.barcodeScanned || result?.barcode}] chưa liên kết với bất kỳ sản phẩm nào.
                    </Text>
                  </View>
                </View>

                {/* Prompt Card */}
                <View
                  style={[
                    styles.promptCard,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.promptQuestion, { color: colors.textPrimary }]}>
                    Bạn có muốn thêm sản phẩm mới với mã vạch này ngay không?
                  </Text>
                  <Text style={[styles.promptSub, { color: colors.textSecondary }]}>
                    Mã EAN-13 [{result?.barcodeScanned || result?.barcode}] sẽ được tự động điền sẵn vào biểu mẫu tạo sản phẩm mới.
                  </Text>
                </View>

                {/* Add new product with this barcode */}
                <TouchableOpacity
                  style={[
                    styles.addNewProductBtn,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    const code = result?.barcodeScanned || result?.barcode || '';
                    handleCloseResultModal();
                    setPendingNewBarcode(String(code));
                    setIsCreateModalVisible(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Plus size={18} color={colors.textOnPrimary || '#000000'} strokeWidth={2.5} />
                  <Text style={[styles.addNewProductBtnText, { color: colors.textOnPrimary || '#000000' }]}>Thêm sản phẩm mới với mã này</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.closeActionBtn, { backgroundColor: colors.bgTertiary }]}
                  onPress={handleCloseResultModal}
                >
                  <Text style={[styles.closeActionText, { color: colors.textSecondary }]}>
                    Bỏ qua / Quét mã khác
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* INVALID STATE */
              <View style={styles.resultBody}>
                <View
                  style={[
                    styles.statusBanner,
                    {
                      backgroundColor: colors.warningLight,
                      borderColor: colors.warningBorder,
                    },
                  ]}
                >
                  <XCircle size={20} color={colors.warning} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.statusBannerTitle, { color: colors.warning }]}>
                      Mã vạch không đúng chuẩn
                    </Text>
                    <Text style={[styles.statusBannerDesc, { color: colors.warning }]}>
                      Mã [{result?.barcodeScanned || result?.barcode}] không đạt tiêu chuẩn 13 chữ số EAN-13.
                    </Text>
                  </View>
                </View>

                {/* Even if invalid, allow user to prefill & edit it */}
                <TouchableOpacity
                  style={[
                    styles.addNewProductBtn,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                      marginTop: 14,
                    },
                  ]}
                  onPress={() => {
                    const code = result?.barcodeScanned || result?.barcode || '';
                    handleCloseResultModal();
                    setPendingNewBarcode(String(code));
                    setIsCreateModalVisible(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Plus size={18} color={colors.textOnPrimary || '#000000'} strokeWidth={2.5} />
                  <Text style={[styles.addNewProductBtnText, { color: colors.textOnPrimary || '#000000' }]}>Tạo sản phẩm & chỉnh sửa mã này</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.closeActionBtn, { backgroundColor: colors.bgTertiary, marginTop: 10 }]}
                  onPress={handleCloseResultModal}
                >
                  <Text style={[styles.closeActionText, { color: colors.textSecondary }]}>
                    Thử lại
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 4. MANUAL INPUT MODAL */}
      <Modal
        visible={isManualModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsManualModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.bgElevated,
                borderColor: colors.border,
                maxWidth: 380,
                borderRadius: 24,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Nhập mã vạch thủ công
              </Text>
              <TouchableOpacity
                onPress={() => setIsManualModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.bgTertiary }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.manualInputBody}>
              <Text style={[styles.manualInputLabel, { color: colors.textSecondary }]}>
                Nhập 13 số mã vạch EAN-13:
              </Text>
              <TextInput
                style={[
                  styles.manualTextInput,
                  {
                    backgroundColor: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                keyboardType="numeric"
                maxLength={13}
                value={manualBarcode}
                onChangeText={(text) => setManualBarcode(text.replace(/\D/g, ''))}
                placeholder="VD: 8938505942013"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />

              <TouchableOpacity
                style={[
                  styles.detailBtn,
                  {
                    marginTop: 16,
                    backgroundColor: colors.primary,
                    opacity: manualBarcode.length > 0 ? 1 : 0.6,
                  },
                ]}
                disabled={!manualBarcode}
                onPress={handleManualLookup}
              >
                <Search size={16} color={colors.textOnPrimary || '#000000'} />
                <Text style={[styles.detailBtnText, { color: colors.textOnPrimary || '#000000' }]}>Tra cứu ngay</Text>
              </TouchableOpacity>

              <View style={styles.manualOrDivider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>HOẶC</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity
                style={[
                  styles.manualCreateLink,
                  {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primaryBorder,
                  },
                ]}
                onPress={() => {
                  const code = manualBarcode;
                  setIsManualModalVisible(false);
                  setPendingNewBarcode(code);
                  setIsCreateModalVisible(true);
                }}
              >
                <Plus size={16} color={colors.primary} />
                <Text style={[styles.manualCreateLinkText, { color: colors.primary }]}>
                  Tạo mới sản phẩm với mã này
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. CREATE PRODUCT MODAL */}
      <CreateProductModal
        key={pendingNewBarcode || 'create-modal'}
        visible={isCreateModalVisible}
        onClose={() => {
          setIsCreateModalVisible(false);
          setPendingNewBarcode('');
        }}
        initialBarcode={pendingNewBarcode}
        onSuccess={(newProduct) => {
          Alert.alert(
            'Tạo sản phẩm thành công',
            `Sản phẩm [${newProduct.productCode}] - "${newProduct.name}" đã được lưu vào Firebase kèm mã vạch [${newProduct.barcode}]!`,
            [
              {
                text: 'Xem chi tiết',
                onPress: () => navigation.navigate('ProductDetail', { productId: newProduct.id }),
              },
              { text: 'Tiếp tục quét', style: 'cancel' },
            ]
          );
        }}
      />

      <LoadingOverlay visible={loading} message="Đang tra cứu barcode..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  permissionDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  permissionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  topLeftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glassIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassIconBtnActive: {
    borderColor: '#facc15',
    backgroundColor: 'rgba(234, 179, 8, 0.25)',
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  glassActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassActionPillAccent: {
    backgroundColor: 'rgba(99, 102, 241, 0.85)',
    borderColor: 'rgba(165, 180, 252, 0.5)',
  },
  glassActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  viewfinder: {
    width: 290,
    height: 180,
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  laser: {
    position: 'absolute',
    top: 6,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: '#00f0ff',
    borderRadius: 2,
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  hintText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomInfo: {
    alignItems: 'center',
  },
  bottomSubText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(10, 14, 26, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBody: {
    paddingBottom: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
  },
  statusBannerText: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBannerDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  codeHeroBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 14,
  },
  codeHeroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  codeHeroNumber: {
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  productRow: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  productImg: {
    width: 68,
    height: 68,
    borderRadius: 14,
  },
  productImgPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
  },
  statusPillRow: {
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  barcodeSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  barcodeSub: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  detailBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  promptCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  promptSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  addNewProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addNewProductBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  closeActionBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  closeActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  manualInputBody: {
    paddingBottom: 8,
  },
  manualInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  manualTextInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
  },
  manualOrDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
  },
  manualCreateLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  manualCreateLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
