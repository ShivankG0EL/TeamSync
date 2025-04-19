'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaUsersCog, 
  FaArrowRight, 
  FaUserPlus, 
  FaUserShield,
  FaLayerGroup
} from 'react-icons/fa';
import { 
  MdDashboard, 
  MdGroups, 
  MdAdminPanelSettings
} from 'react-icons/md';
import { BiPlus } from 'react-icons/bi';

const AdminDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // useEffect(() => {
  //   // Protect this route - only for admins
  //   if (!isAuthenticated) {
  //     router.push('/auth/signin');
  //   } else if (user?.role !== 'admin') {
  //     router.push(`/${user.role}/dashboard`);
  //   }
  // }, [isAuthenticated, user, router]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      <div className="bg-[#f8f5f0] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-6 text-[#3a3a3a]"
          >
            Admin Dashboard
          </motion.h1>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="bg-[#faf6f0] p-6 rounded-lg shadow-md border border-[#e8e0d8]">
              <div className="flex items-center mb-4">
                <MdDashboard className="text-[#8b5cf6] text-xl mr-2" />
                <h2 className="text-xl font-semibold text-[#3a3a3a]">Organization Overview</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-[#f3f0e9] rounded-md">
                  <div className="flex items-center">
                    <MdGroups className="text-[#8b5cf6] mr-2" />
                    <span className="text-[#4b5563]">Total Teams</span>
                  </div>
                  <span className="font-bold text-[#3a3a3a] bg-[#e8e0d8] px-3 py-1 rounded-full">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#f3f0e9] rounded-md">
                  <div className="flex items-center">
                    <FaUsers className="text-[#8b5cf6] mr-2" />
                    <span className="text-[#4b5563]">Total Members</span>
                  </div>
                  <span className="font-bold text-[#3a3a3a] bg-[#e8e0d8] px-3 py-1 rounded-full">48</span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md flex items-center justify-center"
              >
                View Details <FaArrowRight className="ml-2" />
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#faf6f0] p-6 rounded-lg shadow-md border border-[#e8e0d8]">
              <div className="flex items-center mb-4">
                <FaUsersCog className="text-[#8b5cf6] text-xl mr-2" />
                <h2 className="text-xl font-semibold text-[#3a3a3a]">Team Management</h2>
              </div>
              <ul className="space-y-3">
                <motion.li whileHover={{ x: 5 }} className="hover:bg-[#f3f0e9] p-3 rounded-md">
                  <Link href="/admin/teams" className="flex items-center text-[#4b5563]">
                    <MdGroups className="mr-2 text-[#8b5cf6]" />
                    <span>View All Teams</span>
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="hover:bg-[#f3f0e9] p-3 rounded-md">
                  <Link href="/admin/teams/create" className="flex items-center text-[#4b5563]">
                    <BiPlus className="mr-2 text-[#8b5cf6]" />
                    <span>Create New Team</span>
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="hover:bg-[#f3f0e9] p-3 rounded-md">
                  <Link href="/admin/users" className="flex items-center text-[#4b5563]">
                    <FaUsers className="mr-2 text-[#8b5cf6]" />
                    <span>Manage Team Members</span>
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="hover:bg-[#f3f0e9] p-3 rounded-md">
                  <Link href="/admin/users?filter=leader" className="flex items-center text-[#4b5563]">
                    <FaUserShield className="mr-2 text-[#8b5cf6]" />
                    <span>Manage Team Leaders</span>
                  </Link>
                </motion.li>
              </ul>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/admin/teams" className="mt-4 flex items-center justify-center w-full py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md">
                  Team Dashboard <FaArrowRight className="ml-2" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#faf6f0] p-6 rounded-lg shadow-md border border-[#e8e0d8]">
              <div className="flex items-center mb-4">
                <MdAdminPanelSettings className="text-[#8b5cf6] text-xl mr-2" />
                <h2 className="text-xl font-semibold text-[#3a3a3a]">User Management</h2>
              </div>
              <ul className="space-y-3">
                <motion.li whileHover={{ x: 5 }} className="hover:bg-[#f3f0e9] p-3 rounded-md">
                  <Link href="/admin/users" className="flex items-center text-[#4b5563]">
                    <FaUsers className="mr-2 text-[#8b5cf6]" />
                    <span>View All Users</span>
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="hover:bg-[#f3f0e9] p-3 rounded-md">
                  <Link href="/admin/users/create" className="flex items-center text-[#4b5563]">
                    <FaUserPlus className="mr-2 text-[#8b5cf6]" />
                    <span>Add New User</span>
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="hover:bg-[#f3f0e9] p-3 rounded-md">
                  <Link href="/admin/users/roles" className="flex items-center text-[#4b5563]">
                    <FaUserShield className="mr-2 text-[#8b5cf6]" />
                    <span>Role Assignment</span>
                  </Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="hover:bg-[#f3f0e9] p-3 rounded-md">
                  <Link href="/admin/users/permissions" className="flex items-center text-[#4b5563]">
                    <FaUsersCog className="mr-2 text-[#8b5cf6]" />
                    <span>Manage Permissions</span>
                  </Link>
                </motion.li>
              </ul>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/admin/users" className="mt-4 flex items-center justify-center w-full py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md">
                  User Dashboard <FaArrowRight className="ml-2" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
