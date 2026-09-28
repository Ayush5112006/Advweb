import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const generateToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

// Strip the password hash before anything is serialised into a response
const toPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email
});

// ─── POST /register ───────────────────────────────────────────────────────────
// Create a new user account, hashing the password with bcrypt
router.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Reject duplicate email addresses (409 Conflict)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with that email address already exists.'
      });
    }

    // The pre-save hook hashes the password before it reaches MongoDB
    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: 'Registration successful',
      user: toPublicUser(user)
    });
  } catch (err) {
    // Race condition: unique index violation if two requests register together
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with that email address already exists.'
      });
    }
    next(err);
  }
});

// ─── POST /login ──────────────────────────────────────────────────────────────
// Authenticate credentials and return a signed JWT
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // +password is required because the schema sets select: false on that field
    const user = await User.findOne({ email }).select('+password');

    // Same generic message for unknown email and wrong password to avoid
    // leaking which email addresses are registered
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: toPublicUser(user)
    });
  } catch (err) {
    next(err);
  }
});

export default router;
