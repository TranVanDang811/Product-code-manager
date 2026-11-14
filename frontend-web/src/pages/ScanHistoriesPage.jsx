import { useState, useEffect, useCallback } from 'react';
import { scanHistoryApi } from '../api/scanHistoryApi';
import { formatDateTime } from '../utils/formatters';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { History, Search, Filter, Eye, RefreshCw } from 'lucide-react';

export default function ScanHistoriesPage() {
  const [histories, setHistories] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(15);
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
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lịch sử tra cứu Barcode</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Nhật ký kiểm toán toàn bộ lượt quét mã vạch thành công và không thành công
          </p>
        </div>
        <button
          onClick={fetchHistories}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Làm mới
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={barcodeFilter}
            onChange={(e) => {
              setBarcodeFilter(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo chuỗi Barcode..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="w-full md:w-56 bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Tất cả kết quả tra cứu</option>
            <option value="FOUND">Tìm thấy (FOUND)</option>
            <option value="NOT_FOUND">Không tìm thấy (NOT_FOUND)</option>
            <option value="INVALID">Sai định dạng (INVALID)</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Thời gian quét</th>
                  <th className="py-3 px-4">Barcode đã quét</th>
                  <th className="py-3 px-4">Kết quả tra cứu</th>
                  <th className="py-3 px-4">Mã SP nội bộ</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4">IP / Thiết bị</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {histories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Không tìm thấy bản ghi lịch sử tra cứu nào.
                    </td>
                  </tr>
                ) : (
                  histories.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(item.scannedAt)}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {item.barcodeScanned}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={item.status} />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-brand-600">
                        {item.productCode || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                        {item.productName || '-'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 max-w-[180px] truncate">
                        {item.ipAddress ? `${item.ipAddress} • ` : ''}
                        {item.deviceInfo || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                          title="Xem chi tiết bản ghi"
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
        title="Chi tiết bản ghi lịch sử tra cứu"
        maxWidth="max-w-lg"
      >
        {selectedHistory && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500 text-xs uppercase font-semibold">Kết quả tra cứu</span>
              <Badge status={selectedHistory.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Barcode đã quét:</div>
                <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  {selectedHistory.barcodeScanned}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Thời gian ghi nhận:</div>
                <div className="text-slate-800 font-medium mt-0.5">
                  {formatDateTime(selectedHistory.scannedAt)}
                </div>
              </div>
            </div>

            {selectedHistory.productCode && (
              <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100 space-y-2">
                <div className="text-xs font-semibold text-brand-800 uppercase tracking-wide">
                  Thông tin sản phẩm liên kết
                </div>
                <div className="flex items-center gap-3">
                  {selectedHistory.productImageUrl && (
                    <img
                      src={selectedHistory.productImageUrl}
                      alt={selectedHistory.productName}
                      className="w-12 h-12 rounded-lg object-cover border border-brand-200"
                    />
                  )}
                  <div>
                    <div className="font-bold text-slate-900">{selectedHistory.productName}</div>
                    <div className="text-xs text-brand-700 font-mono font-semibold">
                      Mã 6 số: {selectedHistory.productCode}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
              <div>
                <span className="font-semibold text-slate-700">Người thực hiện: </span>
                {selectedHistory.scannedByUsername || 'Khách vãng lai / Scanner Client'}
              </div>
              <div>
                <span className="font-semibold text-slate-700">IP Client: </span>
                {selectedHistory.ipAddress || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Thiết bị: </span>
                {selectedHistory.deviceInfo || '-'}
              </div>
              {selectedHistory.notes && (
                <div>
                  <span className="font-semibold text-slate-700">Ghi chú hệ thống: </span>
                  {selectedHistory.notes}
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

