import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { getTasks, createTask, updateTask, deleteTask } from '../api/api';

export default function TasksPage({ studentInfo, themeColor }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock data indicator state
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState(null);

  // Confirm modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: ''
  });

  // Fallback Mock Data in case server is completely offline
  const mockTasks = [
    { _id: 'mock-1', title: 'Learn React Hooks (Mock)', description: 'Understand useState & useEffect', completed: true, priority: 'high', createdAt: new Date().toISOString() },
    { _id: 'mock-2', title: 'Integrate MongoDB Mongoose (Mock)', description: 'Enforce schema validation', completed: true, priority: 'medium', createdAt: new Date().toISOString() },
    { _id: 'mock-3', title: 'Full Stack Integration (Mock)', description: 'Connect React to Express API', completed: false, priority: 'low', createdAt: new Date().toISOString() }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
      setUsingMockData(false);
    } catch (err) {
      console.warn('Backend server offline or error. Falling back to mock data.', err.message);
      setError(err.message);
      setTasks(mockTasks);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle Creating a Task with Optimistic UI Update
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const titleToSave = newTaskTitle.trim();
    const descriptionToSave = newTaskDescription.trim();
    const priorityToSave = newTaskPriority;

    setIsSubmitting(true);

    if (usingMockData) {
      const mockNewTask = {
        _id: `mock-${Date.now()}`,
        title: titleToSave,
        description: descriptionToSave,
        completed: false,
        priority: priorityToSave,
        createdAt: new Date().toISOString()
      };
      setTasks([mockNewTask, ...tasks]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      showToast('Task created successfully (Mock mode)');
      setIsSubmitting(false);
      return;
    }

    // Create temp optimistic task item
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      _id: tempId,
      title: titleToSave,
      description: descriptionToSave,
      completed: false,
      priority: priorityToSave,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    // Optimistic UI Update: Prepend new task immediately
    setTasks([optimisticTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');

    try {
      const createdTask = await createTask({
        title: titleToSave,
        description: descriptionToSave,
        priority: priorityToSave,
        completed: false
      });

      // Replace optimistic item with server document
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === tempId ? createdTask : t))
      );
      showToast(`Task "${createdTask.title}" created successfully!`, 'success');
    } catch (err) {
      // Revert optimistic update on failure
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== tempId));
      showToast(`Failed to create task: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Completion with Optimistic UI Update
  const handleToggleTask = async (task) => {
    const taskId = task._id || task.id;
    const previousCompleted = task.completed;
    const newCompleted = !previousCompleted;

    // Optimistic Update
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        (t._id || t.id) === taskId ? { ...t, completed: newCompleted } : t
      )
    );

    if (usingMockData) {
      showToast(`Task marked as ${newCompleted ? 'completed' : 'pending'}`);
      return;
    }

    try {
      const updatedTask = await updateTask(taskId, { completed: newCompleted });
      setTasks((prevTasks) =>
        prevTasks.map((t) => ((t._id || t.id) === taskId ? updatedTask : t))
      );
      showToast(`Task updated to ${newCompleted ? 'completed' : 'pending'}`);
    } catch (err) {
      // Rollback on failure
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          (t._id || t.id) === taskId ? { ...t, completed: previousCompleted } : t
        )
      );
      showToast(`Update failed: ${err.message}`, 'error');
    }
  };

  // Open Delete Confirmation Modal
  const promptDeleteTask = (task) => {
    const id = task._id || task.id;
    setDeleteModalState({
      isOpen: true,
      taskId: id,
      taskTitle: task.title
    });
  };

  // Execute Task Deletion with Optimistic UI Update
  const confirmDeleteTask = async () => {
    const taskId = deleteModalState.taskId;
    const taskToDelete = tasks.find((t) => (t._id || t.id) === taskId);
    setDeleteModalState({ isOpen: false, taskId: null, taskTitle: '' });

    if (!taskId) return;

    // Optimistic Update
    setTasks((prevTasks) => prevTasks.filter((t) => (t._id || t.id) !== taskId));

    if (usingMockData) {
      showToast('Task deleted (Mock mode)');
      return;
    }

    try {
      await deleteTask(taskId);
      showToast(`Task "${taskToDelete?.title || ''}" deleted successfully`);
    } catch (err) {
      // Rollback on failure
      if (taskToDelete) {
        setTasks((prevTasks) => [...prevTasks, taskToDelete]);
      }
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-badge priority-high';
      case 'medium':
        return 'priority-badge priority-medium';
      case 'low':
        return 'priority-badge priority-low';
      default:
        return 'priority-badge priority-medium';
    }
  };

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Task Confirmation"
        message={`Are you sure you want to delete "${deleteModalState.taskTitle}"? This action cannot be undone.`}
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteModalState({ isOpen: false, taskId: null, taskTitle: '' })}
        themeColor={themeColor}
      />

      <section className="tasks-page-section">
        <div className="section-container">
          <h1 className="section-title" style={{ color: themeColor }}>Full-Stack Task Manager</h1>
          <p className="tasks-subtitle">
            End-to-End React + Node.js + Express + MongoDB integration with Schema validation and live persistence.
          </p>

          {usingMockData && (
            <div className="offline-banner">
              ⚠️ Express/MongoDB backend (port 5050) is unreachable. Displaying fallback mock data. Ensure server is running (`npm run server`).
            </div>
          )}

          {/* Add Task Form with Title, Description, and Priority */}
          <form className="add-task-form-expanded" onSubmit={handleAddTask}>
            <div className="form-row-main">
              <input
                type="text"
                placeholder="Task title (required)..."
                className="task-input"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <select
                className="priority-select"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="low">Priority: Low</option>
                <option value="medium">Priority: Medium</option>
                <option value="high">Priority: High</option>
              </select>
            </div>
            
            <div className="form-row-secondary">
              <input
                type="text"
                placeholder="Optional description..."
                className="task-description-input"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ backgroundColor: themeColor, borderColor: themeColor }}
                disabled={isSubmitting || !newTaskTitle.trim()}
              >
                {isSubmitting ? 'Saving...' : '+ Add Task'}
              </button>
            </div>
          </form>

          {/* Tasks List */}
          {loading ? (
            <div className="loading-container">
              <span className="spinner" style={{ borderBottomColor: themeColor }}></span>
              <p>Fetching tasks from MongoDB...</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.length > 0 ? (
                tasks.map((task) => {
                  const taskId = task._id || task.id;
                  return (
                    <div 
                      key={taskId} 
                      className={`task-item-card ${task.completed ? 'completed' : ''} ${task.isOptimistic ? 'optimistic-pending' : ''}`}
                    >
                      <div className="task-item-left" onClick={() => handleToggleTask(task)}>
                        <span className="task-checkbox" style={{ borderColor: themeColor, backgroundColor: task.completed ? themeColor : 'transparent' }}>
                          {task.completed && '✓'}
                        </span>
                        <div className="task-text-container">
                          <div className="task-header-line">
                            <span className="task-title-text">{task.title}</span>
                            <span className={getPriorityBadgeClass(task.priority)}>
                              {task.priority || 'medium'}
                            </span>
                          </div>
                          {task.description && (
                            <p className="task-description-text">{task.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        className="task-delete-btn" 
                        onClick={() => promptDeleteTask(task)}
                        title="Delete task"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="no-tasks-placeholder">
                  No tasks found in MongoDB. Add a new task above!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer
        email={studentInfo.email}
        github={studentInfo.github}
        linkedin={studentInfo.linkedin}
        name={studentInfo.name}
      />
    </>
  );
}
