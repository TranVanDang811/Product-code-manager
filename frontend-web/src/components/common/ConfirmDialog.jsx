import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isDanger = true,
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3.5">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            isDanger
              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
              : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-slate-300">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-3.5 border-t border-[#27272a]">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-[#1c1c1f] rounded-xl hover:bg-[#27272a] transition disabled:opacity-50 border border-[#27272a]"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 ${
            isDanger
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-zinc-100 hover:bg-white text-zinc-950 font-semibold shadow-md'
          }`}
        >
          {isLoading ? 'Đang xử lý...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
