// Must stay first: loads .env before any module reads process.env at import time
import './config/env.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Task from './models/Task.js';
import authRoutes from './routes/authRoutes.js';
import taskEvents, { TASK_CREATED, TASK_DELETED } from './events.js';
import './listeners/taskListeners.js';
import authMiddleware from './middleware/authMiddleware.js';
import {
  validateCreateTask,
  validateUpdateTask
} from './middleware/validationMiddleware.js';
import {
  TASKS_ALL_KEY,
  buildSearchKey,
  escapeRegex,
  getCachedTasks,
  setCachedTasks,
  invalidateTaskListCache,
  CACHE_TTL_SECONDS
} from './cache/taskCache.js';

const app = express();
const PORT = process.env.PORT || 5050;

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('[ERROR] MONGO_URI or MONGODB_URI is not defined in .env file.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('[ERROR] JWT_SECRET is not defined in .env file.');
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
const emitAfterResponse = (res, event, task, context) => {
  res.once('finish', () => {
    setImmediate(() => taskEvents.emit(event, task, context));
  });
};

// ─── CRUD Routes using Mongoose Model ─────────────────────────────────────────

// ─── Public Routes (no authentication required) ───────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Task Management API with MongoDB, Mongoose & JWT Auth is running.',
    status: 'online',
    endpoints: {
      register: 'POST /register',
      login: 'POST /login',
      getAllTasks: 'GET /tasks (Bearer token required)',
      getTaskById: 'GET /tasks/:id (Bearer token required)',
      createTask: 'POST /tasks (Bearer token required)',
      updateTask: 'PUT /tasks/:id (Bearer token required)',
      deleteTask: 'DELETE /tasks/:id (Bearer token required)'
    }
  });
});

// authRoutes already declares the full /register and /login paths
app.use(authRoutes);

// ─── Protected Routes (require a valid JWT) ───────────────────────────────────
app.use('/tasks', authMiddleware);

// GET /tasks - Retrieve all tasks (served from in-memory cache when possible)
app.get('/tasks', async (req, res, next) => {
  const start = Date.now();

  try {
    const { search } = req.query;
    const term = typeof search === 'string' ? search.trim() : '';

    // Unfiltered and filtered requests must never share a cache entry
    const cacheKey = term ? buildSearchKey(term) : TASKS_ALL_KEY;

    const cachedTasks = getCachedTasks(cacheKey);
    if (cachedTasks) {
      const duration = Date.now() - start;
      console.log(`[CACHE] HIT: ${cacheKey} (${cachedTasks.length} task(s))`);
      console.log(`[PERFORMANCE] GET /tasks: ${duration}ms (CACHE HIT)`);
      res.set('X-Cache', 'HIT');
      return res.status(200).json(cachedTasks);
    }

    console.log(`[CACHE] MISS: ${cacheKey} | querying MongoDB...`);

    // Search input is escaped so it is matched literally, not as a regex
    const filter = term ? { title: { $regex: escapeRegex(term), $options: 'i' } } : {};

    // .lean() skips Mongoose document hydration - safe here because the
    // response is only serialised to JSON, no document methods are used
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();

    setCachedTasks(cacheKey, tasks);

    const duration = Date.now() - start;
    console.log(`[CACHE] STORED: ${cacheKey} (${tasks.length} task(s), TTL ${CACHE_TTL_SECONDS}s)`);
    console.log(`[PERFORMANCE] GET /tasks: ${duration}ms (CACHE MISS)`);
    res.set('X-Cache', 'MISS');
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
app.post('/tasks', validateCreateTask, async (req, res, next) => {
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

    // Task list changed - drop cached lists so the next GET is a MISS
    invalidateTaskListCache();

    console.log(`[API] Response sent at ${new Date().toISOString()}`);

    res.status(201).json(savedTask);
    emitAfterResponse(res, TASK_CREATED, savedTask, { actor: req.user });
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - Update an existing task by ID
app.put('/tasks/:id', validateUpdateTask, async (req, res, next) => {
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

    invalidateTaskListCache();

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

    invalidateTaskListCache();

    console.log(`[API] Response sent at ${new Date().toISOString()}`);

    res.status(200).json({
      message: 'Task successfully deleted.',
      task: deletedTask
    });

    emitAfterResponse(res, TASK_DELETED, deletedTask, { actor: req.user });
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
