'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaTasks, FaChartLine, FaBullhorn, FaArrowRight } from 'react-icons/fa';
import { MdDesignServices, MdApi, MdGroups } from 'react-icons/md';
import { BiCalendarEvent, BiCodeAlt } from 'react-icons/bi';

const MemberDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Protect this route - for all authenticated users
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

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
            Member Dashboard
          </motion.h1>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="bg-[#faf6f0] p-6 rounded-lg shadow-md border border-[#e8e0d8]">
              <div className="flex items-center mb-4">
                <FaTasks className="text-[#8b5cf6] text-xl mr-2" />
                <h2 className="text-xl font-semibold text-[#3a3a3a]">My Tasks</h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-[#fff9eb] border-l-4 border-[#f59e0b] rounded">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <MdDesignServices className="text-[#f59e0b] mr-2" />
                      <h3 className="font-medium text-[#4b5563]">Design Homepage</h3>
                    </div>
                    <span className="text-xs bg-[#fef3c7] text-[#92400e] px-2 py-1 rounded-full">In Progress</span>
                  </div>
                  <p className="text-sm text-[#6b7280] mt-1">Due: Tomorrow</p>
                </div>
                <div className="p-3 bg-[#fef2f2] border-l-4 border-[#ef4444] rounded">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <MdApi className="text-[#ef4444] mr-2" />
                      <h3 className="font-medium text-[#4b5563]">API Documentation</h3>
                    </div>
                    <span className="text-xs bg-[#fee2e2] text-[#b91c1c] px-2 py-1 rounded-full">Urgent</span>
                  </div>
                  <p className="text-sm text-[#6b7280] mt-1">Due: Today</p>
                </div>
                <div className="p-3 bg-[#eff6ff] border-l-4 border-[#3b82f6] rounded">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <MdGroups className="text-[#3b82f6] mr-2" />
                      <h3 className="font-medium text-[#4b5563]">Team Meeting</h3>
                    </div>
                    <span className="text-xs bg-[#dbeafe] text-[#1e40af] px-2 py-1 rounded-full">Upcoming</span>
                  </div>
                  <p className="text-sm text-[#6b7280] mt-1">In 2 days</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md flex items-center justify-center"
              >
                View All Tasks <FaArrowRight className="ml-2" />
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#faf6f0] p-6 rounded-lg shadow-md border border-[#e8e0d8]">
              <div className="flex items-center mb-4">
                <FaChartLine className="text-[#8b5cf6] text-xl mr-2" />
                <h2 className="text-xl font-semibold text-[#3a3a3a]">My Progress</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#4b5563]">Weekly Tasks Completion</span>
                    <span className="text-[#4b5563] font-medium">70%</span>
                  </div>
                  <div className="w-full bg-[#e8e0d8] rounded-full h-2.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '70%' }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-[#10b981] h-2.5 rounded-full"
                    ></motion.div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#4b5563]">Current Project Contribution</span>
                    <span className="text-[#4b5563] font-medium">85%</span>
                  </div>
                  <div className="w-full bg-[#e8e0d8] rounded-full h-2.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-[#8b5cf6] h-2.5 rounded-full"
                    ></motion.div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#4b5563]">Meeting Attendance</span>
                    <span className="text-[#4b5563] font-medium">100%</span>
                  </div>
                  <div className="w-full bg-[#e8e0d8] rounded-full h-2.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-[#10b981] h-2.5 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md flex items-center justify-center"
              >
                Full Progress Report <FaArrowRight className="ml-2" />
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#faf6f0] p-6 rounded-lg shadow-md border border-[#e8e0d8]">
              <div className="flex items-center mb-4">
                <FaBullhorn className="text-[#8b5cf6] text-xl mr-2" />
                <h2 className="text-xl font-semibold text-[#3a3a3a]">Team Updates</h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 border-b border-[#e8e0d8]">
                  <div className="flex items-center">
                    <BiCodeAlt className="text-[#8b5cf6] mr-2" />
                    <p className="font-medium text-[#4b5563]">New Project Kickoff</p>
                  </div>
                  <p className="text-sm text-[#6b7280]">The mobile app project is starting next Monday. Please review requirements.</p>
                  <p className="text-xs text-[#9ca3af] mt-1">Posted 2 hours ago</p>
                </div>
                <div className="p-3 border-b border-[#e8e0d8]">
                  <div className="flex items-center">
                    <MdGroups className="text-[#8b5cf6] mr-2" />
                    <p className="font-medium text-[#4b5563]">Team Building Event</p>
                  </div>
                  <p className="text-sm text-[#6b7280]">Don't forget about the team building event this Friday at 4 PM.</p>
                  <p className="text-xs text-[#9ca3af] mt-1">Posted 1 day ago</p>
                </div>
                <div className="p-3">
                  <div className="flex items-center">
                    <BiCalendarEvent className="text-[#8b5cf6] mr-2" />
                    <p className="font-medium text-[#4b5563]">New Tool Training</p>
                  </div>
                  <p className="text-sm text-[#6b7280]">Training session for the new design tool this Wednesday.</p>
                  <p className="text-xs text-[#9ca3af] mt-1">Posted 2 days ago</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md flex items-center justify-center"
              >
                All Updates <FaArrowRight className="ml-2" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default MemberDashboard;
