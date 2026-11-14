export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-3',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-slate-200 border-t-brand-600 rounded-full animate-spin`}
      />
    </div>
  );
}

