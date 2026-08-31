import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Task from './models/Task.js';

// Load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5050;

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('[ERROR] MONGO_URI or MONGODB_URI is not defined in .env file.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('[DB] Connected to MongoDB database successfully.'))
  .catch((err) => {
    console.error('[DB] MongoDB connection error:', err.message);
    process.exit(1);
  });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[LOG] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Content-Type validation middleware for POST/PUT requests
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

// ─── CRUD Routes using Mongoose Model ─────────────────────────────────────────

// GET / - Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Task Management API with MongoDB & Mongoose is running.',
    status: 'online',
    endpoints: {
      getAllTasks: 'GET /tasks',
      getTaskById: 'GET /tasks/:id',
      createTask: 'POST /tasks',
      updateTask: 'PUT /tasks/:id',
      deleteTask: 'DELETE /tasks/:id'
    }
  });
});

// GET /tasks - Retrieve all tasks (supports title search filtering)
app.get('/tasks', async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - Retrieve a single task by ID (with 404 JSON handling)
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Invalid Task ID format: ${id}. Must be a valid 24-character hexadecimal ObjectId.`
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${id} not found.`
      });
    }

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Create a new task (enforces schema validation & pre-save hook)
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    // Trigger error simulation if requested for testing global error handler
    if (title === 'trigger-error') {
      throw new Error('Simulated internal server error for testing.');
    }

    // Instantiate model and call save() so pre-save hooks execute
    const task = new Task({
      title,
      description,
      completed,
      priority
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - Update an existing task by ID
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Invalid Task ID format: ${id}. Must be a valid 24-character hexadecimal ObjectId.`
      });
    }

    const { title, description, completed, priority } = req.body;
    const updateFields = {};

    if (title !== undefined) updateFields.title = typeof title === 'string' ? title.trim() : title;
    if (description !== undefined) updateFields.description = description;
    if (completed !== undefined) updateFields.completed = completed;
    if (priority !== undefined) updateFields.priority = priority;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${id} not found.`
      });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id - Delete a task by ID
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Invalid Task ID format: ${id}. Must be a valid 24-character hexadecimal ObjectId.`
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${id} not found.`
      });
    }

    res.status(200).json({
      message: 'Task successfully deleted.',
      task: deletedTask
    });
  } catch (err) {
    next(err);
  }
});

// ─── Error Handlers ───────────────────────────────────────────────────────────

// Custom 404 Handler for non-existent route endpoints
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.url} does not exist.`
  });
});

// Global Error Handling Middleware (formats Mongoose validation errors as structured JSON)
app.use((err, req, res, next) => {
  console.error('[ERROR] Global Error Handler Caught:', err.message);

  // Mongoose Validation Error (e.g. required field missing, enum constraint violation)
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Schema validation failed for the request payload.',
      details
    });
  }

  // Mongoose Cast Error (invalid ObjectId cast)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Invalid format for field '${err.path}': ${err.value}`
    });
  }

  // Fallback 500 Internal Server Error
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`Task Manager Server running on port ${PORT}`);
});

export default server;
