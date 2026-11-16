import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col items-center justify-center p-4 text-center transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">404 - Không tìm thấy trang</h1>
      <p className="text-xs text-zinc-400 mt-1 max-w-sm">
        Đường dẫn bạn yêu cầu không tồn tại trên hệ thống DC ĐẲNG CẤP.
      </p>
      <Link
        to="/"
        className="btn-primary mt-5 text-xs py-2.5 px-4"
      >
        <Home className="w-4 h-4" />
        <span>Về trang chủ</span>
      </Link>
    </div>
  );
}
