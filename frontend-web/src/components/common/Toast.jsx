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
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getToastStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              };
            case 'error':
              return {
                bg: 'bg-rose-50 text-rose-800 border-rose-200',
                icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
              };
            case 'warning':
              return {
                bg: 'bg-amber-50 text-amber-800 border-amber-200',
                icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
              };
            default:
              return {
                bg: 'bg-blue-50 text-blue-800 border-blue-200',
                icon: <Info className="w-5 h-5 text-blue-500" />,
              };
          }
        };

        const style = getToastStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-top-2 ${style.bg}`}
          >
            <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
            <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => dispatch(removeToast(toast.id))}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

