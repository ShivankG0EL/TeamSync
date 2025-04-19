'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [changeRoleModal, setChangeRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  useEffect(() => {
    // Filter and search users
    let result = users;
    
    // Apply role filter
    if (filter !== 'all') {
      result = result.filter(user => user.userType === filter);
    }
    
    // Apply search filter
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
      setLoading(true);
      const { data } = await axios.get('/api/admin/users');
      
      if (data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await axios.get('/api/admin/teams');
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

  const openChangeRoleModal = (user) => {
    setChangeRoleModal(user);
    setSelectedRole(user.userType === 'member' ? 'leader' : user.userType === 'leader' ? 'member' : '');
    setSelectedTeam('');
  };

  const handleChangeRole = async () => {
    if (!changeRoleModal || !selectedRole) return;
    
    try {
      const response = await axios.put(`/api/admin/users/${changeRoleModal._id}/change-role`, {
        currentRole: changeRoleModal.userType,
        newRole: selectedRole,
        teamId: selectedTeam || undefined
      });
      
      if (response.data.success) {
        // Refresh user list
        fetchUsers();
        setChangeRoleModal(null);
      }
    } catch (err) {
      setError('Failed to change user role. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-6">Loading users...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <Link href="/admin/users/create" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New User
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <select 
            value={filter} 
            onChange={handleFilterChange}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="border rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredUsers.map(user => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">
                    <div className="font-medium">{user.name}</div>
                  </td>
                  <td className="py-3 px-6 text-left">{user.email}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.userType === 'admin' ? 'bg-red-100 text-red-800' :
                      user.userType === 'leader' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.userType === 'admin' ? 'Admin' :
                       user.userType === 'leader' ? 'Team Leader' :
                       'Team Member'}
                    </span>
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
                      <button 
                        onClick={() => openChangeRoleModal(user)}
                        className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded mr-2"
                        disabled={user.userType === 'admin'}
                      >
                        Change Role
                      </button>
                      <Link href={`/admin/users/${user._id}`} className="w-6 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Change Role Modal */}
      {changeRoleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Change User Role</h3>
            <p className="mb-4">
              Change role for <span className="font-semibold">{changeRoleModal.name}</span> ({changeRoleModal.email})
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Current Role
              </label>
              <input
                type="text"
                value={
                  changeRoleModal.userType === 'admin' ? 'Administrator' :
                  changeRoleModal.userType === 'leader' ? 'Team Leader' :
                  'Team Member'
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100"
                disabled
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                New Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select a role</option>
                {changeRoleModal.userType !== 'member' && (
                  <option value="member">Team Member</option>
                )}
                {changeRoleModal.userType !== 'leader' && (
                  <option value="leader">Team Leader</option>
                )}
                {changeRoleModal.userType !== 'admin' && (
                  <option value="admin">Administrator</option>
                )}
              </select>
            </div>
            
            {/* Show team selection only when changing to leader or member */}
            {(selectedRole === 'leader' || selectedRole === 'member') && (
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Assign to Team
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">None (Optional)</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setChangeRoleModal(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                disabled={!selectedRole}
                className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${
                  !selectedRole ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                Change Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
