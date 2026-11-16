import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { authApi } from '../../api/authApi';
import {
  LogOut,
  User,
  Menu,
  Search,
  Smartphone,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [quickBarcode, setQuickBarcode] = useState('');

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (quickBarcode.trim()) {
      navigate(`/scanner?barcode=${encodeURIComponent(quickBarcode.trim())}`);
      setQuickBarcode('');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#27272a] bg-[#121214] px-4 sm:px-6 transition-colors duration-200">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:bg-[#1c1c1f] hover:text-white transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <form onSubmit={handleQuickLookup} className="relative flex-1 max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={quickBarcode}
            onChange={(e) => setQuickBarcode(e.target.value)}
            placeholder="Tra cứu nhanh mã vạch 13 số..."
            className="w-full pl-9 pr-14 py-2 text-xs rounded-xl bg-[#1c1c1f] border border-[#27272a] focus:border-zinc-500 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 transition"
          />
          <div className="absolute inset-y-1.5 right-1.5 flex items-center">
            <button
              type="submit"
              className="px-2 py-0.5 rounded-lg bg-[#27272a] text-zinc-200 text-[10px] font-semibold border border-[#3f3f46] hover:bg-[#3f3f46] transition"
            >
              Tìm
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile APK Link Button */}
        <a
          href="https://expo.dev/artifacts/eas/-8bzKs8Jb4CJv-Giyaad6Ba3WersR_ZjihO_Xrj0oj4.apk"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-[#1c1c1f] hover:bg-[#27272a] transition border border-[#27272a]"
          title="Tải ứng dụng Android APK v1.0.4"
        >
          <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
          <span>Tải APK</span>
        </a>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#27272a]">
          <div className="w-8 h-8 rounded-full bg-[#27272a] text-zinc-100 flex items-center justify-center font-bold text-xs uppercase border border-[#3f3f46]">
            {user?.username ? user.username.substring(0, 2) : 'AD'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-zinc-100 leading-tight">
              {user?.fullName || user?.username || 'Quản trị viên'}
            </div>
            <div className="text-[10px] text-zinc-400 font-medium">
              Admin
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition ml-1"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Thoát</span>
        </button>
      </div>
    </header>
  );
}
