import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { performLogout } from '../store/authSlice';
import { API_BASE_URL, CLOUDFLARE_TUNNEL_URL, LOCAL_LAN_URL, setCustomApiUrl } from '../api/config';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import axios from 'axios';
import {
  User,
  Server,
  LogOut,
  CheckCircle,
  RefreshCw,
  Globe,
  Wifi,
  Sun,
  Moon,
  Shield,
  Palette,
  Info,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { theme, isDark, setTheme, colors } = useTheme();

  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(null);

  const handleSelectPreset = async (url) => {
    setApiUrl(url);
    setTestSuccess(null);
    try {
      const saved = await setCustomApiUrl(url);
      setApiUrl(saved);
      Alert.alert('Đã chọn cấu hình', `Đã chuyển sang: ${url.includes('trycloudflare') ? 'Đường hầm Cloudflare' : 'Mạng WiFi nội bộ'}`);
    } catch {
      // ignore
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestSuccess(null);
      let target = apiUrl.trim();
      if (!target.endsWith('/api/v1')) {
        target = target.replace(/\/+$/, '') + '/api/v1';
      }
      const res = await axios.get(`${target}/health`, { timeout: 6000 });
      if (res.data?.success) {
        setTestSuccess(true);
        Alert.alert('Thành công', 'Kết nối đến máy chủ Backend Spring Boot thành công!');
      } else {
        setTestSuccess(false);
        Alert.alert('Cảnh báo', 'Máy chủ phản hồi nhưng không đúng cấu trúc.');
      }
    } catch (err) {
      setTestSuccess(false);
      Alert.alert(
        'Lỗi kết nối',
        `Không thể kết nối đến máy chủ tại: ${apiUrl}\nKiểm tra lại đường dẫn và tình trạng máy chủ.`
      );
    } finally {
      setTesting(false);
    }
  };

  const handleSaveApiUrl = async () => {
    try {
      const saved = await setCustomApiUrl(apiUrl);
      setApiUrl(saved);
      Alert.alert('Đã lưu cấu hình', `Địa chỉ máy chủ mới: ${saved}`);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu cấu hình địa chỉ máy chủ.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản quản trị?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => dispatch(performLogout()),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Header title="Cài đặt hệ thống" subtitle="Tùy biến giao diện & kết nối máy chủ" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. Profile / Brand Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.userRow}>
            <View style={[styles.avatarWrapper, { borderColor: colors.primaryBorder }]}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.brandLogoSmall}
                resizeMode="cover"
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {user?.fullName || user?.username || 'DC ĐẲNG CẤP'}
              </Text>
              <View style={styles.badgeRow}>
                <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
                  <Shield size={11} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.roleText, { color: colors.primary }]}>
                    {user?.role || 'ADMIN'}
                  </Text>
                </View>
                <View style={styles.onlinePill}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Trực tuyến</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Theme Switcher Card (Tùy chọn Sáng / Tối) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <Palette size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Giao diện & Chủ đề
            </Text>
          </View>
          <Text style={[styles.cardHint, { color: colors.textSecondary }]}>
            Chuyển đổi linh hoạt giữa giao diện Tối sang trọng và Sáng thanh lịch:
          </Text>

          <View style={styles.themeGrid}>
            {/* Dark Theme Option */}
            <TouchableOpacity
              style={[
                styles.themeBtn,
                {
                  backgroundColor: isDark ? colors.bgTertiary : '#f1f5f9',
                  borderColor: isDark ? colors.primary : colors.border,
                  borderWidth: isDark ? 2 : 1,
                },
              ]}
              onPress={() => setTheme('dark')}
              activeOpacity={0.8}
            >
              <View style={[styles.themeIconCircle, { backgroundColor: '#0a0e1a' }]}>
                <Moon size={20} color="#00f0ff" />
              </View>
              <Text style={[styles.themeBtnTitle, { color: colors.textPrimary }]}>
                🌙 Chế độ Tối
              </Text>
              <Text style={[styles.themeBtnDesc, { color: colors.textSecondary }]}>
                Titanium Dark Neon
              </Text>
              {isDark && (
                <View style={[styles.activeCheck, { backgroundColor: colors.primary }]}>
                  <CheckCircle size={14} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Light Theme Option */}
            <TouchableOpacity
              style={[
                styles.themeBtn,
                {
                  backgroundColor: !isDark ? colors.primaryLight : colors.bgTertiary,
                  borderColor: !isDark ? colors.primary : colors.border,
                  borderWidth: !isDark ? 2 : 1,
                },
              ]}
              onPress={() => setTheme('light')}
              activeOpacity={0.8}
            >
              <View style={[styles.themeIconCircle, { backgroundColor: '#f8fafc' }]}>
                <Sun size={20} color="#f59e0b" />
              </View>
              <Text style={[styles.themeBtnTitle, { color: colors.textPrimary }]}>
                ☀️ Chế độ Sáng
              </Text>
              <Text style={[styles.themeBtnDesc, { color: colors.textSecondary }]}>
                Modern Clean iOS
              </Text>
              {!isDark && (
                <View style={[styles.activeCheck, { backgroundColor: colors.primary }]}>
                  <CheckCircle size={14} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Server IP Config Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <Server size={18} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Cấu hình kết nối máy chủ Backend
            </Text>
          </View>
          <Text style={[styles.cardHint, { color: colors.textSecondary }]}>
            Chọn chế độ kết nối mạng cho điện thoại của bạn:
          </Text>

          {/* Quick Preset Buttons */}
          <View style={styles.presetContainer}>
            <TouchableOpacity
              style={[
                styles.presetBtn,
                {
                  backgroundColor: colors.bgTertiary,
                  borderColor: apiUrl.includes('trycloudflare.com')
                    ? colors.primary
                    : colors.border,
                  borderWidth: apiUrl.includes('trycloudflare.com') ? 1.5 : 1,
                },
              ]}
              onPress={() => handleSelectPreset(CLOUDFLARE_TUNNEL_URL)}
            >
              <Globe
                size={18}
                color={apiUrl.includes('trycloudflare.com') ? colors.primary : colors.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.presetTitle,
                    {
                      color: apiUrl.includes('trycloudflare.com')
                        ? colors.primary
                        : colors.textPrimary,
                    },
                  ]}
                >
                  🌐 Từ xa (4G/5G/WiFi khác)
                </Text>
                <Text style={[styles.presetSubtitle, { color: colors.textSecondary }]}>
                  Cloudflare Tunnel HTTPS
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.presetBtn,
                {
                  backgroundColor: colors.bgTertiary,
                  borderColor: apiUrl.includes('192.168.')
                    ? colors.primary
                    : colors.border,
                  borderWidth: apiUrl.includes('192.168.') ? 1.5 : 1,
                },
              ]}
              onPress={() => handleSelectPreset(LOCAL_LAN_URL)}
            >
              <Wifi
                size={18}
                color={apiUrl.includes('192.168.') ? colors.primary : colors.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.presetTitle,
                    {
                      color: apiUrl.includes('192.168.')
                        ? colors.primary
                        : colors.textPrimary,
                    },
                  ]}
                >
                  🏠 Nội bộ WiFi nhà (LAN)
                </Text>
                <Text style={[styles.presetSubtitle, { color: colors.textSecondary }]}>
                  192.168.100.137:8080
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Custom API URL input */}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.bgTertiary,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            value={apiUrl}
            onChangeText={(text) => {
              setApiUrl(text);
              setTestSuccess(null);
            }}
            placeholder="https://...trycloudflare.com/api/v1"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.testBtn,
                {
                  backgroundColor: colors.bgTertiary,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <RefreshCw size={16} color={colors.primary} />
              ) : (
                <Text style={[styles.testBtnText, { color: colors.primary }]}>
                  Kiểm tra kết nối
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveApiUrl}
            >
              <Text style={styles.saveBtnText}>Lưu cấu hình</Text>
            </TouchableOpacity>
          </View>

          {testSuccess === true && (
            <View
              style={[
                styles.successBanner,
                {
                  backgroundColor: colors.successLight,
                  borderColor: colors.successBorder,
                },
              ]}
            >
              <CheckCircle size={16} color={colors.success} />
              <Text style={[styles.successBannerText, { color: colors.success }]}>
                Máy chủ sẵn sàng hoạt động (200 OK)
              </Text>
            </View>
          )}
        </View>

        {/* 4. App Info Pill */}
        <View style={styles.infoRow}>
          <Info size={14} color={colors.textMuted} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            DC ĐẲNG CẤP - Product Code Manager v1.0.1
          </Text>
        </View>

        {/* 5. Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            {
              backgroundColor: colors.dangerLight,
              borderColor: colors.dangerBorder,
            },
          ]}
          onPress={handleLogout}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Đăng xuất tài khoản
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    marginRight: 14,
  },
  brandLogoSmall: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardHint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  themeBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
  },
  themeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  themeBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  themeBtnDesc: {
    fontSize: 11,
  },
  activeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetContainer: {
    gap: 10,
    marginBottom: 14,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  presetSubtitle: {
    fontSize: 11,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  testBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 14,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
