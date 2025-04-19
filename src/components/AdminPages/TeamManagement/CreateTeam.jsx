'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave, FaUsers, FaBuilding, FaUser } from 'react-icons/fa';

const CreateTeam = () => {
  const router = useRouter();
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    memberId: '',
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const formItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: custom * 0.1 }
    })
  };

  useEffect(() => {
    // Fetch members for selection
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/admin/users');
        
        if (data.users) {
          // Filter users who have a member role
          setMembers(data.users.filter(user => 
            user.roles && user.roles.some(role => role.type === 'member')
          ));
        }
      } catch (err) {
        setError('Failed to fetch users. Please try again.');
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // The API will use the member ID to look up their email and store that as the team leader
      const response = await axios.post('/api/admin/teams', teamData);
      
      if (response.data.success) {
        setSuccess(true);
        setTeamData({
          name: '',
          description: '',
          memberId: '',
        });
        
        // Redirect to teams list after a short delay
        setTimeout(() => {
          router.push('/admin/teams');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible" 
      className="bg-[#f8f5f0] min-h-screen p-6"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={headerVariants}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#8b5cf6] hover:text-[#7c3aed] mb-4 font-medium"
          >
            <FaArrowLeft className="mr-2" /> Back to Teams
          </button>
          <h1 className="text-3xl font-bold text-[#3a3a3a]">Create New Team</h1>
        </motion.div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6"
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6"
          >
            Team created successfully! Redirecting...
          </motion.div>
        )}
        
        <motion.form 
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <motion.div 
            custom={0}
            variants={formItemVariants}
            className="mb-6"
          >
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <FaBuilding className="mr-2 text-[#8b5cf6]" />
              Team Name*
            </label>
            <input
              type="text"
              name="name"
              value={teamData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#e8e0d8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
              required
              placeholder="Enter team name"
            />
          </motion.div>
          
          <motion.div 
            custom={1}
            variants={formItemVariants}
            className="mb-6"
          >
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <FaUsers className="mr-2 text-[#8b5cf6]" />
              Description
            </label>
            <textarea
              name="description"
              value={teamData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#e8e0d8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
              rows="3"
              placeholder="What is this team's purpose?"
            />
          </motion.div>
          
          <motion.div 
            custom={2}
            variants={formItemVariants}
            className="mb-8"
          >
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <FaUser className="mr-2 text-[#8b5cf6]" />
              Select Team Leader
            </label>
            <select
              name="memberId"
              value={teamData.memberId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#e8e0d8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
              required
            >
              <option value="">Select a Team Leader</option>
              {members.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                  {member.roles.some(role => role.type === 'leader') && " - Already a leader"}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              The selected member will be promoted to team leader.
              {members.some(m => m._id === teamData.memberId && 
                 m.roles.some(role => role.type === 'leader')) && 
                " Note: This user is already a leader for another team."}
            </p>
          </motion.div>
          
          <motion.div 
            custom={3}
            variants={formItemVariants}
            className="flex items-center justify-end"
          >
            <motion.button
              type="button"
              onClick={() => router.back()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium mr-3"
            >
              Cancel
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-md font-medium"
            >
              <FaSave className="mr-2" />
              {loading ? 'Creating...' : 'Create Team'}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default CreateTeam;
