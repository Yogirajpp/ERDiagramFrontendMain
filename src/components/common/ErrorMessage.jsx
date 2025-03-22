import { AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ErrorMessage = ({ 
  title = 'Error',
  message = 'An unexpected error occurred. Please try again.',
  variant = 'default',
  onRetry,
  onDismiss
}) => {
  // Variants
  const variants = {
    default: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400',
    info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  };

  // Icon based on variant
  const IconComponent = variant === 'warning' ? AlertCircle : XCircle;

  return (
    <div className={`rounded-md border p-4 ${variants[variant]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-1 text-sm">
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              message
            )}
          </div>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-2">
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900"
                >
                  Try again
                </Button>
              )}
              {onDismiss && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDismiss}
                  className="text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;