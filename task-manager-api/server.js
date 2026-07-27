import express from 'express';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for frontend client
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// 1. Request Logging Middleware (logs method, URL, and timestamp for every request)
app.use((req, res, next) => {
  console.log(`[LOG] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// 2. Supplementary Middleware: Content-Type validation for POST/PUT requests
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Unsupported Media Type',
        message: "Content-Type must be 'application/json'"
      });
    }
  }
  next();
};
app.use(validateContentType);

// In-memory array for tasks
let tasks = [
  { id: 1, title: 'Learn React Hooks', completed: true },
  { id: 2, title: 'Integrate GitHub API', completed: true },
  { id: 3, title: 'Build Express REST API', completed: false }
];

// Helper: Validation middleware for Task ID format
const validateTaskId = (req, res, next) => {
  const taskId = parseInt(req.params.id, 10);
  if (isNaN(taskId)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Task ID must be a valid integer.'
    });
  }
  req.taskId = taskId;
  next();
};

// CRUD Route 1: GET /tasks (Retrieve all tasks, supports search filtering)
app.get('/tasks', (req, res) => {
  const { search } = req.query;
  if (search) {
    const filteredTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase())
    );
    return res.status(200).json(filteredTasks);
  }
  res.status(200).json(tasks);
});

// CRUD Route 2: GET /tasks/:id (Retrieve a single task by ID)
app.get('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find(t => t.id === req.taskId);
  if (!task) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${req.taskId} not found.`
    });
  }
  res.status(200).json(task);
});

// CRUD Route 3: POST /tasks (Create a new task)
app.post('/tasks', (req, res, next) => {
  try {
    const { title, completed } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Task title is required and must be a non-empty string.'
      });
    }

    // Force an error simulation if the title is "trigger-error" (to test global error handler)
    if (title === 'trigger-error') {
      throw new Error('Simulated internal server error for global handler test.');
    }

    const newTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      title: title.trim(),
      completed: completed === true || completed === 'true'
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    next(err); // pass error to the global handler
  }
});

// CRUD Route 4: PUT /tasks/:id (Update a task)
app.put('/tasks/:id', validateTaskId, (req, res, next) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.taskId} not found.`
      });
    }

    const { title, completed } = req.body;

    // Validate if title is provided and invalid
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Task title must be a non-empty string.'
      });
    }

    if (title !== undefined) {
      tasks[taskIndex].title = title.trim();
    }
    if (completed !== undefined) {
      tasks[taskIndex].completed = completed === true || completed === 'true';
    }

    res.status(200).json(tasks[taskIndex]);
  } catch (err) {
    next(err);
  }
});

// CRUD Route 5: DELETE /tasks/:id (Delete a task)
app.delete('/tasks/:id', validateTaskId, (req, res, next) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.taskId} not found.`
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.status(200).json({
      message: 'Task successfully deleted.',
      task: deletedTask
    });
  } catch (err) {
    next(err);
  }
});

// 3. Custom 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.url} does not exist.`
  });
});

// 4. Global Error Handling Middleware (must be defined last)
app.use((err, req, res, next) => {
  console.error('[ERROR] Global handler caught:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server.'
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Task Manager Server running on port ${PORT}`);
});

export default server; // Exporting for testing/verification purposes
