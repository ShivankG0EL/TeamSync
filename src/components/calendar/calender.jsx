"use client";
import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO, isPast, addMonths, subMonths } from "date-fns";
import { FiX, FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import TaskList from './TaskList';
import { useTheme } from "../../context/ThemeContext";

const CalendarTaskManager = () => {
  const { darkMode } = useTheme();
  
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
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const updateTask = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const getTaskStatus = (task) => {
    if (task.status === 'completed') return 'completed';
    const dueDate = parseISO(task.dueDate);
    return isPast(dueDate) && format(dueDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd')
      ? 'overdue'
      : 'upcoming';
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).map(task => ({
    ...task,
    status: getTaskStatus(task)
  }));

  const selectedDateTasks = tasks.filter(
    (task) => format(parseISO(task.dueDate), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  ).map(task => ({
    ...task,
    status: getTaskStatus(task)
  }));

  const TaskModal = () => {
    const [formData, setFormData] = useState({
      title: newTask.title,
      description: newTask.description,
      dueDate: format(selectedDate, "yyyy-MM-dd"), // Use selectedDate instead of current date
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

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"} h-screen overflow-hidden`}>
      <div className="flex h-full">
        {/* Calendar Section */}
        <div className="flex-1 p-4 overflow-auto flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">{format(currentDate, "MMMM yyyy")}</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousMonth}
                  className={`p-2 rounded-full ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  }`}
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={goToCurrentMonth}
                  className={`px-3 py-1 rounded-md text-sm ${
                    darkMode 
                      ? "bg-gray-700 hover:bg-gray-600" 
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Current Month
                </button>
                <button
                  onClick={handleNextMonth}
                  className={`p-2 rounded-full ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  }`}
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className={`rounded-lg ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} p-6 shadow-lg flex-1 flex flex-col`}>
            <div className="grid grid-cols-7 gap-4 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4 flex-1">
              {monthDays.map((day) => {
                const hasTask = filteredTasks.some(
                  (task) => format(parseISO(task.dueDate), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                );

                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[80px] p-2 rounded-lg cursor-pointer transition-colors relative
                      ${darkMode ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
                      ${isToday(day) ? (darkMode ? "border-2 border-blue-500" : "border-2 border-blue-600") : ""}
                      ${format(selectedDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                        ? (darkMode ? "ring-2 ring-amber-500" : "ring-2 ring-amber-600")
                        : ""
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`${isToday(day) ? "font-bold text-blue-500" : ""}`}>
                        {format(day, "d")}
                      </span>
                      {hasTask && (
                        <div className={`h-2 w-2 rounded-full ${
                          darkMode ? "bg-blue-400" : "bg-blue-500"
                        }`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task List Section */}
        <TaskList 
          darkMode={darkMode}
          selectedDate={selectedDate}
          selectedDateTasks={selectedDateTasks}
          setShowModal={setShowModal}
          handleDeleteTask={handleDeleteTask}
          updateTask={updateTask}
        />
      </div>
      {showModal && <TaskModal />}
    </div>
  );
};

export default CalendarTaskManager;