const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

const assignmentController = {
    createAssignment: async (req, res) => {
        try {
            const { name, courseId, deadline, instructions } = req.body;
            
            // Enhanced validation
            if (!name?.trim()) {
                return res.status(400).json({ message: 'Assignment name is required' });
            }
            if (!courseId?.trim()) {
                return res.status(400).json({ message: 'Course ID is required' });
            }
            if (!deadline) {
                return res.status(400).json({ message: 'Deadline is required' });
            }
            if (!instructions?.trim()) {
                return res.status(400).json({ message: 'Instructions are required' });
            }
    
            // Validate deadline is in the future
            if (new Date(deadline) <= new Date()) {
                return res.status(400).json({ message: 'Deadline must be in the future' });
            }
    
            // Verify course exists and teacher has access
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
    
            // Create and save assignment
            const assignment = new Assignment({
                name: name.trim(),
                course: courseId,
                courseName: course.title,
                deadline,
                instructions: instructions.trim()
            });
    
            const savedAssignment = await assignment.save();
            res.status(201).json({
                success: true,
                message: 'Assignment created successfully',
                assignment: savedAssignment
            });
        } catch (err) {
            // Specific error handling
            if (err.name === 'ValidationError') {
                return res.status(400).json({ 
                    message: 'Validation error', 
                    errors: Object.values(err.errors).map(e => e.message)
                });
            }
            if (err.name === 'CastError') {
                return res.status(400).json({ message: 'Invalid course ID format' });
            }
            
            res.status(500).json({ 
                message: 'Server error while creating assignment',
                error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
            });
        }
    },
    

    getTeacherAssignments: async (req, res) => {
        try {
            const assignments = await Assignment.find()
                .populate('course', 'title')
                .populate('submissions.student', 'name')
                .sort({ createdAt: -1 });
            res.json(assignments);
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    getCourseAssignments: async (req, res) => {
        try {
            const courseId = req.params.courseId;
            if (!courseId) {
                return res.status(400).json({ message: 'Course ID is required' });
            }

            const assignments = await Assignment.find({ course: courseId })
                .populate('course', 'title')
                .populate('submissions.student', 'name')
                .sort({ createdAt: -1 });
            res.json(assignments);
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    submitAssignment: async (req, res) => {
        try {
            const assignmentId = req.params.id;
            const studentId = req.user.id;
    
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
    
            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                // Clean up uploaded file if assignment not found
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ message: 'Assignment not found' });
            }
    
            const submission = {
                student: studentId,
                submissionFile: req.file.path,
                submissionDate: Date.now()
            };
    
            assignment.submissions.push(submission);
            await assignment.save();
    
            res.status(201).json({ 
                success: true,
                message: 'Assignment submitted successfully',
                submission: {
                    fileName: req.file.filename,
                    submissionDate: submission.submissionDate
                }
            });
        } catch (error) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ message: error.message });
        }
    },
    getSubmissionFile: async (req, res) => {
        try {
            const submissionId = req.params.submissionId;
            
            // Find assignment containing the submission
            const assignment = await Assignment.findOne({
                'submissions._id': submissionId
            }).populate({
                path: 'submissions.student',
                select: 'name email'
            });
    
            if (!assignment) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Assignment submission not found' 
                });
            }
    
            // Get specific submission
            const submission = assignment.submissions.find(
                sub => sub._id.toString() === submissionId
            );
    
            if (!submission) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Submission file not found' 
                });
            }
    
            // Construct file path and verify existence
            const filePath = path.join(__dirname, '..', submission.submissionFile);
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ 
                    success: false,
                    message: 'File not found on server' 
                });
            }
    
            // Send file with proper headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${path.basename(submission.submissionFile)}"`);
            res.sendFile(filePath);
    
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: 'Error retrieving submission file',
                error: error.message 
            });
        }
    }
};

module.exports = assignmentController;
