const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authController = {
    // Register User
    register: async (req, res) => {
        try {
            const { name, email, password, userType } = req.body;

            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            user = new User({
                name,
                email,
                password,
                userType,
                profileImage: req.file ? req.file.path : null
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id,
                    userType: user.userType
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    },

    // Login User
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            const payload = {
                user: {
                    id: user.id,
                    userType: user.userType
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    },

    // Get User Profile
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    },

    // Get all students
    getStudents: async (req, res) => {
        try {
            const students = await User.find({ userType: 'student' })
                .select('name email profileImage createdAt')
                .sort({ createdAt: -1 });
            res.json(students);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    },

    // Update User Profile
    updateProfile: async (req, res) => {
        try {
            const { name } = req.body;
            const profileImage = req.file ? req.file.path : undefined;

            const updateData = {
                name,
                ...(profileImage && { profileImage })
            };

            const user = await User.findByIdAndUpdate(
                req.user.id,
                { $set: updateData },
                { new: true }
            ).select('-password');

            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
};

module.exports = authController;