import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { performLogin } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import { Lock, User, Database, Shield, Sparkles } from 'lucide-react-native';
import LoadingOverlay from '../components/LoadingOverlay';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const { loading, error } = useSelector((state) => state.auth);

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    const result = await dispatch(performLogin({ username: username.trim(), password }));
    if (!result.success) {
      Alert.alert('Đăng nhập thất bại', result.error || 'Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Luxury Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Logo with Metallic Glow */}
          <View style={[styles.logoWrapper, { borderColor: colors.primaryBorder }]}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>DC ĐẲNG CẤP</Text>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
            Hệ thống quản lý Barcode EAN-13 & Mã 6 số
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>TÀI KHOẢN</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.bgTertiary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <User size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Nhập tên đăng nhập"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>MẬT KHẨU</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.bgTertiary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.loginButton,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={[styles.loginButtonText, { color: colors.textOnPrimary || '#000000' }]}>Đăng nhập quản trị</Text>
            </TouchableOpacity>

            {/* Server Connection status */}
            <View style={[styles.serverInfo, { borderTopColor: colors.border }]}>
              <Database size={14} color="#f59e0b" />
              <Text
                style={[styles.serverText, { color: colors.textMuted }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                Cơ sở dữ liệu: Đồng bộ đám mây trực tuyến
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} message="Đang xác thực thông tin..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  logoWrapper: {
    width: 104,
    height: 104,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#e11d48',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginButton: {
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    width: '100%',
    justifyContent: 'center',
  },
  serverText: {
    fontSize: 11,
    maxWidth: '85%',
  },
});
