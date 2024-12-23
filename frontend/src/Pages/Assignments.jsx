import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    LinearProgress
} from '@mui/material';
import { format } from 'date-fns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Assessment = () => {
    const { courseId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submitStatus, setSubmitStatus] = useState({ show: false, severity: 'success', message: '' });
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchAssignments();
        fetchCourseName();
    }, [courseId]);

    const fetchAssignments = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/assignments/course/${courseId}`, {
                headers: { 'x-auth-token': token }
            });
            const filteredAssignments = response.data.filter(assignment => assignment.course_id === courseId);
            setAssignments(response.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const fetchCourseName = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/courses`, {
                headers: { 'x-auth-token': token }
            });
            const course = response.data.find(course => course._id === courseId);
            setCourseName(course ? course.name : '');
        } catch (error) {
            console.error('Error fetching course name:', error);
            setCourseName('');
        }
    };

    const handleSubmitOpen = (assignment) => {
        setSelectedAssignment(assignment);
        setOpenSubmitDialog(true);
    };

    const handleSubmitClose = () => {
        setOpenSubmitDialog(false);
        setSelectedFile(null);
        setUploadProgress(0);
        setSubmitStatus({ show: false, severity: 'success', message: '' });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setSubmitStatus({ show: false, severity: 'success', message: '' });
        } else {
            setSubmitStatus({ show: true, severity: 'error', message: 'Please select a PDF file' });
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setSubmitStatus({ show: true, severity: 'error', message: 'Please select a file to submit' });
            return;
        }

        const formData = new FormData();
        formData.append('submissionFile', selectedFile);

        try {
            await axios.post(
                `http://localhost:5000/api/assignments/submit/${selectedAssignment._id}`, 
                formData,
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                }
            );
            setSubmitStatus({ show: true, severity: 'success', message: 'Assignment submitted successfully!' });
            setTimeout(handleSubmitClose, 2000);
            fetchAssignments();
        } catch (error) {
            let errorMessage = 'Error submitting assignment';
            
            if (error.response) {
                // Server responded with an error
                if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data && typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.status === 413) {
                    errorMessage = 'File size is too large';
                } else if (error.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again';
                } else if (error.response.status === 404) {
                    errorMessage = 'Assignment not found';
                }
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'No response from server. Please check your internet connection';
            } else {
                // Error in request setup
                errorMessage = 'Error setting up the request';
            }

            setSubmitStatus({ 
                show: true, 
                severity: 'error', 
                message: errorMessage
            });
            setUploadProgress(0);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                {courseName} - Assignments
            </Typography>

            <Grid container spacing={3}>
                {assignments.map((assignment) => (
                    <Grid item xs={12} key={assignment._id}>
                        <Card sx={{ '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        {assignment.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Chip 
                                            label={`Due: ${format(new Date(assignment.deadline), 'PPp')}`}
                                            color="primary"
                                        />
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<CloudUploadIcon />}
                                            onClick={() => handleSubmitOpen(assignment)}
                                        >
                                            Submit
                                        </Button>
                                    </Box>
                                </Box>
                                <Typography variant="body1" color="text.secondary">
                                    {assignment.instructions}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {assignments.length === 0 && (
                    <Grid item xs={12}>
                        <Typography variant="body1" textAlign="center">
                            No assignments available for this course yet.
                        </Typography>
                    </Grid>
                )}
            </Grid>

            <Dialog open={openSubmitDialog} onClose={handleSubmitClose}>
                <DialogTitle>Submit Assignment</DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            {selectedAssignment?.name}
                        </Typography>
                        <input
                            accept="application/pdf"
                            style={{ display: 'none' }}
                            id="raised-button-file"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="raised-button-file">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                fullWidth
                                sx={{ mt: 2, mb: 2 }}
                            >
                                Choose PDF File
                            </Button>
                        </label>
                        {selectedFile && (
                            <Typography variant="body2" color="text.secondary">
                                Selected file: {selectedFile.name}
                            </Typography>
                        )}
                        {uploadProgress > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <LinearProgress variant="determinate" value={uploadProgress} />
                            </Box>
                        )}
                        {submitStatus.show && (
                            <Alert severity={submitStatus.severity} sx={{ mt: 2 }}>
                                {submitStatus.message}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSubmitClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Assessment;