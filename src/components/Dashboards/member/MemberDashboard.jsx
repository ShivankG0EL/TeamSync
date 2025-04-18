'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Navbar from '../../Navbar/Navbar';

const MemberDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Protect this route - for all authenticated users
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Member Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">My Tasks</h2>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <div className="flex justify-between">
                  <h3 className="font-medium">Design Homepage</h3>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">In Progress</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Due: Tomorrow</p>
              </div>
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex justify-between">
                  <h3 className="font-medium">API Documentation</h3>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Urgent</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Due: Today</p>
              </div>
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="flex justify-between">
                  <h3 className="font-medium">Team Meeting</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Upcoming</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">In 2 days</p>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
              View All Tasks
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">My Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Weekly Tasks Completion</span>
                  <span>70%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Current Project Contribution</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Meeting Attendance</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
              Full Progress Report
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Updates</h2>
            <div className="space-y-3">
              <div className="p-3 border-b">
                <p className="font-medium">New Project Kickoff</p>
                <p className="text-sm text-gray-600">The mobile app project is starting next Monday. Please review requirements.</p>
                <p className="text-xs text-gray-500 mt-1">Posted 2 hours ago</p>
              </div>
              <div className="p-3 border-b">
                <p className="font-medium">Team Building Event</p>
                <p className="text-sm text-gray-600">Don't forget about the team building event this Friday at 4 PM.</p>
                <p className="text-xs text-gray-500 mt-1">Posted 1 day ago</p>
              </div>
              <div className="p-3">
                <p className="font-medium">New Tool Training</p>
                <p className="text-sm text-gray-600">Training session for the new design tool this Wednesday.</p>
                <p className="text-xs text-gray-500 mt-1">Posted 2 days ago</p>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
              All Updates
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberDashboard;
