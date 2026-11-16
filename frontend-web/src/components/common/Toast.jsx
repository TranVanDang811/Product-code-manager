import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/toastSlice';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast() {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.toast.toasts);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeToast(toasts[0].id));
      }, toasts[0].duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getToastStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                bg: 'bg-emerald-50/95 dark:bg-dark-800/95 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 shadow-glow-emerald',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              };
            case 'error':
              return {
                bg: 'bg-rose-50/95 dark:bg-dark-800/95 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 shadow-glow-rose',
                icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
              };
            case 'warning':
              return {
                bg: 'bg-amber-50/95 dark:bg-dark-800/95 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 shadow-glow-gold',
                icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
              };
            default:
              return {
                bg: 'bg-blue-50/95 dark:bg-dark-800/95 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-500/40 shadow-glow-cyan',
                icon: <Info className="w-5 h-5 text-blue-500" />,
              };
          }
        };

        const style = getToastStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 animate-in slide-in-from-top-2 ${style.bg}`}
          >
            <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
            <div className="flex-1 text-sm font-semibold leading-relaxed">{toast.message}</div>
            <button
              onClick={() => dispatch(removeToast(toast.id))}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
