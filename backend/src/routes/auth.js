const express = require('express');
const router = express.Router();

// Import controllers and middleware
const { registerTenant , login, me, logout} = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register-tenant', registerTenant);
router.post('/login', login);

// Protected routes (require authMiddleware)
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);

module.exports = router;