import { Loader2 } from 'lucide-react';

const Loading = ({ size = 'default', text = 'Loading...' }) => {
  // Size variants
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
};

// Loading with page container
export const PageLoading = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loading size="large" text="Loading content..." />
    </div>
  );
};

// Loading overlay (for forms, panels, etc.)
export const LoadingOverlay = ({ show = true }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
      <Loading />
    </div>
  );
};

export default Loading;