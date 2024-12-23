import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, TextField, Button, Box, FormControl, 
    InputLabel, Select, MenuItem, Typography, Paper,
    FormHelperText 
} from '@mui/material';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

const AddAssignment = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const token = localStorage.getItem('token');
    const [error, setError] = useState(null);
    
    // Add validation states
    const [validationErrors, setValidationErrors] = useState({
        name: '',
        courseId: '',
        deadline: '',
        instructions: ''
    });

    const [assignmentData, setAssignmentData] = useState({
        name: '',
        courseId: '',
        deadline: new Date(),
        instructions: ''
    });

    // Validation rules
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Name validation
        if (!assignmentData.name.trim()) {
            tempErrors.name = 'Assignment name is required';
            isValid = false;
        } else if (assignmentData.name.length < 3) {
            tempErrors.name = 'Assignment name must be at least 3 characters';
            isValid = false;
        } else if (assignmentData.name.length > 50) {
            tempErrors.name = 'Assignment name cannot exceed 50 characters';
            isValid = false;
        }

        // Course validation
        if (!assignmentData.courseId) {
            tempErrors.courseId = 'Please select a course';
            isValid = false;
        }

        // Deadline validation
        const currentDate = new Date();
        if (!assignmentData.deadline) {
            tempErrors.deadline = 'Deadline is required';
            isValid = false;
        } else if (assignmentData.deadline < currentDate) {
            tempErrors.deadline = 'Deadline cannot be in the past';
            isValid = false;
        }

        // Instructions validation
        if (!assignmentData.instructions.trim()) {
            tempErrors.instructions = 'Instructions are required';
            isValid = false;
        } else if (assignmentData.instructions.length < 10) {
            tempErrors.instructions = 'Instructions must be at least 10 characters';
            isValid = false;
        } else if (assignmentData.instructions.length > 1000) {
            tempErrors.instructions = 'Instructions cannot exceed 1000 characters';
            isValid = false;
        }

        setValidationErrors(tempErrors);
        return isValid;
    };

    useEffect(() => {
        fetchTeacherCourses();
    }, []);

    const fetchTeacherCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/courses/teacher', {
                headers: { 'x-auth-token': token }
            });
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/assignments', 
                assignmentData,
                {
                    headers: { 
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            );
            navigate('/tProfile');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create assignment. Please try again.';
            setError(errorMessage);
            console.error('Error creating assignment:', errorMessage);
        }
    };

    return (
        <Container maxWidth="md">
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Create New Assignment
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        fullWidth
                        label="Assignment Name"
                        value={assignmentData.name}
                        onChange={(e) => {
                            setAssignmentData({...assignmentData, name: e.target.value});
                            setValidationErrors({...validationErrors, name: ''});
                        }}
                        error={!!validationErrors.name}
                        helperText={validationErrors.name}
                        required
                    />
                    
                    <FormControl fullWidth required error={!!validationErrors.courseId}>
                        <InputLabel>Select Course</InputLabel>
                        <Select
                            value={assignmentData.courseId}
                            onChange={(e) => {
                                setAssignmentData({...assignmentData, courseId: e.target.value});
                                setValidationErrors({...validationErrors, courseId: ''});
                            }}
                            label="Select Course"
                        >
                            {courses.map(course => (
                                <MenuItem key={course._id} value={course._id}>
                                    {course.title}
                                </MenuItem>
                            ))}
                        </Select>
                        {validationErrors.courseId && (
                            <FormHelperText>{validationErrors.courseId}</FormHelperText>
                        )}
                    </FormControl>

                    <div className="datepicker-container">
                        <DatePicker
                            selected={assignmentData.deadline}
                            onChange={(date) => {
                                setAssignmentData({...assignmentData, deadline: date});
                                setValidationErrors({...validationErrors, deadline: ''});
                            }}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="MMMM d, yyyy h:mm aa"
                            placeholderText="Select Deadline"
                            required
                            minDate={new Date()}
                            customInput={
                                <TextField
                                    fullWidth
                                    label="Submission Deadline"
                                    error={!!validationErrors.deadline}
                                    helperText={validationErrors.deadline}
                                />
                            }
                        />
                    </div>

                    <TextField
                        fullWidth
                        label="Instructions"
                        multiline
                        rows={4}
                        value={assignmentData.instructions}
                        onChange={(e) => {
                            setAssignmentData({...assignmentData, instructions: e.target.value});
                            setValidationErrors({...validationErrors, instructions: ''});
                        }}
                        error={!!validationErrors.instructions}
                        helperText={validationErrors.instructions}
                        required
                    />

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/teacher-dashboard')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Create Assignment
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default AddAssignment;