"use client";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUsers, FaUserTie, FaEnvelope, FaIdBadge, FaCalendarAlt } from 'react-icons/fa';

const LeaderTeamPage = () => {
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTeam, setActiveTeam] = useState(null);
  
  // Get user email from Redux store
  const userEmail = useSelector(state => state.auth.user?.email);
  const userName = useSelector(state => state.auth.user?.name);
  
  useEffect(() => {
    const fetchTeams = async () => {
      if (!userEmail) return;
      
      try {
        setLoading(true);
        
        // Fetch teams with members
        const teamsResponse = await fetch(`/api/leader/team?email=${userEmail}`);
        if (!teamsResponse.ok) {
          throw new Error('Failed to fetch team data');
        }
        
        const teamsData = await teamsResponse.json();
        setTeamsData(teamsData.teams || []);
        
        // Set the first team as active by default if there are teams
        if (teamsData.teams && teamsData.teams.length > 0) {
          setActiveTeam(teamsData.teams[0]._id);
        }
        
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [userEmail]);
  
  if (loading) return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-600">Loading team information...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    </div>
  );
  
  if (teamsData.length === 0) return (
    <div className="p-6 max-w-6xl mx-auto text-center">
      <div className="bg-white shadow-md rounded-lg p-8">
        <FaUsers className="text-6xl text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Teams Found</h2>
        <p className="text-gray-600 mb-6">You are not currently managing any teams.</p>
        <p className="text-gray-500">Contact an administrator to create a team or assign you as a leader.</p>
      </div>
    </div>
  );
  
  // Find the currently active team
  const currentTeam = teamsData.find(team => team._id === activeTeam) || teamsData[0];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Team Management</h1>
      
      {/* Team Selector Tabs */}
      {teamsData.length > 1 && (
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px">
            {teamsData.map(team => (
              <li className="mr-2" key={team._id}>
                <button
                  onClick={() => setActiveTeam(team._id)}
                  className={`inline-block p-4 rounded-t-lg ${
                    team._id === activeTeam
                      ? 'text-purple-600 border-b-2 border-purple-600 active'
                      : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'
                  }`}
                >
                  {team.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Team Details */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold">{currentTeam.name}</h2>
              <p className="mt-1 opacity-90">Led by {userName}</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {currentTeam.members?.length || 0} Team Member{currentTeam.members?.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {currentTeam.description && (
            <p className="mt-4 text-white/80">{currentTeam.description}</p>
          )}
        </div>
        
        {/* Team Members */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaUserTie className="mr-2 text-purple-600" /> Team Members
          </h3>
          
          {currentTeam.members && currentTeam.members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTeam.members.map(member => (
                <div key={member._id} className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl mr-3">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role || 'Team Member'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaEnvelope className="mr-2 text-purple-600" />
                      {member.email}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaIdBadge className="mr-2 text-purple-600" />
                      Status: <span className={`ml-1 ${
                        member.status === 'active' ? 'text-green-600' : 
                        member.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {member.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">No members in this team yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderTeamPage;
