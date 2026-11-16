import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { performLogout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import { firebaseService } from '../services/firebaseService';
import {
  User,
  LogOut,
  CheckCircle,
  RefreshCw,
  Sun,
  Moon,
  Shield,
  Palette,
  Info,
  Sparkles,
  Database,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { theme, isDark, setTheme, colors } = useTheme();

  const [firebaseTesting, setFirebaseTesting] = useState(false);
  const [firebaseSuccess, setFirebaseSuccess] = useState(null);

  const handleTestFirebase = async () => {
    try {
      setFirebaseTesting(true);
      const res = await firebaseService.getProducts({ size: 1 });
      setFirebaseSuccess(true);
      Alert.alert(
        'Kết nối ổn định 🔥',
        `Đã kết nối thành công với cơ sở dữ liệu đám mây!\nTổng số sản phẩm trong kho: ${res.data.totalElements || res.data.content?.length || 0}`
      );
    } catch (err) {
      setFirebaseSuccess(false);
      Alert.alert('Lỗi kết nối', err.message || 'Không thể kết nối đến cơ sở dữ liệu.');
    } finally {
      setFirebaseTesting(false);
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
              <View style={[styles.themeIconCircle, { backgroundColor: '#09090b', borderColor: '#2e2e33', borderWidth: 1 }]}>
                <Moon size={20} color="#fafafa" />
              </View>
              <Text style={[styles.themeBtnTitle, { color: colors.textPrimary }]}>
                🌙 Chế độ Tối
              </Text>
              <Text style={[styles.themeBtnDesc, { color: colors.textSecondary }]}>
                Đen xám tối giản
              </Text>
              {isDark && (
                <View style={[styles.activeCheck, { backgroundColor: colors.primary }]}>
                  <CheckCircle size={14} color="#09090b" />
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

        {/* 3. Cơ sở dữ liệu Card (Chỉ kiểm tra kết nối) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: '#f59e0b',
              borderWidth: 1.5,
            },
          ]}
        >
          <View style={styles.cardTitleRow}>
            <Sparkles size={18} color="#f59e0b" />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              🔥 Trạng thái Cơ sở dữ liệu
            </Text>
          </View>
          <Text style={[styles.cardHint, { color: colors.textSecondary }]}>
            Kiểm tra trạng thái kết nối và đồng bộ dữ liệu trực tuyến với cơ sở dữ liệu đám mây.
          </Text>

          <View style={[styles.buttonRow, { marginTop: 14 }]}>
            <TouchableOpacity
              style={[
                styles.testBtn,
                {
                  backgroundColor: '#f59e0b',
                  borderColor: '#f59e0b',
                  flex: 1,
                },
              ]}
              onPress={handleTestFirebase}
              disabled={firebaseTesting}
            >
              <RefreshCw
                size={16}
                color="#ffffff"
                style={firebaseTesting ? styles.rotatingIcon : { marginRight: 6 }}
              />
              <Text style={[styles.testBtnText, { color: '#ffffff', fontWeight: 'bold' }]}>
                {firebaseTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. App Info Pill */}
        <View style={styles.infoRow}>
          <Info size={14} color={colors.textMuted} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            DC ĐẲNG CẤP - Product Code Manager v1.0.4
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
