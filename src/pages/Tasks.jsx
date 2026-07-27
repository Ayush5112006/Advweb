import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';

export default function TasksPage({ studentInfo, themeColor }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  const API_URL = 'http://localhost:5000/tasks';

  // Fallback Mock Data in case server is not running
  const mockTasks = [
    { id: 1, title: 'Learn React Hooks (Mock)', completed: true },
    { id: 2, title: 'Integrate GitHub API (Mock)', completed: true },
    { id: 3, title: 'Build Express REST API (Mock)', completed: false }
  ];

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks (Status: ${response.status})`);
      }
      const data = await response.json();
      setTasks(data);
      setUsingMockData(false);
    } catch (err) {
      console.warn('Backend server offline. Falling back to mock tasks data.', err.message);
      setTasks(mockTasks);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      if (usingMockData) {
        const newTask = {
          id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
          title: newTaskTitle.trim(),
          completed: false
        };
        setTasks([...tasks, newTask]);
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title: newTaskTitle.trim(), completed: false })
        });
        if (!response.ok) {
          throw new Error('Failed to create task.');
        }
        const createdTask = await response.json();
        setTasks([...tasks, createdTask]);
      }
      setNewTaskTitle('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (id, currentStatus) => {
    try {
      if (usingMockData) {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      } else {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ completed: !currentStatus })
        });
        if (!response.ok) {
          throw new Error('Failed to update task status.');
        }
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      if (usingMockData) {
        setTasks(tasks.filter(t => t.id !== id));
      } else {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error('Failed to delete task.');
        }
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <section className="tasks-page-section">
        <div className="section-container">
          <h1 className="section-title" style={{ color: themeColor }}>Task Manager</h1>
          <p className="tasks-subtitle">
            Interact with the Practical 4 Express API endpoints in real-time.
          </p>

          {usingMockData && (
            <div className="offline-banner">
              ⚠️ Local backend server (port 5000) is offline. Using local mock data. Run <code>npm run server</code> to connect.
            </div>
          )}

          {/* Add Task Form */}
          <form className="add-task-form" onSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="Write a new task..."
              className="task-input"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ backgroundColor: themeColor, borderColor: themeColor }}
              disabled={isSubmitting || !newTaskTitle.trim()}
            >
              Add Task
            </button>
          </form>

          {/* Tasks List */}
          {loading ? (
            <div className="loading-container">
              <span className="spinner" style={{ borderBottomColor: themeColor }}></span>
              <p>Retrieving tasks...</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className={`task-item-card ${task.completed ? 'completed' : ''}`}>
                    <div className="task-item-left" onClick={() => handleToggleTask(task.id, task.completed)}>
                      <span className="task-checkbox" style={{ borderColor: themeColor, backgroundColor: task.completed ? themeColor : 'transparent' }}>
                        {task.completed && '✓'}
                      </span>
                      <span className="task-title-text">{task.title}</span>
                    </div>
                    <button 
                      className="task-delete-btn" 
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-tasks-placeholder">
                  No tasks available. Add some tasks above!
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
