import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '../api/authApi';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { addToast } from '../store/toastSlice';
import { useTheme } from '../context/ThemeContext';
import {
  Barcode,
  Lock,
  User,
  Sun,
  Moon,
  Database,
  ArrowRight,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useTheme();
  const { loading } = useSelector((state) => state.auth);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setErrorMessage('');
      dispatch(loginStart());
      const response = await authApi.login(data);
      if (response && response.data) {
        const token = response.data.accessToken || response.data.token;
        dispatch(
          loginSuccess({
            token: token,
            user: response.data.user,
          })
        );
        dispatch(
          addToast({
            type: 'success',
            message: `Đăng nhập thành công! Quyền: ${response.data.user.role}`,
          })
        );
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác';
      setErrorMessage(msg);
      dispatch(loginFailure(msg));
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#09090b] text-[#f4f4f5] transition-colors duration-200">
      {/* Top right theme switch */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-white shadow-sm transition"
          title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-300" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#121214] border border-[#27272a] rounded-2xl shadow-2xl p-8 relative">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-950 shadow-lg mb-4">
            <Barcode className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            DC ĐẲNG CẤP
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Hệ thống quản lý Barcode EAN-13 & Mã 6 số
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Tài khoản
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                {...register('username')}
                placeholder="Nhập tên đăng nhập..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#1c1c1f] border border-[#27272a] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-rose-400">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                {...register('password')}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#1c1c1f] border border-[#27272a] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-zinc-950" />
            ) : (
              <>
                <span>ĐĂNG NHẬP HỆ THỐNG</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Cloud database sync status note */}
        <div className="mt-8 pt-4 border-t border-[#27272a] flex items-center justify-center gap-2 text-xs text-zinc-400">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cơ sở dữ liệu: Đồng bộ đám mây trực tuyến</span>
        </div>
      </div>
    </div>
  );
}
