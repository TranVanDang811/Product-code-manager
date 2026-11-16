import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import { barcodeApi } from '../api/barcodeApi';
import {
  Package,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Clock,
  TrendingUp,
  Search,
  Check,
  Zap,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDateTime, formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Quick Barcode Test State
  const [testBarcode, setTestBarcode] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

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

  const handleQuickTest = async (e) => {
    e.preventDefault();
    if (!testBarcode.trim()) return;
    try {
      setTesting(true);
      const res = await barcodeApi.lookup({
        barcode: testBarcode.trim(),
        deviceInfo: 'Web Dashboard Quick Test',
      });
      setTestResult(res?.data || null);
      fetchStats();
    } catch (err) {
      setTestResult({
        status: 'INVALID',
        message: err.message || 'Lỗi khi kiểm tra mã vạch',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pcm-card p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-rose-300">{error}</h3>
        <button
          onClick={() => fetchStats(true)}
          className="btn-primary mt-4 text-xs"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-xs text-zinc-300 mt-1">
            Bảng điều hành thời gian thực • Mã vạch GS1 EAN-13
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="btn-secondary text-xs py-2 px-3.5"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <Link
            to="/products"
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm sản phẩm</span>
          </Link>
          <Link
            to="/scanner"
            className="btn-primary text-xs py-2 px-4 shadow-sm"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Quét mã vạch</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 Stat Metric Cards (Stealth Monochromatic Dark Gray) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng kho sản phẩm */}
        <div className="pcm-card p-5 hover:border-zinc-600 transition duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tổng sản phẩm
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {stats?.totalProducts || 0}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-800/40">
              {stats?.activeProducts || 0} hoạt động
            </span>
            <span className="text-amber-400 font-semibold px-2 py-0.5 rounded-md bg-amber-950/50 border border-amber-800/40">
              {stats?.inactiveProducts || 0} tạm ngưng
            </span>
          </div>
        </div>

        {/* Card 2: Lượt quét Barcode */}
        <div className="pcm-card p-5 hover:border-zinc-600 transition duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Lượt quét mã
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center">
              <ScanLine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-100 tracking-tight">
            {stats?.totalScans || 0}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Đồng bộ tức thì Firebase</span>
          </div>
        </div>

        {/* Card 3: Tỷ lệ tìm thấy (Neon Emerald) */}
        <div className="pcm-card p-5 hover:border-zinc-600 transition duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tỷ lệ khớp mã
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {stats?.foundRate != null ? `${stats.foundRate}%` : '0%'}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="font-bold text-emerald-400">
              {stats?.foundScans || 0}
            </span>
            <span>lượt khớp dữ liệu chuẩn</span>
          </div>
        </div>

        {/* Card 4: Cảnh báo chưa khớp / Lỗi (Neon Rose) */}
        <div className="pcm-card p-5 hover:border-zinc-600 transition duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Chưa khớp / Sai chuẩn
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-950/70 text-rose-400 border border-rose-800/60 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 tracking-tight">
            {(stats?.notFoundScans || 0) + (stats?.invalidScans || 0)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="text-amber-400 font-medium">{stats?.notFoundScans || 0} chưa gán</span>
            <span>•</span>
            <span className="text-rose-400 font-medium">{stats?.invalidScans || 0} sai GS1</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Barcode Test Card (Real-Time Modulo-10 Tester) */}
      <div className="pcm-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Kiểm tra mã vạch siêu tốc (GS1 Modulo-10)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Nhập 13 số để phân tích Check Digit và tra cứu tức thì thông tin sản phẩm
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            ACTIVE
          </span>
        </div>

        <form onSubmit={handleQuickTest} className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <ScanLine className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={testBarcode}
              onChange={(e) => setTestBarcode(e.target.value)}
              placeholder="Nhập 13 chữ số mã vạch EAN-13 (VD: 8935001700018)..."
              maxLength={13}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1c1c1f] border border-[#27272a] font-mono text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={testing || !testBarcode.trim()}
            className="btn-primary text-xs py-2.5 px-5 disabled:opacity-50"
          >
            {testing ? <LoadingSpinner size="sm" className="text-zinc-900" /> : <Search className="w-4 h-4" />}
            <span>Kiểm tra</span>
          </button>
        </form>

        {testResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <Badge status={testResult.status} />
                <span className="font-mono font-bold text-white">
                  {testResult.barcodeScanned || testBarcode}
                </span>
                <span className="text-zinc-400">• {testResult.message}</span>
              </div>

              {testResult.product && (
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700">
                    #{testResult.product.productCode}
                  </span>
                  <span className="font-semibold text-white truncate max-w-xs">
                    {testResult.product.name}
                  </span>
                  <button
                    onClick={() => navigate('/products')}
                    className="text-zinc-300 hover:text-white underline font-semibold text-xs ml-1"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. 7-Day Frequency Visualizer & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Bar Chart */}
        <div className="pcm-card p-5 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-bold text-white">
                Hoạt động 7 ngày gần nhất
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mb-5">
              Lưu lượng quét và kết quả đối soát
            </p>

            <div className="space-y-3">
              {stats?.scansByDay && stats.scansByDay.length > 0 ? (
                stats.scansByDay.slice(-7).map((item, idx) => {
                  const maxCount = Math.max(...stats.scansByDay.map((d) => d.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-400">{formatDate(item.date)}</span>
                        <span className="font-bold text-white">{item.count} lượt</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1c1c1f] overflow-hidden">
                        <div
                          className="h-full bg-zinc-300 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Chưa có dữ liệu thống kê tuần
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="pcm-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27272a]">
            <div>
              <h2 className="text-sm font-bold text-white">
                Lượt quét gần đây
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Nhật ký quét mã mới nhất trên hệ thống
              </p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-zinc-300 hover:text-white underline"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider border-b border-[#27272a]">
                  <th className="py-2.5 px-3">Mã vạch</th>
                  <th className="py-2.5 px-3">Sản phẩm</th>
                  <th className="py-2.5 px-3">Kết quả</th>
                  <th className="py-2.5 px-3 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {!stats?.recentScans || stats.recentScans.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-zinc-400">
                      Chưa có lịch sử quét nào
                    </td>
                  </tr>
                ) : (
                  stats.recentScans.slice(0, 7).map((scan) => (
                    <tr key={scan.id} className="hover:bg-[#27272a] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {scan.barcodeScanned}
                      </td>
                      <td className="py-2.5 px-3">
                        {scan.product ? (
                          <span className="font-semibold text-white">
                            {scan.product.name}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">Chưa liên kết</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge status={scan.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right text-zinc-300 whitespace-nowrap">
                        {formatDateTime(scan.scannedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
