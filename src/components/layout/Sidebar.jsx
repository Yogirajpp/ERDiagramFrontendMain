import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  FileCode,
  Users,
  Settings,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarLinks = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      title: 'Projects',
      icon: <FolderKanban className="w-5 h-5" />,
      href: '/projects',
      active: location.pathname.includes('/projects')
    },
    {
      title: 'Diagrams',
      icon: <FileCode className="w-5 h-5" />,
      href: '/diagrams',
      active: location.pathname.includes('/diagrams')
    }
  ];

  // Admin-only links
  if (user?.role === 'admin') {
    sidebarLinks.push({
      title: 'Users',
      icon: <Users className="w-5 h-5" />,
      href: '/users',
      active: location.pathname.includes('/users')
    });
  }

  // Bottom links
  const bottomLinks = [
    {
      title: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
      active: location.pathname.includes('/settings')
    },
    {
      title: 'Help',
      icon: <HelpCircle className="w-5 h-5" />,
      href: '/help',
      active: location.pathname.includes('/help')
    }
  ];

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo and toggle */}
      <div className={cn(
        'flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-primary">ER Builder</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={collapsed ? "mx-auto" : ""}
        >
          {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </Button>
      </div>

      {/* Main navigation links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {sidebarLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                  link.active
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
                  collapsed && 'justify-center px-0'
                )}
              >
                {link.icon}
                {!collapsed && <span className="ml-3">{link.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom links */}
      <div className="px-2 py-4">
        <Separator className="my-2" />
        <ul className="space-y-1">
          {bottomLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                  link.active
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
                  collapsed && 'justify-center px-0'
                )}
              >
                {link.icon}
                {!collapsed && <span className="ml-3">{link.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User profile */}
      {!collapsed && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;