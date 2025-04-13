'use client';
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { FiEdit2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  image?: string;
};

const UserManagement = () => {
  const { darkMode } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('user');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        setError('Failed to load users. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, email: string) => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: selectedRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: selectedRole } : user
      ));
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update user role.');
    }
  };

  const startEditing = (userId: string, currentRole: string) => {
    setEditingUser(userId);
    setSelectedRole(currentRole);
  };

  if (loading) return <div className="text-center p-4">Loading user data...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {users.map(user => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.image && (
                      <img 
                        src={user.image} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user._id ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className={`rounded p-1 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : user.role === 'manager'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingUser === user._id ? (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleRoleChange(user._id, user.email)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <FiCheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingUser(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiXCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => startEditing(user._id, user.role)}
                      className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                      <FiEdit2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
