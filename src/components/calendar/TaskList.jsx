import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiX, FiPlus, FiClock, FiCheck, FiAlertCircle } from 'react-icons/fi';
import TaskPopup from './TaskPopup';

const TaskList = ({ darkMode, selectedDate, selectedDateTasks, setShowModal, handleDeleteTask, updateTask }) => {
  const [selectedTask, setSelectedTask] = useState(null);

  const statusConfig = {
    upcoming: {
      icon: <FiClock className="mr-1" />,
      color: 'bg-blue-500',
      text: 'Upcoming'
    },
    completed: {
      icon: <FiCheck className="mr-1" />,
      color: 'bg-green-500',
      text: 'Completed'
    },
    overdue: {
      icon: <FiAlertCircle className="mr-1" />,
      color: 'bg-red-500',
      text: 'Overdue'
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  return (
    <>
      <div className={`w-96 h-screen border-l ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-4`}>
        <div className="sticky top-0 pb-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            <span className={`text-sm px-2 py-1 rounded-full ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}>
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center text-lg"
          >
            <FiPlus className="mr-2 h-5 w-5" /> Add New Task
          </button>
        </div>
        
        <div className="space-y-4 overflow-auto">
          {selectedDateTasks.length === 0 ? (
            <p className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No tasks for this date
            </p>
          ) : (
            selectedDateTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={`p-4 rounded-lg cursor-pointer ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                } ${task.status === 'overdue' ? 'border-l-4 border-red-500' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    {task.status && (
                      <span className={`text-xs px-2 py-1 rounded flex items-center w-fit ${statusConfig[task.status].color} text-white mt-1`}>
                        {statusConfig[task.status].icon}
                        {statusConfig[task.status].text}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className={`p-1 rounded hover:bg-opacity-20 ${
                      darkMode ? "hover:bg-gray-500" : "hover:bg-gray-300"
                    }`}
                  >
                    <FiX />
                  </button>
                </div>
                {task.description && (
                  <p className={`mt-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {task.description}
                  </p>
                )}
                {task.files && task.files.length > 0 && (
                  <div className="mt-2 text-sm text-blue-400">
                    {task.files.length} file(s) attached
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {selectedTask && (
        <TaskPopup
          task={selectedTask}
          darkMode={darkMode}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
        />
      )}
    </>
  );
};

export default TaskList;
