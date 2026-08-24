import mongoose from 'mongoose';

// ─── Task Schema Definition ──────────────────────────────────────────────────
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
    },
    description: {
      type: String,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority. Allowed values: low, medium, high'
      },
      default: 'medium'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// ─── Pre-Save Middleware Hook ──────────────────────────────────────────────────
// Automatically trim whitespace from title before saving document to database
taskSchema.pre('save', function () {
  if (this.title && typeof this.title === 'string') {
    this.title = this.title.trim();
  }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
