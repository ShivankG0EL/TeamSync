'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Navbar from '../../Navbar/Navbar';

const AdminDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Protect this route - only for admins
    if (!isAuthenticated) {
      router.push('/auth/signin');
    } else if (user?.role !== 'admin') {
      router.push(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, router]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Organization Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Teams</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Members</span>
                <span className="font-bold">48</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Projects</span>
                <span className="font-bold">8</span>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
              View Details
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Management</h2>
            <ul className="space-y-2">
              <li className="hover:bg-gray-50 p-2 rounded">
                <Link href="/admin/teams" className="block">View All Teams</Link>
              </li>
              <li className="hover:bg-gray-50 p-2 rounded">
                <Link href="/admin/teams/create" className="block">Create New Team</Link>
              </li>
              <li className="hover:bg-gray-50 p-2 rounded">
                <Link href="/admin/users" className="block">Manage Team Members</Link>
              </li>
              <li className="hover:bg-gray-50 p-2 rounded">
                <Link href="/admin/users?filter=leader" className="block">Manage Team Leaders</Link>
              </li>
            </ul>
            <Link href="/admin/teams" className="mt-4 block w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-center">
              Team Dashboard
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <ul className="space-y-2">
              <li className="hover:bg-gray-50 p-2 rounded">
                <Link href="/admin/users" className="block">View All Users</Link>
              </li>
              <li className="hover:bg-gray-50 p-2 rounded">
                <Link href="/admin/users/create" className="block">Add New User</Link>
              </li>
              <li className="hover:bg-gray-50 p-2 rounded">
                <Link href="/admin/users/roles" className="block">Role Assignment</Link>
              </li>
              <li className="hover:bg-gray-50 p-2 rounded">
                <Link href="/admin/users/permissions" className="block">Manage Permissions</Link>
              </li>
            </ul>
            <Link href="/admin/users" className="mt-4 block w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-center">
              User Dashboard
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-3">
              <div>
                <p>Database Status</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <p className="text-right text-sm text-green-600">98% - Healthy</p>
              </div>
              <div>
                <p>API Performance</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <p className="text-right text-sm text-green-600">95% - Optimal</p>
              </div>
              <div>
                <p>Storage Usage</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-right text-sm text-yellow-500">75% - Monitor</p>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
              System Reports
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
