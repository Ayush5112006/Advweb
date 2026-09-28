import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 *
 * Flow:
 *   Client Request
 *        ↓
 *   Authorization: Bearer <token>
 *        ↓
 *   Auth Middleware
 *        ↓
 *   JWT Verification
 *        ↓
 *   req.user = decoded payload
 *        ↓
 *   next()
 */
const authMiddleware = (req, res, next) => {
  try {
    // 1. Read the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header is missing. Expected format: Bearer <token>.'
      });
    }

    // 2. Enforce the "Bearer <token>" format
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1].trim()) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Malformed authorization header. Expected format: Bearer <token>.'
      });
    }

    const token = parts[1].trim();

    // 3. Verify the JWT using the secret from the environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded payload to the request object
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    // 5. Continue to the next handler
    next();
  } catch (err) {
    // Distinguish expired tokens from other verification failures
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Your session has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token.'
    });
  }
};

export default authMiddleware;
