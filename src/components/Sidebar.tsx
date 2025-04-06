'use client';
import { FiUsers, FiActivity, FiCalendar, FiChevronLeft, FiMoon, FiSun } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar, darkMode = false, toggleDarkMode }: SidebarProps) => {
  const pathname = usePathname();

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
          {pathname === '/user' && (
            <li>
              <a 
                href="/user/calendar" 
                className={`flex items-center p-2 rounded ${
                  darkMode
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiCalendar className="mr-3" /> Calendar
              </a>
            </li>
          )}
          {pathname === '/user/calendar' && (
            <li>
              <a 
                href="/user/calendar" 
                className={`flex items-center p-2 rounded ${
                  darkMode 
                    ? 'bg-gray-700 text-blue-400' 
                    : 'bg-gray-100 text-blue-600'
                }`}
              >
                <FiCalendar className="mr-3" /> Calendar
              </a>
            </li>
          )}
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
        </ul>
      </nav>

      {/* Theme toggle at bottom of sidebar */}
      {toggleDarkMode && (
        <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
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
        </div>
      )}
    </aside>
  );
};

export default Sidebar;