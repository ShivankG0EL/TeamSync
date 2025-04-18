'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Navbar from '../../Navbar/Navbar';

const LeaderDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Protect this route - only for leaders or admins
    if (!isAuthenticated) {
      router.push('/auth/signin');
    } else if (user?.role !== 'leader' && user?.role !== 'admin') {
      router.push(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, router]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Team Leader Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Performance</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Active Members</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tasks Completed</span>
                <span className="font-bold">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tasks In Progress</span>
                <span className="font-bold">15</span>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
              View Team Analytics
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Project Management</h2>
            <ul className="space-y-2">
              <li className="flex justify-between items-center hover:bg-gray-50 p-2 rounded">
                <span>Mobile App Design</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs py-1 px-2 rounded">In Progress</span>
              </li>
              <li className="flex justify-between items-center hover:bg-gray-50 p-2 rounded">
                <span>Website Redesign</span>
                <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded">Completed</span>
              </li>
              <li className="flex justify-between items-center hover:bg-gray-50 p-2 rounded">
                <span>API Integration</span>
                <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded">Planning</span>
              </li>
            </ul>
            <button className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
              Manage Projects
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Task Assignment</h2>
            <div className="space-y-3">
              <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded">
                Create New Task
              </button>
              <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                Assign Tasks
              </button>
              <button className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded">
                Task Templates
              </button>
              <button className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded">
                Review Completed Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaderDashboard;
