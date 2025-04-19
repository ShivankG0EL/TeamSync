"use client";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import TaskAssignmentForm from '../../Tasks/TaskAssignmentForm';
import { 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaExclamationTriangle, 
  FaUsers, 
  FaChartBar,
  FaRegClock,
  FaCalendarAlt,
  FaChartPie,
  FaChartLine,
  FaTasks,
  FaClock,
  FaFilter,
  FaComments,
  FaComment,
  FaUsers as FaUsersGroup,
  FaTimes,
  FaPaperPlane,
  FaBell
} from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ChatInterface from '../../Chat/ChatInterface';

const LeaderDashboard = () => {
  const [leaderData, setLeaderData] = useState(null);
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [memberPerformance, setMemberPerformance] = useState([]);
  const [calendarTasks, setCalendarTasks] = useState({});
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const router = useRouter();
  
  const userEmail = useSelector(state => state.auth.user?.email);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) return;
      
      try {
        setLoading(true);
        
        const profileResponse = await fetch(`/api/leader/profile?email=${userEmail}`);
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch leader profile');
        }
        const profileData = await profileResponse.json();
        setLeaderData(profileData.leader);
        
        const teamsResponse = await fetch(`/api/leader/team?email=${userEmail}`);
        if (!teamsResponse.ok) {
          throw new Error('Failed to fetch team data');
        }
        const teamsData = await teamsResponse.json();
        setTeamsData(teamsData.teams || []);
        
        if (teamsData.teams && teamsData.teams.length > 0) {
          setSelectedTeam(teamsData.teams[0]._id);
        }
        
        const tasksResponse = await fetch(`/api/tasks/leader?email=${userEmail}`);
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.tasks || []);
          
          const stats = calculateTeamStats(tasksData.tasks || []);
          setTeamStats(stats);
        }
        
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
    const fetchMemberPerformance = async () => {
      if (!selectedTeam) return;
      
      try {
        const response = await fetch(`/api/leader/member-performance?teamId=${selectedTeam}`);
        if (!response.ok) {
          throw new Error('Failed to fetch member performance data');
        }
        
        const data = await response.json();
        setMemberPerformance(data.memberPerformance || []);
      } catch (err) {
        console.error('Error fetching member performance:', err);
      }
    };
    
    fetchMemberPerformance();
  }, [selectedTeam]);
  
  useEffect(() => {
    if (tasks.length === 0) return;
    
    const tasksByDate = {};
    tasks.forEach(task => {
      const dateKey = new Date(task.dueDate).toDateString();
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });
    
    setCalendarTasks(tasksByDate);
  }, [tasks]);
  
  const calculateTeamStats = (tasksList) => {
    const teamTaskMap = {};
    
    tasksList.forEach(task => {
      const teamId = task.team?._id;
      if (!teamId) return;
      
      if (!teamTaskMap[teamId]) {
        teamTaskMap[teamId] = {
          totalTasks: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          overdue: 0,
          teamName: task.team.name
        };
      }
      
      const stats = teamTaskMap[teamId];
      stats.totalTasks++;
      
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
    
    return teamTaskMap;
  };
  
  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
    
    const updatedStats = calculateTeamStats([...tasks, newTask]);
    setTeamStats(updatedStats);
  };
  
  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
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

  const handleOpenChat = (target) => {
    setChatTarget(target);
    setIsChatOpen(true);
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setChatTarget(null);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showNotifications) {
      setUnreadCount(0);
    }
  };
  
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      time: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    setUnreadCount(prev => prev + 1);
  };
  
  useEffect(() => {
    const sampleNotifications = [
      { message: 'New task update from Jane Doe', type: 'task' },
      { message: 'Team meeting scheduled for tomorrow', type: 'meeting' },
      { message: 'Project deadline approaching', type: 'deadline' }
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleNotifications.length) {
        addNotification(sampleNotifications[index].message, sampleNotifications[index].type);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent align-[-0.125em]"></div>
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
  
  if (!leaderData) return (
    <div className="p-8 max-w-6xl mx-auto text-center">
      <div className="bg-gray-100 rounded-lg p-8 shadow-md">
        <FaUsers className="mx-auto text-5xl text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Leader Data Found</h2>
        <p className="text-gray-600">Please check your connection or contact support.</p>
      </div>
    </div>
  );
  
  const pieChartData = selectedTeam && teamStats[selectedTeam] ? [
    { name: 'Completed', value: teamStats[selectedTeam].completed, color: '#22c55e' },
    { name: 'In Progress', value: teamStats[selectedTeam].inProgress, color: '#3b82f6' },
    { name: 'Pending', value: teamStats[selectedTeam].pending, color: '#f59e0b' },
    { name: 'Overdue', value: teamStats[selectedTeam].overdue, color: '#ef4444' }
  ] : [];
  
  const barChartData = memberPerformance.map(member => ({
    name: member.name.split(' ')[0],
    completed: member.completedTasks,
    pending: member.pendingTasks,
    overdue: member.overdueTasks
  }));
  
  return (
    <div className="bg-gray-50 min-h-screen relative">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Leadership Dashboard</h1>
              <p className="mt-1 text-purple-100">Monitor your team's performance and upcoming tasks</p>
            </div>
            
            {/* Moved Task Assignment Button Here */}
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="mt-4 sm:mt-0 px-5 py-2.5 bg-white text-purple-700 hover:bg-purple-50 rounded-lg shadow-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
            >
              {showTaskForm ? 'Cancel' : '+ Assign New Task'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Form - Moved to appear right below header when active */}
        {showTaskForm && (
          <div className="mb-8 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Create New Task</h2>
            </div>
            <div className="p-6 bg-gray-50">
              <TaskAssignmentForm
                teams={teamsData}
                onSuccess={handleTaskCreated}
                onCancel={() => setShowTaskForm(false)}
              />
            </div>
          </div>
        )}
        
        {/* Team Selector */}
        {teamsData.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaFilter className="mr-2 text-purple-600" />
                  Team Selection
                </h2>
                <p className="text-sm text-gray-500">Select a team to view performance metrics</p>
              </div>
              <div className="w-full sm:w-64">
                <select
                  id="team-select"
                  value={selectedTeam || ''}
                  onChange={(e) => handleTeamChange(e.target.value)}
                  className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {teamsData.map((team) => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaCheckCircle className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Completion Rate</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {selectedTeam && teamStats[selectedTeam] && teamStats[selectedTeam].totalTasks > 0 
                        ? Math.round((teamStats[selectedTeam].completed / teamStats[selectedTeam].totalTasks) * 100) 
                        : 0}%
                    </p>
                    <p className="ml-2 text-sm text-gray-500">of tasks completed</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-green-50">
              <div className="text-sm text-green-700 flex justify-between items-center">
                <span>Total Completed</span>
                <span className="font-medium">
                  {selectedTeam && teamStats[selectedTeam] ? teamStats[selectedTeam].completed : 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaHourglassHalf className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">In Progress</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {selectedTeam && teamStats[selectedTeam] ? teamStats[selectedTeam].inProgress : 0}
                    </p>
                    <p className="ml-2 text-sm text-gray-500">active tasks</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-blue-50">
              <div className="text-sm text-blue-700 flex justify-between items-center">
                <span>Current Progress</span>
                <span className="font-medium">Active</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <FaExclamationTriangle className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Overdue Tasks</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {selectedTeam && teamStats[selectedTeam] ? teamStats[selectedTeam].overdue : 0}
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
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FaUsers className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Team Size</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {selectedTeam ? (teamsData.find(t => t._id === selectedTeam)?.members?.length || 0) : 0}
                    </p>
                    <p className="ml-2 text-sm text-gray-500">members</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-purple-50">
              <div className="text-sm text-purple-700 flex justify-between items-center">
                <span>Team Status</span>
                <span className="font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Performance Charts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaChartBar className="mr-2 text-purple-600" /> Performance Analytics
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Task Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <FaChartPie className="mr-2 text-purple-600" />
                  Task Distribution
                </h3>
                <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  {selectedTeam && teamStats[selectedTeam] ? teamStats[selectedTeam].totalTasks : 0} Total Tasks
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
                      <FaChartPie className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2 text-gray-500">No task data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Team Performance Comparison */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <FaChartBar className="mr-2 text-purple-600" />
                  Team Performance
                </h3>
              </div>
              <div className="p-6 bg-gradient-to-b from-white to-gray-50" style={{ height: '320px' }}>
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
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
                      <Bar dataKey="completed" name="Completed" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="overdue" name="Overdue" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FaChartBar className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2 text-gray-500">No performance data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Success Rate Line Chart */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <FaChartLine className="mr-2 text-purple-600" />
                Team Member Success Rates
              </h3>
            </div>
            <div className="p-6 bg-gradient-to-b from-white to-gray-50" style={{ height: '340px' }}>
              {memberPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={memberPerformance.map(member => ({
                      name: member.name,
                      rate: member.successRate,
                      tasks: member.totalTasks
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      label={{ 
                        value: 'Success Rate (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: '#6b7280', textAnchor: 'middle' }
                      }}
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === 'rate') return [`${value}%`, 'Success Rate'];
                        return [value, name];
                      }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#8b5cf6" 
                      fillOpacity={1} 
                      fill="url(#colorRate)" 
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      name="Success Rate"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FaChartLine className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-gray-500">No success rate data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Calendar and Task Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Task Calendar */}
          <div className="lg:col-span-5 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-2 text-purple-600" />
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
            </div>
          </div>
          
          {/* Task List for Selected Date */}
          <div className="lg:col-span-7 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <FaTasks className="mr-2 text-purple-600" />
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
                      <li key={task._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
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
                                Assigned to: {task.assignedTo?.name || 'N/A'}
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
                      </li>
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
        </div>
        
        {/* Task Management Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaTasks className="mr-2 text-purple-600" /> 
              Task Management
            </h2>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Recently Assigned Tasks</h3>
            
            {tasks.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FaTasks className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">No tasks assigned yet.</p>
                <p className="text-sm text-gray-400 mt-1">Use the 'Assign New Task' button at the top to create tasks.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.slice(0, 5).map(task => {
                      const dueDate = new Date(task.dueDate);
                      const isPastDue = dueDate < new Date() && task.status !== 'completed';
                      
                      return (
                        <tr key={task._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{task.assignedTo?.name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{task.team?.name || 'N/A'}</div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${isPastDue ? 'text-red-600 font-medium' : ''}`}>
                            <div className="text-sm">
                              {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full 
                              ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full 
                              ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                                task.status === 'on-hold' ? 'bg-gray-100 text-gray-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {tasks.length > 5 && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => router.push('/leader/tasks')}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      View all {tasks.length} tasks →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed Floating Chat and Notification System */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-4 z-40">
        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <FaBell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-purple-600 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold">Notifications</h3>
                <button onClick={toggleNotifications} className="text-white hover:text-gray-200">
                  <FaTimes />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {notifications.map(notification => (
                      <li key={notification.id} className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-purple-50' : ''}`}>
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 text-right">
                  <button 
                    onClick={() => {
                      setNotifications([]);
                      setUnreadCount(0);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-800"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Chat Button */}
        <div className="relative">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaComments className="h-6 w-6" />
          </button>
          
          {/* Chat Members Selection Panel */}
          {isChatOpen && !chatTarget && (
            <div className="absolute bottom-16 right-0 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold">Start a conversation</h3>
                <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-gray-200">
                  <FaTimes />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <button
                    onClick={() => handleOpenChat({ type: 'team', id: selectedTeam, name: 'Team Chat' })}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <FaUsersGroup className="mr-3 text-blue-600" />
                      <span className="font-medium">Team Chat</span>
                    </div>
                    <FaComment className="text-blue-600" />
                  </button>
                </div>
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members</h4>
                  {teamsData.find(t => t._id === selectedTeam)?.members?.length > 0 ? (
                    <ul className="space-y-2">
                      {teamsData.find(t => t._id === selectedTeam)?.members.map(member => (
                        <li key={member._id}>
                          <button
                            onClick={() => handleOpenChat({ type: 'member', id: member._id, name: member.name })}
                            className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm mr-3">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{member.name}</span>
                            </div>
                            <FaComment className="text-gray-400 hover:text-blue-600" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No team members available</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Active Chat Interface */}
          {isChatOpen && chatTarget && (
            <ChatInterface 
              target={chatTarget}
              onClose={handleCloseChat}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;