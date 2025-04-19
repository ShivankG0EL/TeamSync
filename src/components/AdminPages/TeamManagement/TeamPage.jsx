'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch } from 'react-icons/fa';
import TeamsList from './TeamsList';

const TeamPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-[#f8f5f0] min-h-screen p-6"
    >
      <motion.div 
        variants={headerVariants}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h1 className="text-3xl font-bold text-[#3a3a3a] mb-4 md:mb-0">
            Team Management
          </h1>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex items-center">
              <FaSearch className="absolute left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[#e8e0d8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] bg-white"
              />
            </div>
            
            {/* Create Team Button */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/admin/teams/create" 
                className="flex items-center justify-center bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-md font-medium">
                <FaPlus className="mr-2" /> Create Team
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Teams List with search filter */}
        <TeamsList searchTerm={searchTerm} />
      </motion.div>
    </motion.div>
  );
};

export default TeamPage;
