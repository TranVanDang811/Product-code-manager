import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ScanLine,
  History,
  Barcode,
  X,
  Smartphone,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    {
      to: '/',
      label: 'Tổng quan',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      to: '/scanner',
      label: 'Quét mã',
      icon: <ScanLine className="w-5 h-5" />,
    },
    {
      to: '/products',
      label: 'Sản phẩm',
      icon: <Package className="w-5 h-5" />,
    },
    {
      to: '/history',
      label: 'Lịch sử',
      icon: <History className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Synchronized Sidebar (Stealth Monochromatic Dark Gray) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#27272a] bg-[#121214] text-[#f4f4f5] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#27272a] px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950 shadow-md">
              <Barcode className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white leading-tight block">
                DC ĐẲNG CẤP
              </span>
              <span className="text-[11px] text-zinc-400 font-medium tracking-normal block">
                Quản lý Barcode & Mã 6 số
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-[#1c1c1f] hover:text-white lg:hidden transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Menu chính
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#27272a] text-white font-semibold border-l-2 border-white shadow-sm'
                    : 'text-zinc-400 hover:bg-[#1c1c1f] hover:text-zinc-100'
                }`
              }
            >
              <div className="text-current">{item.icon}</div>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Database Sync & APK Info */}
        <div className="border-t border-[#27272a] p-3 space-y-2">
          {/* Database cloud status */}
          <div className="flex items-center gap-2.5 rounded-xl bg-[#18181b] p-2.5 border border-[#27272a]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-zinc-200 truncate">
                Cơ sở dữ liệu
              </div>
              <div className="text-[10px] text-emerald-400 font-medium truncate">
                Đồng bộ đám mây trực tuyến
              </div>
            </div>
          </div>

          {/* Direct APK Download button */}
          <a
            href="https://expo.dev/artifacts/eas/-8bzKs8Jb4CJv-Giyaad6Ba3WersR_ZjihO_Xrj0oj4.apk"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-semibold text-zinc-300 bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] transition"
          >
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>Tải App Android APK</span>
          </a>
        </div>
      </aside>
    </>
  );
}
