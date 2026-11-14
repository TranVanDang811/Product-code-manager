import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { scanHistoryApi } from '../api/scanHistoryApi';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import Badge from '../components/Badge';
import { formatDateTime } from '../utils/formatters';
import { History, Barcode, Clock, User, Hash } from 'lucide-react-native';

const STATUS_FILTERS = [
  { key: '', label: 'Tất cả' },
  { key: 'FOUND', label: 'Tìm thấy' },
  { key: 'NOT_FOUND', label: 'Không thấy' },
  { key: 'INVALID', label: 'Sai định dạng' },
];

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchHistories = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: 0,
        size: 50,
        status: selectedStatus || undefined,
        sortBy: 'scannedAt',
        direction: 'desc',
      };

      const res = await scanHistoryApi.getHistories(params);
      if (res && res.data) {
        setHistories(res.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load scan histories', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Header
        title="Lịch sử tra cứu"
        subtitle={`Nhật ký ${histories.length} lượt quét mã thời gian thực`}
      />

      {/* Filter Chips */}
      <View
        style={[
          styles.filterWrapper,
          {
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.headerBorder,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {STATUS_FILTERS.map((item) => {
            const isSelected = selectedStatus === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.chip,
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
                    styles.chipText,
                    {
                      color: isSelected ? '#ffffff' : colors.textSecondary,
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

      {/* History List */}
      <FlatList
        data={histories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.barcodeRow}>
                <Barcode size={16} color={colors.accent} strokeWidth={2} />
                <Text style={[styles.barcodeText, { color: colors.textPrimary }]}>
                  {item.barcodeScanned}
                </Text>
              </View>
              <Badge status={item.status} />
            </View>

            {item.productCode ? (
              <View
                style={[
                  styles.productBlock,
                  {
                    backgroundColor: colors.bgTertiary,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.codePill,
                    {
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.primaryBorder,
                    },
                  ]}
                >
                  <Hash size={10} color={colors.primary} style={{ marginRight: 2 }} />
                  <Text style={[styles.codePillText, { color: colors.primary }]}>
                    {item.productCode}
                  </Text>
                </View>
                <Text
                  style={[styles.productName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.productName}
                </Text>
              </View>
            ) : null}

            <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
              <View style={styles.timeRow}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  {formatDateTime(item.scannedAt)}
                </Text>
              </View>

              {item.scannedByUsername ? (
                <View style={styles.userRow}>
                  <User size={12} color={colors.textMuted} />
                  <Text style={[styles.footerText, { color: colors.textMuted }]}>
                    {item.scannedByUsername}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHistories(true)}
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
                <History size={40} color={colors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Chưa có lịch sử quét nào
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Các lượt quét mã tra cứu sẽ tự động lưu và hiển thị tại đây
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barcodeText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 15,
  },
  productBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  codePillText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 11,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
