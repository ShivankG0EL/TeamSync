'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const CreateUser = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'member',
    password: '',
    confirmPassword: '',
    teamId: ''
  });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Fetch teams for selection
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

    fetchTeams();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!userData.name || !userData.email || !userData.role) {
      setError('Name, email, and role are required.');
      return false;
    }
    
    if (userData.password && userData.password !== userData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        password: userData.password || undefined,
        teamId: userData.teamId || undefined
      };
      
      const response = await axios.post('/api/admin/users', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setUserData({
          name: '',
          email: '',
          role: 'member',
          password: '',
          confirmPassword: '',
          teamId: ''
        });
        
        // Redirect to users list after a short delay
        setTimeout(() => {
          router.push('/admin/users');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New User</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          User created successfully! Redirecting...
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name*
          </label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email*
          </label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Role*
          </label>
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="member">Team Member</option>
            <option value="leader">Team Leader</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        
        {(userData.role === 'member' || userData.role === 'leader') && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Assign to Team
            </label>
            <select
              name="teamId"
              value={userData.teamId}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select a Team (Optional)</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={userData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to let the user set their own password via email.
          </p>
        </div>
        
        {userData.password && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )}
        
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
