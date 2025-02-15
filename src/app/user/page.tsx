'use client';

import { FiUsers, FiActivity, FiDollarSign, FiBox } from 'react-icons/fi';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 h-screen bg-white shadow-md flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">TeamSync</h2>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center p-2 text-gray-700 rounded hover:bg-gray-100">
                  <FiActivity className="mr-3" /> Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-2 text-gray-700 rounded hover:bg-gray-100">
                  <FiUsers className="mr-3" /> Team
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiUsers className="text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <h3 className="text-xl font-semibold">1,234</h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FiActivity className="text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Active Projects</p>
                  <h3 className="text-xl font-semibold">42</h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FiBox className="text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <h3 className="text-xl font-semibold">789</h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FiDollarSign className="text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Revenue</p>
                  <h3 className="text-xl font-semibold">$12,345</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Latest Updates</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <p className="text-gray-600">New team member added</p>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <p className="text-gray-600">Project milestone completed</p>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <p className="text-gray-600">New feature deployed</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
