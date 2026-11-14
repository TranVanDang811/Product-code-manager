import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 - Không tìm thấy trang</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        Đường dẫn bạn yêu cầu không tồn tại trên hệ thống Product Code Manager.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition shadow-sm"
      >
        <Home className="w-4 h-4" />
        Về trang chủ
      </Link>
    </div>
  );
}

