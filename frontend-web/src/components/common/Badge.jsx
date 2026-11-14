export default function Badge({ status, text }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
      case 'INACTIVE':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20';
      case 'FOUND':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
      case 'NOT_FOUND':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20';
      case 'INVALID':
        return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/20';
    }
  };

  const getLabel = () => {
    if (text) return text;
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Tạm ngưng';
      case 'ARCHIVED':
        return 'Lưu trữ';
      case 'FOUND':
        return 'Tìm thấy';
      case 'NOT_FOUND':
        return 'Không tìm thấy';
      case 'INVALID':
        return 'Không hợp lệ';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle()}`}
    >
      {getLabel()}
    </span>
  );
}

