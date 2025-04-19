'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';

const TeamsList = ({ searchTerm = '' }) => {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch both teams and users data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch teams and users in parallel
      const [teamsResponse, usersResponse] = await Promise.all([
        axios.get('/api/admin/teams'),
        axios.get('/api/admin/users')
      ]);
      
      if (teamsResponse.data.teams) {
        setTeams(teamsResponse.data.teams);
      }
      
      if (usersResponse.data.users) {
        setUsers(usersResponse.data.users);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (teamId) => {
    setDeleteConfirmation(teamId);
  };

  const confirmDelete = async (teamId) => {
    try {
      const { data } = await axios.delete(`/api/admin/teams/${teamId}`);
      
      if (data.success) {
        // Remove the team from the list
        setTeams(teams.filter(team => team._id !== teamId));
      }
    } catch (err) {
      setError('Failed to delete team. Please try again.');
      console.error(err);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  // Helper function to find user by email
  const findUserByEmail = (email) => {
    return users.find(user => user.email === email);
  };

  // Filter teams based on search term
  const filteredTeams = teams.filter(team => {
    // Find leader user from the email
    const leaderUser = team.leader ? findUserByEmail(team.leader) : null;
    
    return team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leaderUser && leaderUser.name && leaderUser.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (team.leader && team.leader.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5cf6]"></div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-lg shadow-md p-6"
    >      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {filteredTeams.length === 0 ? (
        <div className="text-center py-8">
          {searchTerm ? (
            <p className="text-gray-500">No teams match your search. Try a different keyword.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500">No teams found.</p>
              <Link href="/admin/teams/create" 
                    className="inline-block bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-2 px-6 rounded">
                Create your first team
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-[#f3f0e9] text-[#4b5563] uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Team Name</th>
                <th className="py-3 px-6 text-left">Leader</th>
                <th className="py-3 px-6 text-left">Members</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[#4b5563] text-sm">
              {filteredTeams.map(team => {
                // Find the leader user from the email
                const leaderUser = team.leader ? findUserByEmail(team.leader) : null;
                
                return (
                  <motion.tr 
                    key={team._id} 
                    variants={itemVariants}
                    className="border-b border-[#e8e0d8] hover:bg-[#faf6f0]"
                  >
                    <td className="py-3 px-6 text-left">
                      <div className="font-medium">{team.name}</div>
                      <div className="text-xs text-gray-500">{team.description}</div>
                    </td>
                    <td className="py-3 px-6 text-left">
                      {team.leader ? (
                        <div>
                          <div>{leaderUser ? leaderUser.name : 'Loading...'}</div>
                          <div className="text-xs text-gray-500">{team.leader}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No leader assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <div>{team.members?.length || 0} members</div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <Link href={`/admin/teams/edit/${team._id}`} className="w-6 mr-2 transform hover:text-[#8b5cf6] hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <div className="w-6 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer"
                             onClick={() => handleDeleteClick(team._id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
          >
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this team? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirmation(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => confirmDelete(deleteConfirmation)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TeamsList;
