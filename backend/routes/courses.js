const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');

// Create course
router.post('/', auth, courseController.createCourse);

// Get teacher's courses
router.get('/teacher', auth, courseController.getTeacherCourses);

// Update course
router.put('/:id', auth, courseController.updateCourse);

// Delete course
router.delete('/:id', auth, courseController.deleteCourse);

// Enroll in course
router.post('/enroll/:id', auth, courseController.enrollCourse);
// Add this route to courses.js
router.get('/', courseController.getAllCourses);

module.exports = router;
