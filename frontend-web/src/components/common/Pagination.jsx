import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-slate-100 rounded-b-xl">
      <div className="text-xs text-slate-500">
        Hiển thị <span className="font-semibold text-slate-700">{startItem}</span> -{' '}
        <span className="font-semibold text-slate-700">{endItem}</span> trên tổng số{' '}
        <span className="font-semibold text-slate-700">{totalElements}</span> bản ghi
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-xs font-medium text-slate-700 px-2">
          Trang {currentPage + 1} / {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

