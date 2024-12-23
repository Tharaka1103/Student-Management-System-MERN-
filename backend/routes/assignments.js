const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/auth');
const assignmentUpload = require('../middleware/assignmentUpload');

router.post('/', auth, assignmentController.createAssignment);
router.get('/teacher', auth, assignmentController.getTeacherAssignments);
router.post('/submit/:id', 
    auth, 
    assignmentUpload.single('submissionFile'), 
    assignmentController.submitAssignment
);
router.get('/course/:courseId', auth, assignmentController.getCourseAssignments);
router.get('/submission-file/:submissionId', assignmentController.getSubmissionFile);

module.exports = router;
