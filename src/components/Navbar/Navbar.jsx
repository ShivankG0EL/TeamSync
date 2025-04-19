'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaTachometerAlt, 
  FaProjectDiagram, 
  FaTasks, 
  FaUsers, 
  FaUserCog, 
  FaUserCircle, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes
} from 'react-icons/fa';
import Signout from '../Auth/SignOut/Signout';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useSelector(state => state.auth);
  const pathname = usePathname();
  
  // Don't show navbar on auth pages
  if (pathname.includes('/auth')) {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Animation variants
  const navItemVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  const mobileMenuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <nav className="bg-[#faf6f0] shadow-md border-b border-[#e8e0d8] py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and brand section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link href={`/${user?.role || 'member'}/dashboard`} className="flex items-center">
              <span className="text-2xl font-bold text-[#8b5cf6]">TeamSync</span>
            </Link>
          </motion.div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.div variants={navItemVariants} whileHover="hover">
              <Link 
                href={`/${user?.role || 'member'}/dashboard`}
                className={`py-2 flex items-center text-[#4b5563] hover:text-[#8b5cf6] ${
                  pathname.includes('/dashboard') ? 'font-semibold border-b-2 border-[#8b5cf6] text-[#8b5cf6]' : ''
                }`}
              >
                <FaTachometerAlt className="mr-2" /> Dashboard
              </Link>
            </motion.div>
            
            {user?.role === 'admin' && (
              <>
                <motion.div variants={navItemVariants} whileHover="hover">
                  <Link 
                    href="/admin/teams"
                    className={`py-2 flex items-center text-[#4b5563] hover:text-[#8b5cf6] ${
                      pathname.includes('/teams') ? 'font-semibold border-b-2 border-[#8b5cf6] text-[#8b5cf6]' : ''
                    }`}
                  >
                    <FaUsers className="mr-2" /> Teams
                  </Link>
                </motion.div>
                <motion.div variants={navItemVariants} whileHover="hover">
                  <Link 
                    href="/admin/users"
                    className={`py-2 flex items-center text-[#4b5563] hover:text-[#8b5cf6] ${
                      pathname.includes('/users') ? 'font-semibold border-b-2 border-[#8b5cf6] text-[#8b5cf6]' : ''
                    }`}
                  >
                    <FaUserCog className="mr-2" /> Users
                  </Link>
                </motion.div>
              </>
            )}
            
            {user?.role === 'member' && (
              <>
                <motion.div variants={navItemVariants} whileHover="hover">
                  <Link 
                    href="/member/teams"
                    className={`py-2 flex items-center text-[#4b5563] hover:text-[#8b5cf6] ${
                      pathname.includes('/teams') ? 'font-semibold border-b-2 border-[#8b5cf6] text-[#8b5cf6]' : ''
                    }`}
                  >
                    <FaUsers className="mr-2" /> Teams
                  </Link>
                </motion.div>
                <motion.div variants={navItemVariants} whileHover="hover">
                  <Link 
                    href="/member/tasks"
                    className={`py-2 flex items-center text-[#4b5563] hover:text-[#8b5cf6] ${
                      pathname.includes('/tasks') ? 'font-semibold border-b-2 border-[#8b5cf6] text-[#8b5cf6]' : ''
                    }`}
                  >
                    <FaTasks className="mr-2" /> Tasks
                  </Link>
                </motion.div>
              </>
            )}
            
            {user?.role === 'leader' && (
              <motion.div variants={navItemVariants} whileHover="hover">
                <Link 
                  href="/leader/team"
                  className={`py-2 flex items-center text-[#4b5563] hover:text-[#8b5cf6] ${
                    pathname.includes('/team') ? 'font-semibold border-b-2 border-[#8b5cf6] text-[#8b5cf6]' : ''
                  }`}
                >
                  <FaUsers className="mr-2" /> Team
                </Link>
              </motion.div>
            )}
          </div>

          {/* User profile and mobile menu button */}
          <div className="flex items-center">
            {/* User profile dropdown */}
            <div className="relative ml-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                onClick={toggleProfile}
              >
                <div className="h-10 w-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </motion.button>

              {/* Profile dropdown */}
              {isProfileOpen && (
                <motion.div 
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-[#faf6f0] py-1 shadow-lg ring-1 ring-black ring-opacity-5 border border-[#e8e0d8]"
                >
                  <div className="px-4 py-2 text-sm text-[#4b5563] border-b border-[#e8e0d8]">
                    <p className="font-semibold">{user?.name || 'User'}</p>
                    <p className="text-[#6b7280]">{user?.email || 'user@example.com'}</p>
                    <p className="capitalize text-xs mt-1 text-[#8b5cf6]">{user?.role || 'member'}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-[#4b5563] hover:bg-[#f0e9e0] flex items-center"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FaUserCircle className="mr-2 text-[#8b5cf6]" /> Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-[#4b5563] hover:bg-[#f0e9e0] flex items-center"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FaCog className="mr-2 text-[#8b5cf6]" /> Settings
                  </Link>
                  <div className="block px-4 py-2 hover:bg-[#f0e9e0] flex items-center" onClick={() => setIsProfileOpen(false)}>
                    <FaSignOutAlt className="mr-2 text-[#ef4444]" />
                    <Signout className="text-sm text-[#ef4444] hover:text-[#b91c1c] w-full text-left" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="inline-flex items-center justify-center p-2 ml-4 rounded-md text-[#4b5563] md:hidden focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div 
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            className="md:hidden bg-[#faf6f0] border-t mt-2 border-[#e8e0d8]"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href={`/${user?.role || 'member'}/dashboard`}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#4b5563] hover:bg-[#f0e9e0] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaTachometerAlt className="mr-2 text-[#8b5cf6]" /> Dashboard
              </Link>
              
              {user?.role === 'admin' && (
                <>
                  <Link
                    href="/admin/teams"
                    className="block px-3 py-2 rounded-md text-base font-medium text-[#4b5563] hover:bg-[#f0e9e0] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUsers className="mr-2 text-[#8b5cf6]" /> Teams
                  </Link>
                  <Link
                    href="/admin/users"
                    className="block px-3 py-2 rounded-md text-base font-medium text-[#4b5563] hover:bg-[#f0e9e0] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUserCog className="mr-2 text-[#8b5cf6]" /> Users
                  </Link>
                </>
              )}
              
              {user?.role === 'member' && (
                <>
                  <Link
                    href="/member/teams"
                    className="block px-3 py-2 rounded-md text-base font-medium text-[#4b5563] hover:bg-[#f0e9e0] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUsers className="mr-2 text-[#8b5cf6]" /> Teams
                  </Link>
                  <Link
                    href="/member/tasks"
                    className="block px-3 py-2 rounded-md text-base font-medium text-[#4b5563] hover:bg-[#f0e9e0] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaTasks className="mr-2 text-[#8b5cf6]" /> Tasks
                  </Link>
                </>
              )}
              
              {user?.role === 'leader' && (
                <Link
                  href="/leader/team"
                  className="block px-3 py-2 rounded-md text-base font-medium text-[#4b5563] hover:bg-[#f0e9e0] flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUsers className="mr-2 text-[#8b5cf6]" /> Team
                </Link>
              )}
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-[#4b5563] hover:bg-[#f0e9e0] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUserCircle className="mr-2 text-[#8b5cf6]" /> Your Profile
              </Link>
            </div>
            <div className="px-3 py-2 border-t mt-2 border-[#e8e0d8]">
              <div className="flex items-center">
                <FaSignOutAlt className="mr-2 text-[#ef4444]" />
                <Signout className="block w-full text-left text-base font-medium text-[#ef4444] hover:text-[#b91c1c]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
