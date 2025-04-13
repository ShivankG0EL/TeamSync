import React, { useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { FiEdit, FiTrash2, FiPlus, FiCheck, FiX } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { deleteTask, updateTask } from "../../redux/taskSlice";

const TaskList = ({ selectedDate, selectedDateTasks, setShowModal }) => {
  const { darkMode } = useTheme();
  const dispatch = useDispatch();
  const taskError = useSelector((state) => state.tasks.error);
  
  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  
  // Check if selected date is in the past (but not today)
  const isSelectedDatePast = isPast(selectedDate) && !isToday(selectedDate);

  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditFormData({ ...task });
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditFormData(null);
  };

  const saveEdit = () => {
    if (!editFormData || !editFormData.title) return;
    
    console.log("Updating task:", editFormData);
    dispatch(updateTask(editFormData))
      .unwrap()
      .then(() => {
        setEditingTask(null);
        setEditFormData(null);
      })
      .catch((error) => {
        console.error("Failed to update task:", error);
        // You could add error handling UI here
      });
  };

  const toggleTaskStatus = (task) => {
    const newStatus = task.status === 'completed' ? 'upcoming' : 'completed';
    dispatch(updateTask({ ...task, status: newStatus }))
      .unwrap()
      .catch((error) => {
        console.error("Failed to update task status:", error);
      });
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask(taskId))
        .unwrap()
        .catch((error) => {
          console.error("Failed to delete task:", error);
        });
    }
  };

  const getStatusColor = (status) => {
    if (darkMode) {
      switch (status) {
        case "completed": return "bg-green-700 text-green-100";
        case "overdue": return "bg-red-700 text-red-100";
        default: return "bg-blue-700 text-blue-100"; // upcoming
      }
    } else {
      switch (status) {
        case "completed": return "bg-green-100 text-green-800";
        case "overdue": return "bg-red-100 text-red-800";
        default: return "bg-blue-100 text-blue-800"; // upcoming
      }
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} w-80 h-screen overflow-auto p-4 shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {format(selectedDate, "MMMM d, yyyy")}
        </h2>
        {/* Only show add task button for today or future dates */}
        {!isSelectedDatePast && (
          <button
            onClick={() => setShowModal(true)}
            className={`p-2 rounded-full ${
              darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            <FiPlus size={20} />
          </button>
        )}
      </div>

      {/* Show error message if there's an error */}
      {taskError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-4 rounded">
          <p>Error: {taskError}</p>
        </div>
      )}

      {selectedDateTasks.length === 0 ? (
        <p className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          No tasks for this day
        </p>
      ) : (
        <ul className="space-y-3">
          {selectedDateTasks.map((task) => (
            <li
              key={task._id}
              className={`p-3 rounded-lg transition ${
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600" 
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {editingTask === task._id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className={`w-full p-2 rounded ${
                      darkMode 
                        ? "bg-gray-600 text-white border border-gray-500" 
                        : "bg-white text-gray-800 border border-gray-300"
                    }`}
                  />
                  <textarea
                    value={editFormData.description || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className={`w-full p-2 rounded ${
                      darkMode 
                        ? "bg-gray-600 text-white border border-gray-500" 
                        : "bg-white text-gray-800 border border-gray-300"
                    }`}
                    rows="2"
                  />
                  <div className="flex space-x-2 justify-end mt-2">
                    <button
                      onClick={cancelEditing}
                      className={`p-1 rounded ${
                        darkMode 
                          ? "bg-gray-600 hover:bg-gray-500 text-white" 
                          : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                      }`}
                    >
                      <FiX size={18} />
                    </button>
                    <button
                      onClick={saveEdit}
                      className={`p-1 rounded ${
                        darkMode 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      <FiCheck size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between">
                    <span 
                      className={`text-sm px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}
                    >
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`p-1 rounded ${
                          darkMode 
                            ? "hover:bg-gray-600 text-gray-300" 
                            : "hover:bg-gray-300 text-gray-600"
                        }`}
                        title={task.status === "completed" ? "Mark as incomplete" : "Mark as completed"}
                      >
                        <FiCheck size={16} className={task.status === 'completed' ? "text-green-500" : ""} />
                      </button>
                      <button
                        onClick={() => startEditing(task)}
                        className={`p-1 rounded ${
                          darkMode 
                            ? "hover:bg-gray-600 text-gray-300" 
                            : "hover:bg-gray-300 text-gray-600"
                        }`}
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className={`p-1 rounded ${
                          darkMode 
                            ? "hover:bg-gray-600 text-gray-300" 
                            : "hover:bg-gray-300 text-gray-600"
                        }`}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-lg mt-1">{task.title}</h3>
                  {task.description && <p className="text-sm mt-1">{task.description}</p>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
