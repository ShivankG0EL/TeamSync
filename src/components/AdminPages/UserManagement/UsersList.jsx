'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserShield, 
  FaUserTie, 
  FaUser, 
  FaPlus, 
  FaMinus, 
  FaTimes,
  FaSearch, 
  FaUserPlus 
} from 'react-icons/fa';

const UsersList = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editRoleModal, setEditRoleModal] = useState(null);
  const [roleToAdd, setRoleToAdd] = useState('');
  const [roleToRemove, setRoleToRemove] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    console.log("UsersList component mounted");
    fetchUsers();
    fetchTeams();
  }, []);

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  useEffect(() => {
    let result = users;

    if (filter !== 'all') {
      result = result.filter(user =>
        user.roles.some(role => role.type === filter)
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(result);
  }, [users, filter, searchTerm]);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      setLoading(true);
      const { data } = await axios.get('/api/admin/users');
      console.log("Users data received:", data);

      if (data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        setApiError('');
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setApiError(`Failed to fetch users: ${err.message}`);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      console.log("Fetching teams...");
      const { data } = await axios.get('/api/admin/teams');
      console.log("Teams data received:", data);

      if (data.teams) {
        setTeams(data.teams);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const openEditRoleModal = (user) => {
    setEditRoleModal(user);
    setRoleToAdd('');
    setRoleToRemove('');
    setSelectedTeam('');
  };

  const handleAddRole = async () => {
    if (!editRoleModal || !roleToAdd) return;

    try {
      const response = await axios.put(`/api/admin/users/${editRoleModal._id}/update-roles`, {
        action: 'add',
        role: roleToAdd,
        email: editRoleModal.email,
        teamId: selectedTeam || undefined
      });

      if (response.data.success) {
        fetchUsers();
        handleCloseModal(); // Close modal after successful operation
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add role. Please try again.');
      console.error(err);
    }
  };

  const handleRemoveRole = async () => {
    if (!editRoleModal || !roleToRemove) return;

    try {
      const response = await axios.put(`/api/admin/users/${editRoleModal._id}/update-roles`, {
        action: 'remove',
        role: roleToRemove,
        email: editRoleModal.email
      });

      if (response.data.success) {
        fetchUsers();
        handleCloseModal(); // Close modal after successful operation
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove role. Please try again.');
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setEditRoleModal(null);
    setRoleToAdd('');
    setRoleToRemove('');
    setSelectedTeam('');
  };

  const getRoleIcon = (roleType, size = 24) => {
    switch (roleType) {
      case 'admin':
        return <FaUserShield size={size} className="text-red-600" />;
      case 'leader':
        return <FaUserTie size={size} className="text-blue-600" />;
      case 'member':
        return <FaUser size={size} className="text-green-600" />;
      default:
        return null;
    }
  };

  const getRoleName = (roleType, adminRole) => {
    switch (roleType) {
      case 'admin':
        return adminRole === 'super-admin' ? 'Super Admin' : 'Administrator';
      case 'leader':
        return 'Team Leader';
      case 'member':
        return 'Team Member';
      default:
        return roleType;
    }
  };

  const getRoleColor = (roleType) => {
    switch (roleType) {
      case 'admin':
        return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-900' };
      case 'leader':
        return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' };
      case 'member':
        return { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' };
      default:
        return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-900' };
    }
  };

  const getUserRolesDisplay = (roles) => {
    return roles.map(role => {
      const { bg, text } = getRoleColor(role.type);
      
      return (
        <span
          key={role.type + role.id}
          className={`${bg} ${text} px-2 py-1 rounded-full text-xs mr-1 mb-1 inline-flex items-center`}
        >
          {getRoleIcon(role.type, 12)}
          <span className="ml-1">{getRoleName(role.type, role.adminRole)}</span>
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="bg-[#f8f5f0] rounded-lg shadow-md p-6">
        <div className="text-center py-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="inline-block h-8 w-8 border-4 border-t-[#8b5cf6] border-r-transparent border-b-[#8b5cf6] border-l-transparent rounded-full"
          />
          <p className="mt-2 text-[#3a3a3a]">Loading users...</p>
        </div>
        {apiError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4">
            <p className="font-bold">Debug Info:</p>
            <p>{apiError}</p>
            <p>Session Status: {status}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#f8f5f0] min-h-screen p-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#3a3a3a]">Users</h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/admin/users/create"
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-2 px-4 rounded flex items-center">
                <FaUserPlus className="mr-2" />
                Add New User
              </Link>
            </motion.div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {apiError && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Debug Info:</p>
              <p>{apiError}</p>
              <p>Session Status: {status}</p>
            </div>
          )}

          {status === 'unauthenticated' && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Warning:</p>
              <p>You are not authenticated. Sign in to access all features.</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <select
                value={filter}
                onChange={handleFilterChange}
                className="border border-[#e8e0d8] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] bg-white"
              >
                <option value="all">All Users</option>
                <option value="member">Members</option>
                <option value="leader">Leaders</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="border border-[#e8e0d8] rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] w-full md:w-64 bg-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50 text-[#3a3a3a] uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Roles</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {filteredUsers.map(user => (
                    <motion.tr 
                      key={user._id} 
                      className="border-b border-[#e8e0d8] hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                    >
                      <td className="py-3 px-6 text-left">
                        <div className="font-medium">{user.name}</div>
                      </td>
                      <td className="py-3 px-6 text-left">{user.email}</td>
                      <td className="py-3 px-6 text-left">
                        <div className="flex flex-wrap">
                          {getUserRolesDisplay(user.roles)}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center">
                          <motion.button 
                            whileHover={{ scale: 1.1 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditRoleModal(user)}
                            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold py-1 px-2 rounded"
                          >
                            Edit Roles
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AnimatePresence>
            {editRoleModal && (
              <div className="fixed inset-0 bg-gray-500/80 bg-opacity-50 flex items-center justify-center z-50">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Edit User Roles</h3>
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCloseModal}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <FaTimes size={20} />
                    </motion.button>
                  </div>
                  
                  <p className="mb-4">
                    Manage roles for <span className="font-semibold">{editRoleModal.name}</span> ({editRoleModal.email})
                  </p>

                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Current Roles
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex flex-wrap">
                        {editRoleModal.roles.map(role => {
                          const { bg, border, text } = getRoleColor(role.type);
                          return (
                            <div key={role.type + role.id} 
                                 className={`${bg} ${border} ${text} border rounded-md p-2 m-1 flex items-center`}>
                              {getRoleIcon(role.type)}
                              <span className="ml-2 font-medium">{getRoleName(role.type, role.adminRole)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 border-t pt-4">
                    <h4 className="font-bold mb-3 flex items-center">
                      <FaPlus size={14} className="text-green-600 mr-2" />
                      Add Role
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {!editRoleModal.roles.some(r => r.type === 'admin') && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`cursor-pointer border border-red-300 rounded-md p-3 ${
                            roleToAdd === 'admin' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-white hover:bg-red-50'
                          }`}
                          onClick={() => setRoleToAdd(roleToAdd === 'admin' ? '' : 'admin')}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <FaUserShield size={24} className="text-red-600 mb-2" />
                            <span className="text-sm font-medium text-red-900">Administrator</span>
                          </div>
                        </motion.div>
                      )}
                      
                      {!editRoleModal.roles.some(r => r.type === 'leader') && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`cursor-pointer border border-blue-300 rounded-md p-3 ${
                            roleToAdd === 'leader' ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white hover:bg-blue-50'
                          }`}
                          onClick={() => setRoleToAdd(roleToAdd === 'leader' ? '' : 'leader')}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <FaUserTie size={24} className="text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-blue-900">Team Leader</span>
                          </div>
                        </motion.div>
                      )}
                      
                      {!editRoleModal.roles.some(r => r.type === 'member') && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`cursor-pointer border border-green-300 rounded-md p-3 ${
                            roleToAdd === 'member' ? 'bg-green-100 ring-2 ring-green-500' : 'bg-white hover:bg-green-50'
                          }`}
                          onClick={() => setRoleToAdd(roleToAdd === 'member' ? '' : 'member')}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <FaUser size={24} className="text-green-600 mb-2" />
                            <span className="text-sm font-medium text-green-900">Team Member</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <AnimatePresence>
                      {(roleToAdd === 'leader' || roleToAdd === 'member') && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4"
                        >
                          <label className="block text-gray-700 text-sm font-medium mb-2">
                            Assign to Team
                          </label>
                          <select
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                          >
                            <option value="">None (Optional)</option>
                            {teams.map(team => (
                              <option key={team._id} value={team._id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-3 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddRole}
                        disabled={!roleToAdd}
                        className={`flex items-center py-2 px-4 rounded ${
                          !roleToAdd 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white'
                        }`}
                      >
                        <FaPlus className="mr-2" />
                        Add Role
                      </motion.button>
                    </div>
                  </div>

                  {editRoleModal.roles.length > 1 && (
                    <div className="mb-6 border-t pt-4">
                      <h4 className="font-bold mb-3 flex items-center">
                        <FaMinus size={14} className="text-red-600 mr-2" />
                        Remove Role
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {editRoleModal.roles.map(role => {
                          const { bg, border, text } = getRoleColor(role.type);
                          return (
                            <motion.div
                              key={role.type + role.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`cursor-pointer border ${border} rounded-md p-3 ${
                                roleToRemove === role.type ? `${bg} ring-2 ring-red-500` : 'bg-white hover:bg-gray-50'
                              }`}
                              onClick={() => setRoleToRemove(roleToRemove === role.type ? '' : role.type)}
                            >
                              <div className="flex flex-col items-center justify-center">
                                {getRoleIcon(role.type)}
                                <span className={`text-sm font-medium ${text} mt-2`}>
                                  {getRoleName(role.type, role.adminRole)}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleRemoveRole}
                          disabled={!roleToRemove}
                          className={`flex items-center py-2 px-4 rounded ${
                            !roleToRemove 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          <FaMinus className="mr-2" />
                          Remove Role
                        </motion.button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-6 border-t pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCloseModal}
                      className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-2 px-4 rounded"
                    >
                      Done
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UsersList;
