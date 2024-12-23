const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', upload.single('profileImage'), authController.register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, authController.getProfile);

// Get all students
router.get('/students', auth, authController.getStudents);



// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('profileImage'), authController.updateProfile);

module.exports = router;