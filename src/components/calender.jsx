"use client";
import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, isPast } from "date-fns";
import { FiClock, FiCheck, FiAlertTriangle, FiPlus, FiX, FiEdit2, FiTrash2, FiSearch, FiMoon, FiSun } from "react-icons/fi";

const CalendarTaskManager = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    status: "upcoming"
  });

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", (!darkMode).toString());
  };

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.dueDate) return;

    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setNewTask({
      title: "",
      description: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      status: "upcoming"
    });
    setShowModal(false);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TaskModal = () => {
    const [formData, setFormData] = useState({
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      status: newTask.status
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.title || !formData.dueDate) return;

      setTasks([...tasks, { ...formData, id: Date.now() }]);
      setNewTask({
        title: "",
        description: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        status: "upcoming"
      });
      setShowModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} rounded-lg p-8 w-full max-w-md`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add New Task</h2>
            <button
              onClick={() => setShowModal(false)}
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
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full rounded-md p-2 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-800"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full rounded-md p-2 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-800"}`}
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full rounded-md p-2 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-800"}`}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              Add Task
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"} p-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{format(currentDate, "MMMM yyyy")}</h1>
          <div className="flex space-x-4 items-center">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <FiPlus className="inline mr-2" /> Add Task
            </button>
          </div>
        </div>

        <div className={`rounded-lg ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} p-6 shadow-lg`}>
          <div className="grid grid-cols-7 gap-4 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-medium">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {monthDays.map((day) => {
              const dayTasks = filteredTasks.filter(
                (task) => format(parseISO(task.dueDate), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
              );

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] p-2 rounded-lg ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-800"
                  } ${
                    isToday(day) 
                      ? (darkMode ? "border-2 border-blue-500" : "border-2 border-blue-600") 
                      : ""
                  }`}
                >
                  <div className="text-right">
                    <span className={`${isToday(day) ? "font-bold text-blue-500" : ""}`}>
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-2 rounded ${
                          darkMode 
                            ? "bg-gray-600 text-gray-100 hover:bg-gray-500" 
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                        title={task.description}
                      >
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className={`text-xs mt-1 truncate ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}>
                            {task.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {showModal && <TaskModal />}
    </div>
  );
};

export default CalendarTaskManager;