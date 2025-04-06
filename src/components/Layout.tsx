'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { FiMenu } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"}`}>
      <div className="flex">
        {/* Sidebar with theme toggle */}
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleSidebar={toggleSidebar} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        {/* Main Content */}
        <main className="flex-1">
          {/* Toggle button for collapsed sidebar */}
          {isCollapsed && (
            <button 
              onClick={toggleSidebar}
              className={`fixed top-4 left-4 z-10 p-2 rounded-md ${
                darkMode ? "bg-gray-800 shadow-gray-900" : "bg-white"
              } shadow-md ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              aria-label="Toggle Sidebar"
            >
              <FiMenu size={20} />
            </button>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;