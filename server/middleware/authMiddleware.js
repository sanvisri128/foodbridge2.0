// JWT authentication middleware
// Verifies the Bearer token on protected routes and attaches the user payload to req.user

import jwt from 'jsonwebtoken';

/**
 * protectRoute — Express middleware that blocks unauthenticated requests.
 * Usage: router.get('/protected', protectRoute, handler)
 */
export const protectRoute = (req, res, next) => {
  // Read the Authorization header
  const authHeader = req.headers.authorization;

  // Expect format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token with the app secret; throws if invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded payload (userId, role) to the request object
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

/**
 * requireRole — Middleware factory that restricts a route to a specific role.
 * Usage: router.post('/donate', protectRoute, requireRole('provider'), handler)
 */
export const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({
      message: `Access denied. Only ${role}s can perform this action.`,
    });
  }
  next();
};
