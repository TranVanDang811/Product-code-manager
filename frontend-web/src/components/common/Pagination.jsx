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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 bg-[#121214] border-t border-[#27272a] transition-colors">
      <div className="text-xs text-zinc-400">
        Hiển thị <span className="font-semibold text-zinc-200">{startItem}</span> -{' '}
        <span className="font-semibold text-zinc-200">{endItem}</span> trên{' '}
        <span className="font-bold text-white">{totalElements}</span> bản ghi
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-1 rounded-lg border border-[#27272a] text-zinc-300 hover:bg-[#1c1c1f] disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-xs font-semibold text-zinc-200 px-2.5 py-0.5 bg-[#1c1c1f] rounded-lg border border-[#27272a]">
          {currentPage + 1} / {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-1 rounded-lg border border-[#27272a] text-zinc-300 hover:bg-[#1c1c1f] disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
