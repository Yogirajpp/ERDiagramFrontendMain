import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Database, Code, Share2, ShieldCheck } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">ER Diagram Builder</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Sign In
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-10">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Design Databases with Powerful ER Diagrams
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                Create, visualize, and generate MongoDB schemas from entity-relationship diagrams. Collaborate with your team in real-time.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create Free Account
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 mt-10 lg:mt-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                <img
                  src="/er-diagram-preview.png"
                  alt="ER Diagram Preview"
                  className="w-full rounded-md"
                  // Fallback if image not available
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="hidden h-64 w-full rounded-md bg-gray-100 dark:bg-gray-700 items-center justify-center text-gray-400 dark:text-gray-500"
                >
                  ER Diagram Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Key Features</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Everything you need to design and document your database structures
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-600">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 inline-flex">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Visual ER Diagrams</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Create entity-relationship diagrams with an intuitive drag-and-drop interface.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-600">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 inline-flex">
                <Code className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">MongoDB Schema Generation</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Automatically generate MongoDB schemas from your ER diagrams.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-600">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 inline-flex">
                <Share2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Team Collaboration</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Collaborate with your team in real-time on database design projects.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-600">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-3 inline-flex">
                <ShieldCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Version Control</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Track changes and maintain version history of your database schemas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-50 dark:bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ready to Start Designing Your Database?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Join thousands of developers and database designers who use our platform.
          </p>
          <div className="mt-10">
            <Link to="/register">
              <Button size="lg">
                Get Started for Free
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#features" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Pricing</a></li>
                <li><a href="#testimonials" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#docs" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Documentation</a></li>
                <li><a href="#guides" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Guides</a></li>
                <li><a href="#faq" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#about" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">About</a></li>
                <li><a href="#blog" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#careers" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#privacy" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
                <li><a href="#terms" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Terms</a></li>
                <li><a href="#cookies" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-base text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} ER Diagram Builder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;