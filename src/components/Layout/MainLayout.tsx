import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NotificationCenter from '../Notifications/NotificationCenter';
import ChatWidget from '../Chat/ChatWidget';
import { clsx } from 'clsx'; // Import clsx for conditional classes

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New state for collapse

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => { // New function to toggle collapse
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false); // Ensure mobile sidebar is closed on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        isCollapsed={isSidebarCollapsed} // Pass state
        onCollapseToggle={toggleSidebarCollapse} // Pass toggle function
      />
      
      <div className={clsx(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64' // Apply margin based on sidebar state
      )}>
        <Navbar onSidebarToggle={toggleSidebar} />
        
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      <NotificationCenter />
      <ChatWidget />
    </div>
  );
};

export default MainLayout;