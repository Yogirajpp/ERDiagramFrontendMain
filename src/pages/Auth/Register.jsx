import { Link } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="py-4 px-6 shadow-sm bg-white dark:bg-gray-900">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">
            ER Diagram Builder
          </Link>
          <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create an account</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Start building ER diagrams with our intuitive tools
            </p>
          </div>
          
          <RegisterForm />
          
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-sm text-gray-500 bg-white dark:bg-gray-900 dark:text-gray-400">
        <p>© {new Date().getFullYear()} ER Diagram Builder. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Register;