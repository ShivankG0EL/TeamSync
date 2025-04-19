'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave, FaUsers, FaBuilding, FaUser } from 'react-icons/fa';

const EditTeam = ({ teamId }) => {
  const router = useRouter();
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    leaderId: '',
    memberIds: []
  });
  const [originalTeam, setOriginalTeam] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [members, setMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedNewMember, setSelectedNewMember] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    // Fetch team data and users for selection
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch team details
        const teamResponse = await axios.get(`/api/admin/teams/${teamId}`);
        const team = teamResponse.data.team;
        setOriginalTeam(team);
        
        console.log("Fetched team data:", team);
        
        // Fetch users for leader and member selection
        const usersResponse = await axios.get('/api/admin/users');
        const users = usersResponse.data.users || [];
        
        // Filter users by role
        const leadersList = users.filter(user => user.userType === 'leader');
        const membersList = users.filter(user => user.userType === 'member');
        
        setLeaders(leadersList);
        setMembers(membersList);
        
        // Current team member IDs
        const currentMemberIds = team.members?.map(member => member._id) || [];
        
        // Set team data - handle cases where leader or members might be null
        setTeamData({
          name: team.name || '',
          description: team.description || '',
          leaderId: team.leader?._id || '', // Handle possible null leader
          memberIds: currentMemberIds
        });
        
        // Filter available members (those not already in the team)
        setAvailableMembers(membersList.filter(member => 
          !currentMemberIds.includes(member._id)
        ));
        
      } catch (err) {
        console.error("Error fetching team data:", err);
        setError('Failed to load team data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = () => {
    if (!selectedNewMember) return;
    
    // Add new member to memberIds
    setTeamData(prev => ({
      ...prev,
      memberIds: [...prev.memberIds, selectedNewMember]
    }));
    
    // Remove added member from available members
    setAvailableMembers(prev => 
      prev.filter(member => member._id !== selectedNewMember)
    );
    
    // Reset selection
    setSelectedNewMember('');
  };
  
  const handleRemoveMember = (memberId) => {
    console.log("Removing member:", memberId);
    
    // Find the member to be removed
    const memberToRemove = members.find(m => m._id === memberId);
    
    // Find the leader
    const leader = leaders.find(l => l._id === teamData.leaderId);
    
    // Check if this member is the team leader by comparing emails
    if (leader && memberToRemove && memberToRemove.email === leader.email) {
      setError("Cannot remove a member who is also the team leader.");
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Remove from memberIds
    setTeamData(prev => ({
      ...prev,
      memberIds: prev.memberIds.filter(id => id !== memberId)
    }));
    
    // Add back to available members if the member exists
    if (memberToRemove) {
      setAvailableMembers(prev => [...prev, memberToRemove]);
    }
  };
  
  const getMemberNameById = (memberId) => {
    const member = members.find(m => m._id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.put(`/api/admin/teams/${teamId}`, teamData);
      
      if (response.data.success) {
        setSuccess(true);
        
        // Redirect to teams list after a short delay
        setTimeout(() => {
          router.push('/admin/teams');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update team. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-[#f8f5f0] min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-6 h-40 bg-gray-100 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }
  console.log("Team data:", teamData);

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
          <h1 className="text-3xl font-bold text-[#3a3a3a]">Edit Team</h1>
          {originalTeam && (
            <p className="text-gray-600 mt-1">Updating: {originalTeam.name}</p>
          )}
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
            Team updated successfully! Redirecting...
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
            className="mb-6"
          >
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <FaUser className="mr-2 text-[#8b5cf6]" />
              Team Leader
            </label>
            <select
              name="leaderId"
              value={teamData.leaderId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#e8e0d8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            >
              <option value="">Select a Team Leader</option>
              {leaders.map(leader => (
                <option key={leader._id} value={leader._id}>
                  {leader.name} ({leader.email})
                </option>
              ))}
            </select>
          </motion.div>
          
          <motion.div 
            custom={3}
            variants={formItemVariants}
            className="mb-8"
          >
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <FaUsers className="mr-2 text-[#8b5cf6]" />
              Team Members
            </label>
            
            {/* Current Team Members List */}
            <div className="mb-4">
              <h4 className="text-sm text-gray-600 mb-2">Current Team Members:</h4>
              
              <div className="flex flex-wrap gap-2">
                {teamData.memberIds.length === 0 ? (
                  <p className="text-gray-500 italic">No members added yet</p>
                ) : (
                  teamData.memberIds.map((memberId) => {
                    const isLeader = memberId === teamData.leaderId;
                    return (
                      <motion.div
                        key={memberId}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, x: -20 }}
                        className={`flex items-center ${
                          isLeader 
                            ? "bg-[#ede4ff] border border-[#c7b2ff]" 
                            : "bg-[#f0e7f9] border border-[#d8c8f5]"
                        } rounded-full py-1 px-3`}
                      >
                        <FaUser className={`${isLeader ? "text-[#6d28d9]" : "text-[#8b5cf6]"} mr-2 text-sm`} />
                        <span className="text-gray-800">{getMemberNameById(memberId)}</span>
                        {isLeader && (
                          <span className="ml-1 text-xs bg-purple-700 text-white px-1.5 py-0.5 rounded-full">
                            Leader
                          </span>
                        )}
                        <motion.button
                          type="button"
                          onClick={() => handleRemoveMember(memberId)}
                          whileHover={{ scale: isLeader ? 1 : 1.2 }}
                          whileTap={{ scale: isLeader ? 1 : 0.9 }}
                          disabled={isLeader}
                          className={`ml-2 ${
                            isLeader 
                              ? "text-gray-400 cursor-not-allowed" 
                              : "text-gray-500 hover:text-red-600 focus:outline-none"
                          }`}
                          title={isLeader ? "Cannot remove team leader" : "Remove member"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Add New Member */}
            <div className="mt-4">
              <h4 className="text-sm text-gray-600 mb-2">Add Team Member:</h4>
              <div className="flex gap-2">
                <select
                  value={selectedNewMember}
                  onChange={(e) => setSelectedNewMember(e.target.value)}
                  className="flex-grow px-4 py-2 border border-[#e8e0d8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                  disabled={availableMembers.length === 0}
                >
                  <option value="">Select a member to add</option>
                  {availableMembers.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
                <motion.button
                  type="button"
                  onClick={handleAddMember}
                  disabled={!selectedNewMember || availableMembers.length === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    !selectedNewMember || availableMembers.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </motion.button>
              </div>
              
              {availableMembers.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  All available members have been added to the team
                </p>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            custom={4}
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
              disabled={submitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-md font-medium"
            >
              <FaSave className="mr-2" />
              {submitting ? 'Updating...' : 'Update Team'}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default EditTeam;
