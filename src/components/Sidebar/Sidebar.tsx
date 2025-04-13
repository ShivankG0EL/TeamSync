'use client';
import { FiUsers, FiActivity, FiCalendar, FiChevronLeft, FiMoon, FiSun, FiSettings, FiUserCheck, FiShield, FiLogOut } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { useTheme } from '@/context/ThemeContext';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useTheme();
  const { isAdmin, isManager } = useRole();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <aside className={`transition-all duration-300 ${isCollapsed ? 'w-0 overflow-hidden' : 'w-64'} h-screen ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} shadow-md flex-col hidden md:flex`}>
      <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b flex justify-between items-center`}>
        <h2 className="text-xl font-semibold">TeamSync</h2>
        <button 
          onClick={toggleSidebar}
          className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <FiChevronLeft />
        </button>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a 
              href="/user" 
              className={`flex items-center p-2 rounded ${
                pathname === '/user' 
                  ? darkMode 
                    ? 'bg-gray-700 text-blue-400' 
                    : 'bg-gray-100 text-blue-600'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiActivity className="mr-3" /> Dashboard
            </a>
          </li>
          <li>
            <a 
              href="/user/calendar" 
              className={`flex items-center p-2 rounded ${
                pathname === '/user/calendar' 
                  ? darkMode 
                    ? 'bg-gray-700 text-blue-400' 
                    : 'bg-gray-100 text-blue-600'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiCalendar className="mr-3" /> Calendar
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={`flex items-center p-2 rounded ${
                darkMode
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUsers className="mr-3" /> Team
            </a>
          </li>
          
          {/* Manager-specific menu items */}
          {isManager && (
            <>
              <li className="pt-4">
                <div className={`text-xs uppercase font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Management
                </div>
                <a 
                  href="/manager/teams" 
                  className={`flex items-center p-2 rounded ${
                    pathname.startsWith('/manager/teams') 
                      ? darkMode 
                        ? 'bg-gray-700 text-blue-400' 
                        : 'bg-gray-100 text-blue-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiUserCheck className="mr-3" /> Team Management
                </a>
              </li>
            </>
          )}
          
          {/* Admin-specific menu items */}
          {isAdmin && (
            <>
              <li className="pt-4">
                <div className={`text-xs uppercase font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Administration
                </div>
                <a 
                  href="/admin" 
                  className={`flex items-center p-2 rounded ${
                    pathname === '/admin' 
                      ? darkMode 
                        ? 'bg-gray-700 text-blue-400' 
                        : 'bg-gray-100 text-blue-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiShield className="mr-3" /> Admin Panel
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Theme toggle and logout at bottom of sidebar */}
      <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t space-y-2`}>
        <button
          onClick={toggleDarkMode}
          className={`flex items-center p-2 w-full rounded ${
            darkMode 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {darkMode ? (
            <>
              <FiSun size={20} className="mr-3" /> Light Mode
            </>
          ) : (
            <>
              <FiMoon size={20} className="mr-3" /> Dark Mode
            </>
          )}
        </button>
        
        <button
          onClick={handleLogout}
          className={`flex items-center p-2 w-full rounded ${
            darkMode 
              ? 'bg-red-700 text-gray-200 hover:bg-red-600' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          <FiLogOut size={20} className="mr-3" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;