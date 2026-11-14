import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '../api/authApi';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { addToast } from '../store/toastSlice';
import { Barcode, Lock, User, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
            message: `Đăng nhập thành công! Chào mừng ${response.data.user.fullName || response.data.user.username}`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30 mb-4">
              <Barcode className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Product Code Manager</h1>
            <p className="text-sm text-slate-500 mt-1">Đăng nhập tài khoản Quản trị viên (ADMIN)</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  {...register('username')}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                    errors.username ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50/50'
                  }`}
                  placeholder="Nhập tên tài khoản"
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-rose-600 mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                    errors.password ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50/50'
                  }`}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition shadow-lg shadow-brand-500/25 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            Hệ thống quản lý nội bộ • Ánh xạ Barcode EAN-13 & Mã 6 số
          </div>
        </div>
      </div>
    </div>
  );
}

