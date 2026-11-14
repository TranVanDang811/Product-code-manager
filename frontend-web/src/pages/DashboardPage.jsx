import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import {
  Package,
  ScanLine,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDateTime, formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await dashboardApi.getStats();
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center">
        <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-rose-800">{error}</h3>
        <button
          onClick={() => fetchStats(true)}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition"
        >
          Tải lại dữ liệu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi tình trạng sản phẩm, mã vạch EAN-13 và lịch sử tra cứu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <Link
            to="/products"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition shadow-sm shadow-brand-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Thêm sản phẩm
          </Link>
          <Link
            to="/scanner"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition shadow-sm"
          >
            <ScanLine className="w-3.5 h-3.5" />
            Quét Barcode
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sản phẩm */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalProducts || 0}</div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
              {stats?.activeProducts || 0} Hoạt động
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">
              {stats?.inactiveProducts || 0} Tạm ngưng
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
              {stats?.archivedProducts || 0} Lưu trữ
            </span>
          </div>
        </div>

        {/* Card 2: Tổng lượt tra cứu */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lượt quét</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ScanLine className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalScans || 0}</div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Tổng lịch sử tra cứu đã ghi nhận
          </p>
        </div>

        {/* Card 3: Tỷ lệ tìm thấy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ thành công</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {stats?.foundRate != null ? `${stats.foundRate}%` : '0%'}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {stats?.foundScans || 0} lượt tìm thấy sản phẩm hợp lệ
          </p>
        </div>

        {/* Card 4: Không tìm thấy & Lỗi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chưa khớp / Sai mã</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600">
            {(stats?.notFoundScans || 0) + (stats?.invalidScans || 0)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-slate-500">{stats?.notFoundScans || 0} Chưa có trong DB</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{stats?.invalidScans || 0} Sai format</span>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart & Statistics Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">Xu hướng tra cứu trong 7 ngày gần nhất</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Tìm thấy (FOUND)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span>Không thấy (NOT_FOUND)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-400" />
              <span>Sai chuẩn (INVALID)</span>
            </div>
          </div>
        </div>

        {/* Daily Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {stats?.dailyScanStats?.map((day) => {
            const maxVal = Math.max(
              ...stats.dailyScanStats.map((d) => d.total),
              1
            );
            const heightPercent = Math.round((day.total / maxVal) * 100);

            return (
              <div
                key={day.date}
                className="flex flex-col items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition"
              >
                <div className="text-xs font-semibold text-slate-600 mb-2">
                  {formatDate(day.date)}
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full h-24 flex items-end justify-center gap-1 my-2">
                  <div
                    className="w-8 rounded-t-lg bg-gradient-to-t from-brand-500 to-indigo-400 transition-all duration-500"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    title={`Tổng: ${day.total}`}
                  />
                </div>

                <div className="w-full text-center border-t border-slate-200 pt-2 mt-1">
                  <div className="text-sm font-bold text-slate-800">{day.total} lượt</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    +{day.found} | -{day.notFound} | !{day.invalid}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10 Recent Scans */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">10 lượt tra cứu gần nhất</h2>
            <p className="text-xs text-slate-500 mt-0.5">Lịch sử quét barcode thời gian thực</p>
          </div>
          <Link
            to="/history"
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
          >
            Xem tất cả lịch sử
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Barcode đã quét</th>
                <th className="py-3 px-4">Kết quả</th>
                <th className="py-3 px-4">Mã SP</th>
                <th className="py-3 px-4">Tên sản phẩm</th>
                <th className="py-3 px-4">Thiết bị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stats?.recentScans?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-slate-400">
                    Chưa có lượt quét mã vạch nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                stats?.recentScans?.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(scan.scannedAt)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {scan.barcodeScanned}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={scan.status} />
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-brand-600">
                      {scan.productCode || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {scan.productName || '-'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 truncate max-w-[150px]">
                      {scan.deviceInfo || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

