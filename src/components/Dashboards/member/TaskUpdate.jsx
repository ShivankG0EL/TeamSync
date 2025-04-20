import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaClock,
  FaPaperclip,
  FaTimes,
  FaUpload,
  FaTrash,
  FaFileAlt,
  FaFileImage,
  FaFilePdf,
  FaFile,
  FaExclamationTriangle
} from 'react-icons/fa';

const TaskUpdate = ({ isOpen, onClose, task, onUpdateTask }) => {
  const [status, setStatus] = useState(task?.status || 'pending');
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  if (!task) return null;
  
  const dueDate = new Date(task.dueDate);
  const isPastDue = dueDate < new Date() && task.status !== 'completed';
  
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        id: Math.random().toString(36).substring(2),
        name: file.name,
        preview: file.type.includes('image') ? URL.createObjectURL(file) : null,
        type: file.type
      }));
      setFiles([...files, ...newFiles]);
    }
  };
  
  const removeFile = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };
  
  const getFileIcon = (type) => {
    if (type.includes('image')) return <FaFileImage className="text-blue-500" />;
    if (type.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (type.includes('text') || type.includes('document')) return <FaFileAlt className="text-yellow-500" />;
    return <FaFile className="text-gray-500" />;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create form data for file uploads
      const formData = new FormData();
      formData.append('taskId', task._id);
      formData.append('status', status);
      formData.append('comment', comment);
      
      files.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });
      
      // Make API request to update task
      const response = await fetch('/api/tasks/update', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      const data = await response.json();
      
      // Show success message
      setSuccess(true);
      
      // Call the parent component's update handler
      if (onUpdateTask) {
        onUpdateTask({
          ...task,
          status,
          files: [...(task.files || []), ...files.map(f => f.name)],
          comments: [...(task.comments || []), { text: comment, date: new Date() }]
        });
      }
      
      // Close the modal after a delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-lg"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-medium text-white">Update Task</h3>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {success ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FaCheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h4 className="text-xl font-medium text-gray-800 mb-2">Task Updated!</h4>
                  <p className="text-gray-600">Your changes have been saved successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h4>
                    <p className="text-gray-600 mb-1">{task.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="flex items-center">
                        <FaClock className="mr-1" />
                        Due: {dueDate.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}
                      </span>
                      {isPastDue && (
                        <span className="ml-3 text-red-600 flex items-center">
                          <FaExclamationTriangle className="mr-1" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="status">
                      Update Status
                    </label>
                    <div className="relative">
                      <select
                        id="status"
                        value={status}
                        onChange={handleStatusChange}
                        className="block w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="comment">
                      Add Comment (Optional)
                    </label>
                    <textarea
                      id="comment"
                      rows="3"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add details or comments about your progress..."
                    ></textarea>
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Upload Files (Optional)
                    </label>
                    
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-7">
                          <FaUpload className="w-8 h-8 text-gray-400" />
                          <p className="pt-1 text-sm text-gray-600">
                            <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            Supported files: PDF, Word, Excel, PowerPoint, Images
                          </p>
                        </div>
                        <input 
                          type="file" 
                          multiple 
                          className="opacity-0 absolute" 
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-40 overflow-auto">
                        {files.map(file => (
                          <div 
                            key={file.id} 
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                          >
                            <div className="flex items-center">
                              {getFileIcon(file.type)}
                              <span className="ml-2 text-sm text-gray-700 truncate max-w-[180px]">
                                {file.name}
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
                        isSubmitting 
                          ? 'opacity-70 cursor-not-allowed' 
                          : 'hover:bg-blue-700'
                      } transition-colors flex items-center`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        'Update Task'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskUpdate;
