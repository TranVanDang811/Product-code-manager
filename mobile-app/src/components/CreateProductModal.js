import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { productApi } from '../api/productApi';
import { isValidEan13, isValidProductCode } from '../utils/ean13Validator';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Plus,
  Barcode,
  Package,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react-native';

export default function CreateProductModal({
  visible,
  onClose,
  initialBarcode = '',
  onSuccess,
}) {
  const { colors } = useTheme();
  const [productCode, setProductCode] = useState('');
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(initialBarcode ? String(initialBarcode).trim() : '');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      let cleanInitial = initialBarcode ? String(initialBarcode).trim() : '';
      if (cleanInitial.length === 12 && isValidEan13('0' + cleanInitial)) {
        cleanInitial = '0' + cleanInitial;
      }
      setBarcode(cleanInitial);
      setName('');
      setDescription('');
      setImageUri(null);
      setErrors({});
      generateRandomCode();
    }
  }, [visible, initialBarcode]);

  const generateRandomCode = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setProductCode(String(randomNum));
    setErrors((prev) => ({ ...prev, productCode: null }));
  };

  const isBarcodeValid = isValidEan13(barcode);
  const isCodeValid = isValidProductCode(productCode);

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền truy cập Camera để chụp ảnh sản phẩm.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mime = asset.mimeType || 'image/jpeg';
        const base64Data = `data:${mime};base64,${asset.base64}`;
        setImageUri(base64Data);
      }
    } catch (err) {
      Alert.alert('Lỗi chụp ảnh', err.message || 'Không thể mở Camera.');
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền truy cập Thư viện ảnh để chọn ảnh đại diện.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mime = asset.mimeType || 'image/jpeg';
        const base64Data = `data:${mime};base64,${asset.base64}`;
        setImageUri(base64Data);
      }
    } catch (err) {
      Alert.alert('Lỗi chọn ảnh', err.message || 'Không thể mở thư viện ảnh.');
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};

    let cleanBarcode = barcode ? barcode.trim() : '';
    if (cleanBarcode.length === 12 && isValidEan13('0' + cleanBarcode)) {
      cleanBarcode = '0' + cleanBarcode;
    }

    if (!cleanBarcode) {
      newErrors.barcode = 'Mã vạch 13 số là bắt buộc (vui lòng quét hoặc nhập mã)';
    } else if (cleanBarcode.length !== 13) {
      newErrors.barcode = 'Mã vạch phải gồm chính xác 13 chữ số';
    } else if (!isValidEan13(cleanBarcode)) {
      newErrors.barcode = 'Mã vạch sai Checksum GS1 Modulo-10 (vui lòng kiểm tra lại số cuối)';
    }

    if (!productCode || !isValidProductCode(productCode)) {
      newErrors.productCode = 'Mã nội bộ phải gồm đúng 6 chữ số (VD: 001234)';
    }

    if (!name.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        productCode: productCode.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        barcode: cleanBarcode,
        imageUrl: imageUri || null,
        status: 'ACTIVE',
      };

      const res = await productApi.createProduct(payload);
      Alert.alert(
        'Thành công',
        `Đã tạo sản phẩm [${productCode}] - "${name}" thành công!`,
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              if (onSuccess) onSuccess(res.data?.data || res.data);
            },
          },
        ]
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Có lỗi xảy ra khi tạo sản phẩm mới';
      Alert.alert('Không thể tạo sản phẩm', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalBackdrop}
      >
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
          <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.headerTitleRow}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <Plus size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Thêm sản phẩm mới</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Tạo mã nội bộ & liên kết mã vạch
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.bgTertiary }]}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Field 1: Mã nội bộ 6 số */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Mã sản phẩm nội bộ (6 số) <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.autoBtn,
                    {
                      backgroundColor: colors.primaryLight,
                    },
                  ]}
                  onPress={generateRandomCode}
                >
                  <Sparkles size={12} color={colors.primary} />
                  <Text style={[styles.autoBtnText, { color: colors.primary }]}>Sinh mã ngẫu nhiên</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.input,
                  styles.monoInput,
                  {
                    backgroundColor: colors.bgTertiary,
                    borderColor: errors.productCode ? colors.danger : colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={productCode}
                onChangeText={(t) => {
                  const cleaned = t.replace(/\D/g, '').slice(0, 6);
                  setProductCode(cleaned);
                  if (errors.productCode) setErrors((prev) => ({ ...prev, productCode: null }));
                }}
                placeholder="VD: 100008"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={6}
              />
              {errors.productCode && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.productCode}</Text>
              )}
            </View>

            {/* Field 2: Tên sản phẩm */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Tên sản phẩm <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.bgTertiary,
                    borderColor: errors.name ? colors.danger : colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="VD: Nước giải khát Coca Cola 330ml"
                placeholderTextColor={colors.textMuted}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.name}</Text>
              )}
            </View>

            {/* Field 3: Mã vạch EAN-13 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Mã vạch EAN-13 (13 số) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.barcodeInputWrapper}>
                <Barcode
                  size={18}
                  color={colors.accent}
                  style={styles.barcodeIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.barcodeInput,
                    styles.monoInput,
                    {
                      backgroundColor: colors.bgTertiary,
                      borderColor: errors.barcode ? colors.danger : colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={barcode}
                  onChangeText={(t) => {
                    const cleaned = t.replace(/\D/g, '').slice(0, 13);
                    setBarcode(cleaned);
                    if (errors.barcode) setErrors((prev) => ({ ...prev, barcode: null }));
                  }}
                  placeholder="VD: 8938505942013"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={13}
                />
              </View>
              {errors.barcode ? (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.barcode}</Text>
              ) : barcode.length === 13 ? (
                <View
                  style={[
                    styles.checksumBadge,
                    isBarcodeValid
                      ? { backgroundColor: colors.successLight }
                      : { backgroundColor: colors.dangerLight },
                  ]}
                >
                  {isBarcodeValid ? (
                    <>
                      <CheckCircle2 size={13} color={colors.success} />
                      <Text style={[styles.checksumValidText, { color: colors.success }]}>
                        Mã EAN-13 & Checksum hợp lệ
                      </Text>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} color={colors.danger} />
                      <Text style={[styles.checksumInvalidText, { color: colors.danger }]}>
                        Sai Checksum GS1 Modulo-10
                      </Text>
                    </>
                  )}
                </View>
              ) : null}
            </View>

            {/* Field 4: Ảnh đại diện sản phẩm */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Ảnh đại diện sản phẩm (Tùy chọn)
              </Text>

              {imageUri ? (
                <View style={[styles.imagePreviewContainer, { borderColor: colors.primary }]}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImageUri(null)}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.imageActionBtn,
                      {
                        backgroundColor: colors.bgTertiary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleTakePhoto}
                    activeOpacity={0.8}
                  >
                    <Camera size={18} color={colors.primary} />
                    <Text style={[styles.imageActionText, { color: colors.textPrimary }]}>
                      Chụp ảnh trực tiếp
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.imageActionBtn,
                      {
                        backgroundColor: colors.bgTertiary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handlePickImage}
                    activeOpacity={0.8}
                  >
                    <ImageIcon size={18} color={colors.accent} />
                    <Text style={[styles.imageActionText, { color: colors.textPrimary }]}>
                      Chọn từ thư viện
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Field 5: Mô tả chi tiết */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Mô tả chi tiết</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Nhập ghi chú hoặc quy cách sản phẩm..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actionsRow, { borderTopColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.bgTertiary }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary },
                loading && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.textOnPrimary || '#000000'} />
              ) : (
                <>
                  <Plus size={16} color={colors.textOnPrimary || '#000000'} strokeWidth={2.5} />
                  <Text style={[styles.submitBtnText, { color: colors.textOnPrimary || '#000000' }]}>Tạo sản phẩm</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 22,
    borderWidth: 1,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    marginTop: 14,
    maxHeight: 420,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  required: {
    color: '#f43f5e',
  },
  autoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autoBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  monoInput: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  barcodeInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  barcodeIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  barcodeInput: {
    paddingLeft: 42,
  },
  textArea: {
    height: 76,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  checksumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  checksumValidText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checksumInvalidText: {
    fontSize: 11,
    fontWeight: '700',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  imageActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
