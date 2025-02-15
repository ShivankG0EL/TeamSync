import React, { useState, useCallback } from 'react';
import { FiX, FiUpload, FiClock, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { format, parseISO } from 'date-fns';

const TaskPopup = ({ task, darkMode, onClose, onUpdate }) => {
  const [updatedTask, setUpdatedTask] = useState({
    ...task,
    files: task.files || []
  });

  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    
    setUpdatedTask(prev => ({
      ...prev,
      files: [...(prev.files || []), ...newFiles]
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(updatedTask);
    onClose();
  };

  const removeFile = (fileIndex) => {
    setUpdatedTask(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== fileIndex)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} rounded-lg p-8 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Task Details</h2>
          <button
            onClick={onClose}
            className={darkMode ? "text-gray-300 hover:text-gray-100" : "text-gray-500 hover:text-gray-700"}
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={updatedTask.title}
              onChange={(e) => setUpdatedTask({ ...updatedTask, title: e.target.value })}
              className={`w-full rounded-md p-2 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={updatedTask.description}
              onChange={(e) => setUpdatedTask({ ...updatedTask, description: e.target.value })}
              className={`w-full rounded-md p-2 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <button
              type="button"
              onClick={() => setUpdatedTask(prev => ({
                ...prev,
                status: prev.status === 'completed' ? 'upcoming' : 'completed'
              }))}
              className={`w-full flex items-center justify-center p-2 rounded-md ${
                updatedTask.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {updatedTask.status === 'completed' ? (
                <>
                  <FiCheck className="mr-2" />
                  Mark as Incomplete
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Mark as Complete
                </>
              )}
            </button>
            {updatedTask.status !== 'completed' && (
              <p className={`mt-2 text-sm ${
                updatedTask.status === 'overdue' ? 'text-red-500' : 'text-blue-500'
              }`}>
                Due date: {format(parseISO(updatedTask.dueDate), 'dd MMM yyyy')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Files</label>
            <div {...getRootProps()} className={`
              mt-2 cursor-pointer border-2 border-dashed rounded-md p-4
              ${isDragActive ? 'border-blue-500 bg-blue-50' : darkMode ? 'border-gray-600' : 'border-gray-300'}
              ${darkMode ? 'hover:border-gray-500' : 'hover:border-gray-400'}
            `}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <FiUpload className="w-6 h-6" />
                <p className="text-sm text-center">
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag & drop files here, or click to select"}
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {updatedTask.files?.map((file, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <a href={file.url} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="text-blue-400 hover:text-blue-300 truncate flex-1">
                    {file.name}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Update Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskPopup;
