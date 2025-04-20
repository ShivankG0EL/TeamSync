"use client";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaExclamationTriangle, 
  FaUsers, 
  FaFilter,
  FaTasks,
  FaCalendarAlt,
  FaChartLine,
  FaClock,
  FaClipboardList,
  FaRegStar,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaSort,
  FaRegClock
} from 'react-icons/fa';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

import TaskUpdate from './TaskUpdate';

const MemberDashboard = () => {
  const [memberData, setMemberData] = useState(null);
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    total: 0,
    completionRate: 0,
  });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState({});
  const [taskView, setTaskView] = useState('list'); // 'list' or 'calendar'
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskUpdateOpen, setIsTaskUpdateOpen] = useState(false);
  
  const router = useRouter();
  const userEmail = useSelector(state => state.auth.user?.email);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) return;
      
      try {
        setLoading(true);
        
        // Fetch member profile
        const profileResponse = await fetch(`/api/member/profile?email=${userEmail}`);
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch member profile');
        }
        const profileData = await profileResponse.json();
        setMemberData(profileData.member);
        
        // Fetch teams the member belongs to
        const teamsResponse = await fetch(`/api/member/teams?email=${userEmail}`);
        if (!teamsResponse.ok) {
          throw new Error('Failed to fetch team data');
        }
        const teamsData = await teamsResponse.json();
        
        if (teamsData.teams && teamsData.teams.length > 0) {
          setTeamsData(teamsData.teams);
        } else {
          setTeamsData([]);
          setSelectedTeam(null);
        }
        
        // Fetch tasks assigned to the member
        const tasksResponse = await fetch(`/api/tasks/member?email=${userEmail}`);
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks data');
        }
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
        
        // Calculate task statistics for all tasks initially
        calculateTaskStats(tasksData.tasks || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userEmail]);
  
  useEffect(() => {
    if (tasks.length === 0) return;
    
    // Organize tasks by date for calendar view
    const tasksByDate = {};
    
    // Get the tasks for the current team filter
    let teamFilteredTasks = [...tasks];
    if (selectedTeam) {
      teamFilteredTasks = tasks.filter(task => task.team && task.team._id === selectedTeam);
    }
    
    teamFilteredTasks.forEach(task => {
      const dateKey = new Date(task.dueDate).toDateString();
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });
    
    setCalendarTasks(tasksByDate);
    
    // Filter and sort tasks
    filterAndSortTasks();
  }, [tasks, priorityFilter, statusFilter, sortField, sortDirection]); // Remove selectedTeam dependency
  
  const calculateTaskStats = (tasksList) => {
    const stats = {
      completed: 0,
      inProgress: 0,
      pending: 0,
      overdue: 0,
      total: tasksList.length
    };
    
    tasksList.forEach(task => {
      const dueDate = new Date(task.dueDate);
      const isPastDue = dueDate < new Date() && task.status !== 'completed';
      
      if (task.status === 'completed') {
        stats.completed++;
      } else if (task.status === 'in-progress') {
        stats.inProgress++;
      } else if (task.status === 'pending') {
        stats.pending++;
      }
      
      if (isPastDue) {
        stats.overdue++;
      }
    });
    
    stats.completionRate = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100) 
      : 0;
    
    setTaskStats(stats);
  };
  
  const filterAndSortTasks = () => {
    let filtered = [...tasks];
    
    // Apply team filter if selected
    if (selectedTeam) {
      filtered = filtered.filter(task => task.team && task.team._id === selectedTeam);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'dueDate':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'priority':
          const priorityValues = { high: 3, medium: 2, low: 1 };
          comparison = priorityValues[b.priority] - priorityValues[a.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          const statusValues = { pending: 1, 'in-progress': 2, completed: 3 };
          comparison = statusValues[a.status] - statusValues[b.status];
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredTasks(filtered);
  };
  
  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
    
    // Filter tasks for the selected team and update calendar view
    let teamTasks = [...tasks];
    
    if (teamId) {
      // Filter tasks for the selected team only
      teamTasks = tasks.filter(task => task.team && task.team._id === teamId);
    }
    
    // Recalculate task stats based on filtered tasks
    calculateTaskStats(teamTasks);
    
    // Update calendar tasks for the selected team
    const tasksByDate = {};
    teamTasks.forEach(task => {
      const dateKey = new Date(task.dueDate).toDateString();
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });
    
    setCalendarTasks(tasksByDate);
    
    // Also update filtered tasks for the list view
    let filtered = [...teamTasks];
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'dueDate':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'priority':
          const priorityValues = { high: 3, medium: 2, low: 1 };
          comparison = priorityValues[b.priority] - priorityValues[a.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          const statusValues = { pending: 1, 'in-progress': 2, completed: 3 };
          comparison = statusValues[a.status] - statusValues[b.status];
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredTasks(filtered);
  };
  
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskUpdateOpen(true);
  };
  
  const handleTaskUpdate = (updatedTask) => {
    // Update the task in the tasks list
    const updatedTasks = tasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    );
    setTasks(updatedTasks);
    
    // Update filtered tasks too
    const updatedFilteredTasks = filteredTasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    );
    setFilteredTasks(updatedFilteredTasks);
    
    // Recalculate stats
    if (selectedTeam) {
      const teamTasks = updatedTasks.filter(task => task.team && task.team._id === selectedTeam);
      calculateTaskStats(teamTasks);
    } else {
      calculateTaskStats(updatedTasks);
    }
    
    // Update calendar tasks
    const newCalendarTasks = { ...calendarTasks };
    Object.keys(newCalendarTasks).forEach(dateKey => {
      newCalendarTasks[dateKey] = newCalendarTasks[dateKey].map(task => 
        task._id === updatedTask._id ? updatedTask : task
      );
    });
    setCalendarTasks(newCalendarTasks);
  };
  
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateKey = date.toDateString();
    const hasTask = calendarTasks[dateKey] && calendarTasks[dateKey].length > 0;
    
    return hasTask ? (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
    ) : null;
  };
  
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const dateKey = date.toDateString();
    const tasks = calendarTasks[dateKey] || [];
    
    if (tasks.length === 0) return '';
    
    const hasOverdue = tasks.some(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'completed';
    });
    
    if (hasOverdue) return 'overdue-task-date';
    
    const hasCompleted = tasks.every(task => task.status === 'completed');
    if (hasCompleted) return 'completed-task-date';
    
    return 'pending-task-date';
  };
  
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
        <p className="mt-4 text-lg text-gray-700">Loading dashboard data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    </div>
  );
  
  if (!memberData) return (
    <div className="p-8 max-w-6xl mx-auto text-center">
      <div className="bg-gray-100 rounded-lg p-8 shadow-md">
        <FaUsers className="mx-auto text-5xl text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Member Data Found</h2>
        <p className="text-gray-600">Please check your connection or contact support.</p>
      </div>
    </div>
  );
  
  const pieChartData = [
    { name: 'Completed', value: taskStats.completed, color: '#22c55e' },
    { name: 'In Progress', value: taskStats.inProgress, color: '#3b82f6' },
    { name: 'Pending', value: taskStats.pending, color: '#f59e0b' },
    { name: 'Overdue', value: taskStats.overdue, color: '#ef4444' }
  ].filter(item => item.value > 0);
  
  const productivityData = Array.from({ length: 7 }, (_, i) => {
    // Generate some mock productivity data for the past 7 days
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      completed: Math.floor(Math.random() * 5),
      average: 3
    };
  });
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Member Dashboard</h1>
              <p className="mt-1 text-blue-100">Welcome back, {memberData.name}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Selector - Always visible */}
        {teamsData.length > 0 && (
          <motion.div 
            className="mb-6 bg-white rounded-lg shadow-sm p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaFilter className="mr-2 text-blue-600" />
                  Team Selection
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedTeam 
                    ? `Viewing tasks for ${teamsData.find(t => t._id === selectedTeam)?.name || 'selected team'}`
                    : 'Please select a team to view your tasks and metrics'}
                </p>
              </div>
              <div className="w-full sm:w-64">
                <select
                  id="team-select"
                  value={selectedTeam || ''}
                  onChange={(e) => handleTeamChange(e.target.value)}
                  className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled selected={!selectedTeam}>-- Select a Team --</option>
                  {teamsData.map((team) => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Team Selection Prompt - Show when no team selected */}
        {!selectedTeam && (
          <motion.div
            className="bg-blue-50 rounded-lg p-8 text-center border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-100">
              <FaUsers className="text-blue-500 h-8 w-8" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Select a Team to Get Started</h2>
            <p className="text-gray-600 mb-6">
              Choose a team from the dropdown above to see your tasks, metrics, and performance analytics
            </p>
            {teamsData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3">
                {teamsData.map(team => (
                  <button
                    key={team._id}
                    onClick={() => handleTeamChange(team._id)}
                    className="px-4 py-2 bg-white border border-blue-300 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
        
        {/* Only show metrics and content when a team is selected */}
        {selectedTeam && (
          <>
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <FaCheckCircle className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-gray-700">Completion Rate</h3>
                      <div className="mt-1 flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {taskStats.completionRate}%
                        </p>
                        <p className="ml-2 text-sm text-gray-500">of tasks completed</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-green-50">
                  <div className="text-sm text-green-700 flex justify-between items-center">
                    <span>Total Completed</span>
                    <span className="font-medium">{taskStats.completed}</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <FaHourglassHalf className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-gray-700">In Progress</h3>
                      <div className="mt-1 flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {taskStats.inProgress}
                        </p>
                        <p className="ml-2 text-sm text-gray-500">active tasks</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-blue-50">
                  <div className="text-sm text-blue-700 flex justify-between items-center">
                    <span>Current Focus</span>
                    <span className="font-medium">Active</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                      <FaExclamationTriangle className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-gray-700">Overdue Tasks</h3>
                      <div className="mt-1 flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {taskStats.overdue}
                        </p>
                        <p className="ml-2 text-sm text-gray-500">need attention</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-red-50">
                  <div className="text-sm text-red-700 flex justify-between items-center">
                    <span>Priority</span>
                    <span className="font-medium">High</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                      <FaTasks className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-gray-700">Total Tasks</h3>
                      <div className="mt-1 flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {taskStats.total}
                        </p>
                        <p className="ml-2 text-sm text-gray-500">assigned</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-amber-50">
                  <div className="text-sm text-amber-700 flex justify-between items-center">
                    <span>Task Status</span>
                    <span className="font-medium">{taskStats.pending} Pending</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Performance Analytics */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" /> Performance Analytics
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Task Distribution Chart */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <FaTasks className="mr-2 text-blue-600" />
                      Task Distribution
                    </h3>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {taskStats.total} Total Tasks
                    </span>
                  </div>
                  <div className="p-6 bg-gradient-to-b from-white to-gray-50" style={{ height: '320px' }}>
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} tasks`, name]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Legend 
                            layout="vertical" 
                            verticalAlign="middle" 
                            align="right" 
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <FaTasks className="mx-auto h-12 w-12 text-gray-300" />
                          <p className="mt-2 text-gray-500">No task data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Weekly Productivity Chart */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <FaChartLine className="mr-2 text-blue-600" />
                      Weekly Productivity
                    </h3>
                  </div>
                  <div className="p-6 bg-gradient-to-b from-white to-gray-50" style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={productivityData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6b7280' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          tickLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis 
                          tick={{ fill: '#6b7280' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                          tickLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="completed" name="Completed Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="average" stroke="#8884d8" name="Team Average" strokeWidth={2} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Calendar and Task Management Section */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {/* Task Calendar */}
              <div className="lg:col-span-5 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-600" />
                    Task Calendar
                  </h3>
                </div>
                <div className="p-4">
                  <div className="calendar-container">
                    <Calendar
                      onChange={setCalendarDate}
                      value={calendarDate}
                      tileContent={tileContent}
                      tileClassName={tileClassName}
                      className="react-calendar border-0 w-full"
                    />
                  </div>
                  <style jsx global>{`
                    .overdue-task-date {
                      background-color: rgba(239, 68, 68, 0.1);
                      position: relative;
                    }
                    .completed-task-date {
                      background-color: rgba(34, 197, 94, 0.1);
                      position: relative;
                    }
                    .pending-task-date {
                      background-color: rgba(59, 130, 246, 0.1);
                      position: relative;
                    }
                  `}</style>
                </div>
              </div>
              
              {/* Task List for Selected Date */}
              <div className="lg:col-span-7 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center">
                    <FaTasks className="mr-2 text-blue-600" />
                    Tasks for {calendarDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {calendarTasks[calendarDate.toDateString()]?.length || 0} Tasks
                  </span>
                </div>
                <div className="p-4 overflow-auto" style={{ maxHeight: '390px' }}>
                  {calendarTasks[calendarDate.toDateString()] ? (
                    <ul className="space-y-3">
                      {calendarTasks[calendarDate.toDateString()].map(task => {
                        const dueDate = new Date(task.dueDate);
                        const isPastDue = dueDate < new Date() && task.status !== 'completed';
                        const statusColors = {
                          'completed': 'bg-green-100 text-green-800',
                          'in-progress': 'bg-blue-100 text-blue-800',
                          'on-hold': 'bg-gray-100 text-gray-800',
                          'pending': isPastDue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        };
                        
                        return (
                          <motion.li 
                            key={task._id} 
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex justify-between">
                              <div className="flex items-start space-x-3">
                                <div className={`rounded-full h-8 w-8 flex items-center justify-center mt-1 ${
                                  task.status === 'completed' ? 'bg-green-100 text-green-600' :
                                  isPastDue ? 'bg-red-100 text-red-600' :
                                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                                  'bg-yellow-100 text-yellow-600'
                                }`}>
                                  {task.status === 'completed' ? <FaCheckCircle /> :
                                   isPastDue ? <FaExclamationTriangle /> :
                                   task.status === 'in-progress' ? <FaHourglassHalf /> :
                                   <FaClock />}
                                </div>
                                <div>
                                  <h4 className="font-medium">{task.title}</h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Assigned by: {task.assignedBy?.name || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Team: {task.team?.name || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]}`}>
                                  {task.status}{isPastDue && task.status !== 'completed' ? ' (Overdue)' : ''}
                                </span>
                                <p className="text-xs text-gray-500 mt-2 text-right">
                                  {dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2 text-gray-500">No tasks due on this date</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Task Management Section */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm overflow-hidden mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaClipboardList className="mr-2 text-blue-600" /> 
                    {selectedTeam 
                      ? `${teamsData.find(t => t._id === selectedTeam)?.name || 'Team'} Tasks` 
                      : 'All Tasks'}
                  </h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setTaskView('list')} 
                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                        taskView === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FaClipboardList className="mr-1.5" /> List
                    </button>
                    <button 
                      onClick={() => setTaskView('calendar')} 
                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                        taskView === 'calendar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FaCalendarAlt className="mr-1.5" /> Calendar
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">All Tasks</h3>
                    <p className="text-sm text-gray-500">Manage and track your assigned tasks</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Priority Filter */}
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="block w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    
                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    {/* Sort Options */}
                    <select
                      value={`${sortField}-${sortDirection}`}
                      onChange={(e) => {
                        const [field, direction] = e.target.value.split('-');
                        setSortField(field);
                        setSortDirection(direction);
                      }}
                      className="block w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="dueDate-asc">Due Date (Earliest First)</option>
                      <option value="dueDate-desc">Due Date (Latest First)</option>
                      <option value="priority-desc">Priority (High to Low)</option>
                      <option value="priority-asc">Priority (Low to High)</option>
                      <option value="title-asc">Title (A-Z)</option>
                      <option value="title-desc">Title (Z-A)</option>
                    </select>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  {taskView === 'list' ? (
                    <motion.div
                      key="list-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {filteredTasks.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <FaTasks className="mx-auto h-12 w-12 text-gray-300" />
                          <p className="mt-2 text-gray-500">No tasks found matching the current filters.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <button 
                                    onClick={() => toggleSortDirection('title')}
                                    className="flex items-center hover:text-gray-700"
                                  >
                                    Title
                                    {sortField === 'title' && (
                                      sortDirection === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />
                                    )}
                                    {sortField !== 'title' && <FaSort className="ml-1 opacity-30" />}
                                  </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <button 
                                    onClick={() => toggleSortDirection('dueDate')}
                                    className="flex items-center hover:text-gray-700"
                                  >
                                    Due Date
                                    {sortField === 'dueDate' && (
                                      sortDirection === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />
                                    )}
                                    {sortField !== 'dueDate' && <FaSort className="ml-1 opacity-30" />}
                                  </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <button 
                                    onClick={() => toggleSortDirection('priority')}
                                    className="flex items-center hover:text-gray-700"
                                  >
                                    Priority
                                    {sortField === 'priority' && (
                                      sortDirection === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />
                                    )}
                                    {sortField !== 'priority' && <FaSort className="ml-1 opacity-30" />}
                                  </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <button 
                                    onClick={() => toggleSortDirection('status')}
                                    className="flex items-center hover:text-gray-700"
                                  >
                                    Status
                                    {sortField === 'status' && (
                                      sortDirection === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />
                                    )}
                                    {sortField !== 'status' && <FaSort className="ml-1 opacity-30" />}
                                  </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredTasks.map(task => {
                                const dueDate = new Date(task.dueDate);
                                const isPastDue = dueDate < new Date() && task.status !== 'completed';
                                
                                return (
                                  <motion.tr 
                                    key={task._id} 
                                    className="hover:bg-gray-50 cursor-pointer"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                    onClick={() => handleTaskClick(task)}
                                  >
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                      <div className="text-xs text-gray-500 mt-1">Team: {task.team?.name || 'N/A'}</div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${isPastDue ? 'text-red-600 font-medium' : ''}`}>
                                      <div className="flex items-center text-sm">
                                        <FaRegClock className="mr-1.5" />
                                        {dueDate.toLocaleDateString()}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full 
                                        ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-green-100 text-green-800'}`}>
                                        {task.priority === 'high' && <FaStar className="mr-1" />}
                                        {task.priority === 'medium' && <FaRegStar className="mr-1" />}
                                        {task.priority === 'low' && <FaRegStar className="mr-1" />}
                                        {task.priority}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full 
                                        ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                                          task.status === 'on-hold' ? 'bg-gray-100 text-gray-800' : 
                                          'bg-yellow-100 text-yellow-800'}`}>
                                        {task.status === 'completed' && <FaCheckCircle className="mr-1" />}
                                        {task.status === 'in-progress' && <FaHourglassHalf className="mr-1" />}
                                        {task.status === 'pending' && <FaClock className="mr-1" />}
                                        {task.status}
                                        {isPastDue && task.status !== 'completed' && ' (Overdue)'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <button 
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                        onClick={() => router.push(`/member/task/${task._id}`)}
                                      >
                                        View Details
                                      </button>
                                    </td>
                                  </motion.tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="calendar-view"
                      className="bg-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Extend the calendar view here if needed */}
                      <div className="flex justify-center">
                        <div className="w-full max-w-3xl">
                          <Calendar
                            onChange={setCalendarDate}
                            value={calendarDate}
                            tileContent={tileContent}
                            tileClassName={tileClassName}
                            className="react-calendar border-0 w-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </div>
      
      {/* Add TaskUpdate Modal */}
      <TaskUpdate 
        isOpen={isTaskUpdateOpen}
        onClose={() => setIsTaskUpdateOpen(false)}
        task={selectedTask}
        onUpdateTask={handleTaskUpdate}
      />
    </div>
  );
};

export default MemberDashboard;
