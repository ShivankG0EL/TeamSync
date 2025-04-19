'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import Signout from '../Auth/SignOut/Signout';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useSelector(state => state.auth);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and brand section */}
          <div className="flex items-center">
            <Link href={`/${user?.role || 'member'}/dashboard`} className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">TeamSync</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href={`/${user?.role || 'member'}/dashboard`}
              className={`py-2 text-gray-700 hover:text-blue-600 ${
                pathname.includes('/dashboard') ? 'font-semibold border-b-2 border-blue-500' : ''
              }`}>
              Dashboard
            </Link>
            <Link 
              href={`/${user?.role || 'member'}/projects`}
              className={`py-2 text-gray-700 hover:text-blue-600 ${
                pathname.includes('/projects') ? 'font-semibold border-b-2 border-blue-500' : ''
              }`}>
              Projects
            </Link>
            <Link 
              href={`/${user?.role || 'member'}/tasks`}
              className={`py-2 text-gray-700 hover:text-blue-600 ${
                pathname.includes('/tasks') ? 'font-semibold border-b-2 border-blue-500' : ''
              }`}>
              Tasks
            </Link>
            {user?.role === 'admin' && (
              <>
                <Link 
                  href="/admin/teams"
                  className={`py-2 text-gray-700 hover:text-blue-600 ${
                    pathname.includes('/teams') ? 'font-semibold border-b-2 border-blue-500' : ''
                  }`}>
                  Teams
                </Link>
                <Link 
                  href="/admin/users"
                  className={`py-2 text-gray-700 hover:text-blue-600 ${
                    pathname.includes('/users') ? 'font-semibold border-b-2 border-blue-500' : ''
                  }`}>
                  Users
                </Link>
              </>
            )}
            {user?.role === 'leader' && (
              <Link 
                href="/leader/team"
                className={`py-2 text-gray-700 hover:text-blue-600 ${
                  pathname.includes('/team') ? 'font-semibold border-b-2 border-blue-500' : ''
                }`}>
                Team
              </Link>
            )}
          </div>

          {/* User profile and mobile menu button */}
          <div className="flex items-center">
            {/* User profile dropdown */}
            <div className="relative ml-3">
              <button
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={toggleProfile}
              >
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              {/* Profile dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-semibold">{user?.name || 'User'}</p>
                    <p className="text-gray-500">{user?.email || 'user@example.com'}</p>
                    <p className="capitalize text-xs mt-1 text-blue-600">{user?.role || 'member'}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="block px-4 py-2 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                    <Signout className="text-sm text-red-600 hover:text-red-800 w-full text-left" />
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 ml-4 rounded-md text-gray-700 md:hidden focus:outline-none"
              onClick={toggleMenu}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t mt-2">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href={`/${user?.role || 'member'}/dashboard`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href={`/${user?.role || 'member'}/projects`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                href={`/${user?.role || 'member'}/tasks`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Tasks
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link
                    href="/admin/teams"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Teams
                  </Link>
                  <Link
                    href="/admin/users"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Users
                  </Link>
                </>
              )}
              {user?.role === 'leader' && (
                <Link
                  href="/leader/team"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Team
                </Link>
              )}
            </div>
            <div className="px-3 py-2 border-t mt-2">
              <Signout className="block w-full text-left text-base font-medium text-red-600 hover:text-red-800" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
