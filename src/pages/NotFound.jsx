import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center">
        <div className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/30 p-6 mb-6">
          <FileQuestion className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-9xl font-bold text-gray-900 dark:text-white">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-md mx-auto">
          We couldn't find the page you're looking for. The page might have been moved or doesn't exist.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to={isAuthenticated ? "/dashboard" : "/"}>
            <Button size="lg">
              {isAuthenticated ? "Go to Dashboard" : "Go to Homepage"}
            </Button>
          </Link>
          <Button variant="outline" size="lg" asChild>
            <a href="mailto:support@erdiagrambuilder.com">Contact Support</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;