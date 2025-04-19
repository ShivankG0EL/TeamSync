'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const TeamsList = () => {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/teams');
      
      if (data.teams) {
        setTeams(data.teams);
      }
    } catch (err) {
      setError('Failed to fetch teams. Please try again.');
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

  if (loading) {
    return <div className="text-center py-6">Loading teams...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teams</h2>
        <Link href="/admin/teams/create" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Team
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {teams.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No teams found. Create your first team!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Team Name</th>
                <th className="py-3 px-6 text-left">Leader</th>
                <th className="py-3 px-6 text-left">Members</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {teams.map(team => (
                <tr key={team._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-gray-500">{team.description}</div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {team.leader ? (
                      <div>
                        <div>{team.leader.name}</div>
                        <div className="text-xs text-gray-500">{team.leader.email}</div>
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
                      <Link href={`/admin/teams/${team._id}`} className="w-6 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link href={`/admin/teams/edit/${team._id}`} className="w-6 mr-2 transform hover:text-yellow-500 hover:scale-110 cursor-pointer">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this team? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmation)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsList;
