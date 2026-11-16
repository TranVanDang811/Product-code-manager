import { useState, useEffect, useCallback } from 'react';
import { scanHistoryApi } from '../api/scanHistoryApi';
import { formatDateTime } from '../utils/formatters';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { History, Search, Eye, RefreshCw, X, Hash } from 'lucide-react';

const STATUS_OPTIONS = [
  { key: '', label: 'Tất cả' },
  { key: 'FOUND', label: 'Tìm thấy' },
  { key: 'NOT_FOUND', label: 'Không tìm thấy' },
  { key: 'INVALID', label: 'Sai định dạng' },
];

export default function ScanHistoriesPage() {
  const [histories, setHistories] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState('');
  const [barcodeFilter, setBarcodeFilter] = useState('');

  // Detail Modal
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchHistories = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size,
        status: statusFilter || undefined,
        barcode: barcodeFilter.trim() || undefined,
        sortBy: 'scannedAt',
        direction: 'desc',
      };
      const res = await scanHistoryApi.getHistories(params);
      if (res && res.data) {
        setHistories(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to fetch scan histories', err);
    } finally {
      setLoading(false);
    }
  }, [page, size, statusFilter, barcodeFilter]);

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  const handleOpenDetail = (history) => {
    setSelectedHistory(history);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Lịch sử quét mã
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ghi nhận kiểm toán toàn bộ lượt quét mã vạch và kết quả đối soát trên hệ thống
          </p>
        </div>
        <button
          onClick={fetchHistories}
          className="btn-secondary text-xs py-2 px-3.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="pcm-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            value={barcodeFilter}
            onChange={(e) => {
              setBarcodeFilter(e.target.value);
              setPage(0);
            }}
            placeholder="Lọc theo mã vạch..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#27272a] bg-[#1c1c1f] text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition"
          />
          {barcodeFilter && (
            <button
              onClick={() => {
                setBarcodeFilter('');
                setPage(0);
              }}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {STATUS_OPTIONS.map((item) => {
            const isSelected = statusFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setStatusFilter(item.key);
                  setPage(0);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-[#1c1c1f] hover:bg-[#27272a] text-zinc-200 border border-[#27272a]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Card */}
      <div className="pcm-card overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#18181b] text-[11px] font-bold text-zinc-300 uppercase tracking-wider border-b border-[#27272a]">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Mã vạch đã quét</th>
                  <th className="py-3 px-4">Kết quả</th>
                  <th className="py-3 px-4">Mã sản phẩm</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4">Thiết bị</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] text-xs">
                {histories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-14 text-center text-zinc-400">
                      Không tìm thấy bản ghi lịch sử nào.
                    </td>
                  </tr>
                ) : (
                  histories.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#27272a]/70 even:bg-[#18181b]/60 hover:bg-[#27272a] transition-colors"
                    >
                      <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                        {formatDateTime(item.scannedAt)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {item.barcodeScanned}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={item.status} />
                      </td>
                      <td className="py-3 px-4">
                        {item.productCode ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-lg text-xs border border-zinc-700">
                            <Hash className="w-3 h-3 text-zinc-300" />
                            {item.productCode}
                          </span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white font-medium max-w-xs truncate">
                        {item.productName || '-'}
                      </td>
                      <td className="py-3 px-4 text-zinc-300 truncate max-w-[180px]">
                        {item.deviceInfo || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết lịch sử quét"
        maxWidth="max-w-lg"
      >
        {selectedHistory && (
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
              <span className="text-zinc-400 font-semibold uppercase tracking-wider">Kết quả tra cứu</span>
              <Badge status={selectedHistory.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Mã vạch đã quét</span>
                <span className="font-mono text-xs font-bold text-white">
                  {selectedHistory.barcodeScanned}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Mã sản phẩm</span>
                <span className="font-mono text-xs font-bold text-zinc-200">
                  {selectedHistory.productCode ? `#${selectedHistory.productCode}` : 'Chưa có'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Tên sản phẩm</span>
              <span className="font-semibold text-white">
                {selectedHistory.productName || 'Không xác định'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Thông báo</span>
              <span className="text-zinc-300">
                {selectedHistory.message || 'Không có thông báo'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Thiết bị</span>
              <span className="font-mono text-zinc-300 break-all">
                {selectedHistory.deviceInfo || 'Web Browser'}
              </span>
            </div>

            <div className="text-right pt-2 text-zinc-400">
              Thời gian: {formatDateTime(selectedHistory.scannedAt)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
