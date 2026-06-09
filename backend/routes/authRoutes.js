const express = require('express');
const router = express.Router();
const { checkAuth, registerUser, loginUser, logoutUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/check', checkAuth);  // Always 200 — used on app startup to avoid 401 noise

// Protected route (requires JWT)
router.get('/profile', protect, getUserProfile);

module.exports = router;
