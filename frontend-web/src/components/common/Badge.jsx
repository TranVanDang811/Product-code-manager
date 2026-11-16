export default function Badge({ status, text }) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'ACTIVE':
      case 'FOUND':
        return {
          wrapper: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60',
          dot: 'bg-emerald-400',
        };
      case 'INACTIVE':
        return {
          wrapper: 'bg-amber-950/50 text-amber-300 border-amber-800/60',
          dot: 'bg-amber-400',
        };
      case 'ARCHIVED':
        return {
          wrapper: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
          dot: 'bg-zinc-400',
        };
      case 'NOT_FOUND':
        return {
          wrapper: 'bg-rose-950/50 text-rose-300 border-rose-800/60',
          dot: 'bg-rose-400',
        };
      case 'INVALID':
        return {
          wrapper: 'bg-amber-950/50 text-amber-300 border-amber-800/60',
          dot: 'bg-amber-400',
        };
      default:
        return {
          wrapper: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          dot: 'bg-zinc-400',
        };
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
        return 'Sai chuẩn';
      default:
        return status;
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.wrapper}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{getLabel()}</span>
    </span>
  );
}
