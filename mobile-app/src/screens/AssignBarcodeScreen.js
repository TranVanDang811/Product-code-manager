import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { barcodeApi } from '../api/barcodeApi';
import { isValidEan13 } from '../utils/ean13Validator';
import { useTheme } from '../context/ThemeContext';
import LoadingOverlay from '../components/LoadingOverlay';
import { Barcode, CheckCircle2, AlertCircle, Hash } from 'lucide-react-native';

export default function AssignBarcodeScreen({ route, navigation }) {
  const { productId, productCode, productName, currentBarcode } = route.params;
  const { colors } = useTheme();
  const [barcode, setBarcode] = useState(currentBarcode || '');
  const [loading, setLoading] = useState(false);

  const isValid = isValidEan13(barcode);

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert(
        'Mã vạch không hợp lệ',
        'Mã vạch phải gồm đúng 13 chữ số và thỏa mãn thuật toán kiểm tra GS1 Modulo-10 Checksum.'
      );
      return;
    }

    try {
      setLoading(true);
      await barcodeApi.assign({
        productId,
        barcode: barcode.trim(),
      });
      Alert.alert('Thành công', `Đã liên kết mã vạch [${barcode}] với sản phẩm [${productCode}]!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gán mã vạch. Vui lòng thử lại.';
      Alert.alert('Lỗi gán mã vạch', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Target Card */}
        <View
          style={[
            styles.targetCard,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>
            Đang gán mã vạch cho sản phẩm:
          </Text>
          <View style={styles.targetRow}>
            <View
              style={[
                styles.codePill,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primaryBorder,
                },
              ]}
            >
              <Hash size={11} color={colors.primary} style={{ marginRight: 2 }} />
              <Text style={[styles.codeText, { color: colors.primary }]}>{productCode}</Text>
            </View>
            <Text
              style={[styles.targetName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {productName}
            </Text>
          </View>
        </View>

        {/* Input Card */}
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
            Nhập mã vạch EAN-13 (13 chữ số)
          </Text>
          <Text style={[styles.ruleText, { color: colors.textSecondary }]}>
            Quy tắc: Đúng 13 chữ số, kiểm tra chuẩn Modulo-10 Checksum và không trùng lặp với sản phẩm khác.
          </Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.bgTertiary,
                borderColor: colors.border,
              },
            ]}
          >
            <Barcode size={22} color={colors.accent} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              keyboardType="numeric"
              maxLength={13}
              value={barcode}
              onChangeText={(text) => setBarcode(text.replace(/\D/g, ''))}
              placeholder="VD: 8938505942013"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
          </View>

          {/* Validation Status Indicator */}
          {barcode.length === 13 ? (
            <View
              style={[
                styles.statusBox,
                isValid
                  ? { backgroundColor: colors.successLight, borderColor: colors.successBorder }
                  : { backgroundColor: colors.dangerLight, borderColor: colors.dangerBorder },
              ]}
            >
              {isValid ? (
                <>
                  <CheckCircle2 size={16} color={colors.success} />
                  <Text style={[styles.validText, { color: colors.success }]}>
                    Mã vạch EAN-13 & Checksum hợp lệ
                  </Text>
                </>
              ) : (
                <>
                  <AlertCircle size={16} color={colors.danger} />
                  <Text style={[styles.invalidText, { color: colors.danger }]}>
                    Sai Checksum Modulo-10 GS1
                  </Text>
                </>
              )}
            </View>
          ) : (
            <Text style={[styles.lengthHint, { color: colors.textMuted }]}>
              Độ dài hiện tại: {barcode.length}/13 chữ số
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.saveBtn,
              {
                backgroundColor: colors.primary,
                opacity: isValid ? 1 : 0.5,
              },
            ]}
            disabled={!isValid || loading}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Lưu liên kết mã vạch</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} message="Đang lưu liên kết..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
  },
  targetCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 13,
  },
  targetName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  ruleText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 18,
  },
  validText: {
    fontSize: 12,
    fontWeight: '700',
  },
  invalidText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lengthHint: {
    fontSize: 12,
    marginBottom: 18,
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
