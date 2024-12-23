import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/Course.css';
import { 
    Container, 
    Grid, 
    Card, 
    CardContent, 
    CardMedia, 
    Typography, 
    Button, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaClock, FaChalkboardTeacher } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    // Add state for payment dialog
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchUserProfile();
    }, []);

    // Fetch all courses
    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/courses', {
                headers: { 'x-auth-token': token }
            });
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        }
    };

    // Fetch the logged-in user profile
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { 'x-auth-token': token }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    // Check if the logged-in user is enrolled in the course
    const isEnrolled = (course) => {
        return course.enrolledStudents?.some(student => student._id === user?._id);
    };

    // Handle view course button
    const handleViewCourse = (courseId) => {
        navigate(`/assessment/${courseId}`);
    };
    

    // Update handleEnrollClick
    const handleEnrollClick = (course) => {
        setSelectedCourse(course);
        setOpenPaymentDialog(true);
    };

    // Handle enrollment submission
    const handleEnrollSubmit = async () => {
        try {
            await axios.post(
                `http://localhost:5000/api/courses/enroll/${selectedCourse._id}`,
                {},  // Empty body as user identification is done via token
                {
                    headers: { 'x-auth-token': token }
                }
            );
            setOpenEnrollDialog(false);
            fetchCourses(); // Refresh courses after successful enrollment
        } catch (error) {
            console.error('Error enrolling in course:', error.response?.data?.msg || 'Enrollment failed');
        }
    };

    
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" className="courses-title" gutterBottom>
                Available Courses
            </Typography>

            <Grid container spacing={4}>
                {courses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course._id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="course-card">
                                <CardMedia
                                    component="div"
                                    className="course-card-media"
                                >
                                    <div className="course-card-overlay">
                                        <Typography variant="h5" className="course-card-title">
                                            {course.title}
                                        </Typography>
                                    </div>
                                </CardMedia>
                                <CardContent>
                                    <Typography variant="body1" className="course-description">
                                        {course.description}
                                    </Typography>
                                    
                                    <div className="course-details">
                                        <div className="detail-item">
                                            <FaChalkboardTeacher />
                                            <Typography variant="body2">
                                                {course.teacherName}
                                            </Typography>
                                        </div>
                                        <div className="detail-item">
                                            <FaClock />
                                            <Typography variant="body2">
                                                {course.duration} weeks
                                            </Typography>
                                        </div>
                                        <div className="detail-item">
                                            <FaUserGraduate />
                                            <Typography variant="body2">
                                                {course.enrolledStudents?.length || 0} students
                                            </Typography>
                                        </div>
                                    </div>

                                    {isEnrolled(course) ? (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            className="view-button"
                                            onClick={() => handleViewCourse(course._id)}
                                        >
                                            View Course
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            className="enroll-button"
                                            onClick={() => handleEnrollClick(course)}
                                        >
                                            Enroll Now
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Enrollment Dialog */}
            <Dialog open={openEnrollDialog} onClose={() => setOpenEnrollDialog(false)}>
                <DialogTitle>Enroll in {selectedCourse?.title}</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1">
                        Name: {user?.name}
                    </Typography>
                    <Typography variant="subtitle1">
                        Email: {user?.email}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEnrollDialog(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleEnrollSubmit} variant="contained" color="primary">
                        Confirm Enrollment
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
                <DialogTitle>Complete Payment</DialogTitle>
                <DialogContent>
                    <PaymentForm 
                        course={selectedCourse} 
                        handleEnrollment={() => {
                            handleEnrollSubmit();
                            setOpenPaymentDialog(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default Courses;
