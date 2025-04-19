'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiUser, FiCheck, FiX, FiAlertCircle, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

const CreateUser = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    roles: [],
    password: '',
    confirmPassword: '',
    teamId: ''
  });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formStep, setFormStep] = useState(1);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [existingUser, setExistingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await axios.get('/api/admin/teams');
        
        if (data.teams) {
          setTeams(data.teams);
        }
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      }
    };

    fetchTeams();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role) => {
    setUserData(prev => {
      const roles = [...prev.roles];
      const index = roles.indexOf(role);
      
      if (index === -1) {
        roles.push(role);
      } else {
        roles.splice(index, 1);
      }
      
      return { ...prev, roles };
    });
  };

  const validateForm = () => {
    if (!userData.name || !userData.email || userData.roles.length === 0) {
      setError('Name, email, and at least one role are required.');
      return false;
    }
    
    if (userData.password && userData.password !== userData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    return true;
  };

  const checkEmailExists = async () => {
    if (!userData.email || !userData.name) {
      setError('Name and email are required.');
      return false;
    }

    setCheckingEmail(true);
    setError('');

    try {
      const response = await axios.get(`/api/admin/users/check-email?email=${encodeURIComponent(userData.email)}`);
      
      if (response.data.exists) {
        setExistingUser(response.data.user);
        setShowModal(true);
        return true;
      } else {
        setFormStep(2);
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check email. Please try again.');
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleFirstStep = async (e) => {
    e.preventDefault();
    await checkEmailExists();
  };

  const handleContinueWithExistingEmail = () => {
    setShowModal(false);
    setUserData(prev => ({ ...prev, email: '' }));
  };

  const handleGoBackToUsers = () => {
    router.push('/admin/users');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = {
        name: userData.name,
        email: userData.email,
        roles: userData.roles,
        password: userData.password || undefined,
        teamId: userData.teamId || undefined
      };
      
      const response = await axios.post('/api/admin/users', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setUserData({
          name: '',
          email: '',
          roles: [],
          password: '',
          confirmPassword: '',
          teamId: ''
        });
        
        setTimeout(() => {
          router.push('/admin/users');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const needsTeamAssignment = userData.roles.includes('member') || userData.roles.includes('leader');

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25 } }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#f8f5f0] min-h-screen p-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-[#3a3a3a]">Create New User</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
              <FiCheck className="mr-2" />
              User created successfully! Redirecting...
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {formStep === 1 && (
              <motion.form 
                key="step1" 
                onSubmit={handleFirstStep}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="mb-4">
                  <label className="block text-[#3a3a3a] text-sm font-bold mb-2 flex items-center">
                    <FiUser className="mr-2" /> Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className="shadow appearance-none border border-[#e8e0d8] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                    required
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-[#3a3a3a] text-sm font-bold mb-2 flex items-center">
                    <FiMail className="mr-2" /> Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="shadow appearance-none border border-[#e8e0d8] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                    required
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="flex items-center justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={checkingEmail}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] flex items-center"
                  >
                    {checkingEmail ? (
                      <>Checking... <span className="ml-2 inline-block animate-spin">⟳</span></>
                    ) : (
                      <>Next <FiArrowRight className="ml-2" /></>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
            
            {formStep === 2 && (
              <motion.form 
                key="step2" 
                onSubmit={handleSubmit}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex items-center mb-2">
                    <FiUser className="mr-2 text-blue-600" />
                    <span className="font-semibold">{userData.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FiMail className="mr-2 text-blue-600" />
                    <span>{userData.email}</span>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(1)} 
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      (change)
                    </button>
                  </div>
                </div>
            
                <div className="mb-4">
                  <label className="block text-[#3a3a3a] text-sm font-bold mb-2">
                    Roles* (Select at least one)
                  </label>
                  <div className="flex flex-wrap items-center space-x-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="role-member"
                        checked={userData.roles.includes('member')}
                        onChange={() => handleRoleToggle('member')}
                        className="mr-2 focus:ring-[#8b5cf6]"
                      />
                      <label htmlFor="role-member" className="text-[#3a3a3a]">Team Member</label>
                    </div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="role-leader"
                        checked={userData.roles.includes('leader')}
                        onChange={() => handleRoleToggle('leader')}
                        className="mr-2 focus:ring-[#8b5cf6]"
                      />
                      <label htmlFor="role-leader" className="text-[#3a3a3a]">Team Leader</label>
                    </div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="role-admin"
                        checked={userData.roles.includes('admin')}
                        onChange={() => handleRoleToggle('admin')}
                        className="mr-2 focus:ring-[#8b5cf6]"
                      />
                      <label htmlFor="role-admin" className="text-[#3a3a3a]">Administrator</label>
                    </div>
                  </div>
                </div>
                
                {needsTeamAssignment && (
                  <div className="mb-4">
                    <label className="block text-[#3a3a3a] text-sm font-bold mb-2">
                      Assign to Team
                    </label>
                    <select
                      name="teamId"
                      value={userData.teamId}
                      onChange={handleChange}
                      className="shadow appearance-none border border-[#e8e0d8] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                    >
                      <option value="">Select a Team (Optional)</option>
                      {teams.map(team => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-[#3a3a3a] text-sm font-bold mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={userData.password}
                      onChange={handleChange}
                      className="shadow appearance-none border border-[#e8e0d8] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-[#8b5cf6]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to let the user set their own password via email.
                  </p>
                </div>
                
                {userData.password && (
                  <div className="mb-6">
                    <label className="block text-[#3a3a3a] text-sm font-bold mb-2">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleChange}
                      className="shadow appearance-none border border-[#e8e0d8] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => router.back()}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 mr-2"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50 bg-opacity-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex items-center mb-4 text-amber-600">
                <FiAlertCircle className="mr-2 text-2xl" />
                <h3 className="text-lg font-bold">User Already Exists</h3>
              </div>
              
              <p className="mb-4">
                A user with the email <span className="font-semibold">{userData.email}</span> already exists in the system.
                {existingUser && existingUser.roles && (
                  <span className="block mt-2">
                    Current roles: {existingUser.roles.map(r => 
                      typeof r === 'object' ? r.type : r
                    ).join(', ')}
                  </span>
                )}
              </p>
              
              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoBackToUsers}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  <FiX className="mr-1" /> Go Back to Users
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinueWithExistingEmail}
                  className="flex items-center px-4 py-2 bg-[#8b5cf6] text-white rounded hover:bg-[#7c3aed]"
                >
                  <FiCheck className="mr-1" /> Try Different Email
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreateUser;
