const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    deadline: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v > new Date();
            },
            message: 'Deadline must be a future date'
        }
    },
    instructions: {
        type: String,
        required: true,
        trim: true
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        submissionFile: {
            type: String,
            required: true
        },
        submissionDate: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Create compound index for efficient queries
assignmentSchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
