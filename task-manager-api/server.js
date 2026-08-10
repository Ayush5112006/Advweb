import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MongoDB Atlas Connection ──────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('[ERROR] MONGODB_URI is not defined in .env file.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('[DB] Connected to MongoDB Atlas successfully.'))
  .catch((err) => {
    console.error('[DB] MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ─── Mongoose Task Schema & Model ─────────────────────────────────────────────
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

// ─── Middleware ───────────────────────────────────────────────────────────────
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

// ─── CRUD Routes ──────────────────────────────────────────────────────────────

// CRUD Route 1: GET /tasks (Retrieve all tasks, supports search filtering)
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

// CRUD Route 2: GET /tasks/:id (Retrieve a single task by ID)
app.get('/tasks/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Task ID must be a valid MongoDB ObjectId.'
      });
    }
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} not found.`
      });
    }
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// CRUD Route 3: POST /tasks (Create a new task)
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, completed } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Task title is required and must be a non-empty string.'
      });
    }

    // Force an error simulation if the title is "trigger-error"
    if (title.trim() === 'trigger-error') {
      throw new Error('Simulated internal server error for global handler test.');
    }

    const newTask = await Task.create({
      title: title.trim(),
      completed: completed === true || completed === 'true'
    });

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// CRUD Route 4: PUT /tasks/:id (Update a task)
app.put('/tasks/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Task ID must be a valid MongoDB ObjectId.'
      });
    }

    const { title, completed } = req.body;

    // Validate title if provided
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Task title must be a non-empty string.'
      });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (completed !== undefined)
      updateFields.completed = completed === true || completed === 'true';

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} not found.`
      });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// CRUD Route 5: DELETE /tasks/:id (Delete a task)
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Task ID must be a valid MongoDB ObjectId.'
      });
    }

    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.params.id} not found.`
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

// 3. Custom 404 Handler for undefined routes
app.use((req, res) => {
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

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`Task Manager Server running on port ${PORT}`);
});

export default server; // Exporting for testing/verification purposes
