import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { authApi } from '../../api/authApi';
import { LogOut, User, Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

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

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
            Production Management
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User profile */}
        <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {user?.username ? user.username.substring(0, 2) : 'AD'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.fullName || user?.username || 'Admin'}
            </div>
            <div className="text-xs text-slate-400 font-mono">ADMIN</div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}

