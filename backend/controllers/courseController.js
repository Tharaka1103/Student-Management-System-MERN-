const Course = require('../models/Course');
const User = require('../models/User');

const courseController = {
    // Create new course
    createCourse: async (req, res) => {
        try {
            const { title, description, duration } = req.body;
            const teacher = await User.findById(req.user.id);

            const course = new Course({
                title,
                description,
                duration,
                teacher: req.user.id,
                teacherName: teacher.name
            });

            await course.save();
            res.json(course);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    },

    // Get teacher's courses
    getTeacherCourses: async (req, res) => {
        try {
            const courses = await Course.find({ teacher: req.user.id })
                .populate('enrolledStudents', 'name email')
                .sort({ createdAt: -1 });
            res.json(courses);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    },

    // Update course
    updateCourse: async (req, res) => {
        try {
            const { title, description, duration } = req.body;
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({ msg: 'Course not found' });
            }

            if (course.teacher.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'Not authorized' });
            }

            course.title = title;
            course.description = description;
            course.duration = duration;

            await course.save();
            res.json(course);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    },

    // Delete course
    deleteCourse: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({ msg: 'Course not found' });
            }

            if (course.teacher.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'Not authorized' });
            }

            await course.remove();
            res.json({ msg: 'Course removed' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    },
    // Add this method to courseController
    getAllCourses: async (req, res) => {
        try {
            const courses = await Course.find()
                .populate('teacher', 'name')
                .populate('enrolledStudents', 'name email')
                .sort({ createdAt: -1 });
            res.json(courses);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    },


    // Enroll in course
    enrollCourse: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({ msg: 'Course not found' });
            }

            if (course.enrolledStudents.includes(req.user.id)) {
                return res.status(400).json({ msg: 'Already enrolled' });
            }

            course.enrolledStudents.push(req.user.id);
            await course.save();

            res.json(course);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
};

module.exports = courseController;
