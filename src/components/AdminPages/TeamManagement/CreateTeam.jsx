'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const CreateTeam = () => {
  const router = useRouter();
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    leaderId: '',
    memberIds: []
  });
  const [leaders, setLeaders] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch leaders and members for selection
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/admin/users');
        
        if (data.users) {
          setLeaders(data.users.filter(user => user.userType === 'leader'));
          setMembers(data.users.filter(user => user.userType === 'member'));
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

  const handleMemberSelection = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setTeamData(prev => ({ ...prev, memberIds: selectedValues }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('/api/admin/teams', teamData);
      
      if (response.data.success) {
        setSuccess(true);
        setTeamData({
          name: '',
          description: '',
          leaderId: '',
          memberIds: []
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Team</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Team created successfully! Redirecting...
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Team Name*
          </label>
          <input
            type="text"
            name="name"
            value={teamData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={teamData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Team Leader
          </label>
          <select
            name="leaderId"
            value={teamData.leaderId}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a Team Leader</option>
            {leaders.map(leader => (
              <option key={leader._id} value={leader._id}>
                {leader.name} ({leader.email})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Team Members (Hold Ctrl/Cmd to select multiple)
          </label>
          <select
            multiple
            name="memberIds"
            value={teamData.memberIds}
            onChange={handleMemberSelection}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            size="5"
          >
            {members.map(member => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>
        
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
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeam;
