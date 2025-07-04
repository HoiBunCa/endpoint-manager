import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Monitor, 
  Users, 
  Shield, 
  Building, 
  UserCog, 
  BarChart3,
  X,
  ChevronLeft, // New icon for collapse
  ChevronRight // New icon for expand
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean; // New prop
  onCollapseToggle: () => void; // New prop
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isCollapsed, onCollapseToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/devices', icon: Monitor, label: 'Devices' },
    { path: '/blocking-policy', icon: Shield, label: 'Blocking Policy' },
    { path: '/departments', icon: Building, label: 'Departments' },
    { path: '/user-management', icon: UserCog, label: 'User Management' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        'h-full bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
        // Mobile styles (default)
        'fixed inset-y-0 left-0 z-50',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop overrides - re-added lg:translate-x-0
        'lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200'
      )}>
        {/* Header */}
        <div className={clsx(
          "flex items-center p-6 border-b border-gray-200",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className={clsx(
            "flex items-center space-x-3",
            isCollapsed && "justify-center w-full"
          )}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <h1 className={clsx(
              "text-xl font-bold text-gray-900 transition-opacity duration-300",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}>
              Endpoint Manager
            </h1>
          </div>
          <button 
            onClick={onToggle}
            className={clsx(
              "p-2 rounded-lg hover:bg-gray-100 lg:hidden",
              isCollapsed && "hidden"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 flex-1 overflow-y-auto min-h-0"> {/* Added min-h-0 */}
          <ul className="pt-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={clsx(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                      isCollapsed ? "justify-center space-x-0" : ""
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className={clsx(
                      "transition-opacity duration-300",
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer and Collapse Button */}
        <div className="p-4 border-t border-gray-200 mt-auto flex items-center justify-between">
          <div className={clsx(
            "text-xs text-gray-500 transition-opacity duration-300",
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            © 2024 Endpoint Manager
          </div>
          <button
            onClick={onCollapseToggle}
            className={clsx(
              "p-2 rounded-lg hover:bg-gray-100 transition-colors",
              isCollapsed ? "w-full justify-center flex" : ""
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;