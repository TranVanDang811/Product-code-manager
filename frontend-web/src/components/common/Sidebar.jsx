import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ScanLine, History, Barcode, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    {
      to: '/',
      label: 'Tổng quan (Dashboard)',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      to: '/products',
      label: 'Quản lý Sản phẩm',
      icon: <Package className="w-5 h-5" />,
    },
    {
      to: '/scanner',
      label: 'Tra cứu Barcode',
      icon: <ScanLine className="w-5 h-5" />,
    },
    {
      to: '/history',
      label: 'Lịch sử quét',
      icon: <History className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base leading-tight tracking-tight">PCM System</div>
              <div className="text-[11px] text-slate-400 font-medium">EAN-13 & Code 6</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/10 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* System Footer info */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Quy tắc nghiệp vụ</div>
            <div>• Mã SP: 6 chữ số (001234)</div>
            <div>• Barcode: 13 số chuẩn EAN-13</div>
            <div>• Quan hệ ánh xạ: 1 - 1</div>
          </div>
        </div>
      </aside>
    </>
  );
}

