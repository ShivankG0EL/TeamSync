"use client";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaIdBadge, FaCalendarAlt, FaBuilding, FaUserCircle, FaUsers } from 'react-icons/fa';

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.email || !user?.role) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile data based on role
        const profileResponse = await fetch(`/api/${user.role}/profile?email=${user.email}`);
        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch ${user.role} profile data`);
        }
        
        const profileData = await profileResponse.json();
        setProfileData(profileData[user.role]);
        
        // Fetch team data based on role
        if (user.role === 'leader') {
          const teamsResponse = await fetch(`/api/leader/team?email=${user.email}`);
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json();
            setTeamsData(teamsData.teams || []);
          }
        } else if (user.role === 'member') {
          const teamResponse = await fetch(`/api/member/team?email=${user.email}`);
          if (teamResponse.ok) {
            const teamData = await teamResponse.json();
            setTeamsData(teamData.teams ? [teamData.teams] : []);
          }
        }
        
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading profile data...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  if (!profileData) return <div className="flex justify-center items-center h-screen">No profile data found</div>;
  
  // Format the join date
  const joinDate = profileData.joinedAt ? new Date(profileData.joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Not available';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-12 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center text-purple-600 font-bold text-5xl mb-4 md:mb-0 md:mr-8">
              {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profileData.name}</h1>
              <p className="text-xl mt-2 opacity-90">{profileData.position || user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              <p className="text-md mt-1 opacity-80 capitalize">Status: {profileData.status}</p>
            </div>
          </div>
        </div>
        
        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUserCircle className="mr-2 text-purple-600" /> Personal Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaUser className="mt-1 mr-3 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{profileData.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaEnvelope className="mt-1 mr-3 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{profileData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaIdBadge className="mt-1 mr-3 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                </div>
                
                {profileData.position && (
                  <div className="flex items-start">
                    <FaBuilding className="mt-1 mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-medium">{profileData.position}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <FaCalendarAlt className="mt-1 mr-3 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">{joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Teams Information */}
            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUsers className="mr-2 text-purple-600" /> Team Information
              </h2>
              
              {teamsData.length === 0 ? (
                <p className="text-gray-500">Not assigned to any teams yet.</p>
              ) : (
                <div className="space-y-6">
                  {teamsData.map(team => (
                    <div key={team._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <h3 className="font-bold text-lg text-purple-600">{team.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{team.description || 'No description'}</p>
                      
                      <div className="mt-3">
                        <h4 className="font-semibold text-sm text-gray-700">Team Members ({team.members?.length || 0})</h4>
                        {team.members && team.members.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {team.members.map(member => (
                              <li key={member._id} className="text-sm flex items-center">
                                <span className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs mr-2">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                                {member.name} {member.role ? `- ${member.role}` : ''}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1">No members in this team yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
