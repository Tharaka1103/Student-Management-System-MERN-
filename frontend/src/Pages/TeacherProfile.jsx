import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';

const TeacherProfile = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [teacherData, setTeacherData] = useState(null);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        duration: '',
    });
    const [courseErrors, setCourseErrors] = useState({});
    const [openSubmissionsDialog, setOpenSubmissionsDialog] = useState(false);
    const [selectedAssignmentSubmissions, setSelectedAssignmentSubmissions] = useState(null);

    useEffect(() => {
        fetchTeacherData();
        fetchStudents();
        fetchAssignments();
    }, []);

    const fetchTeacherData = async () => {
        try {
            const token = localStorage.getItem('token');
            const coursesResponse = await axios.get('http://localhost:5000/api/courses/teacher', {
                headers: { 'x-auth-token': token }
            });
            
            const teacherResponse = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { 'x-auth-token': token }
            });

            setTeacherData(teacherResponse.data);
            setCourses(coursesResponse.data || []);
        } catch (error) {
            console.error('Error fetching teacher data:', error);
            setCourses([]);
        }
    };

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/assignments/teacher', {
                headers: { 'x-auth-token': token }
            });
            setAssignments(response.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setAssignments([]);
        }
    };

    const viewPDF = (submission) => {
        const fileUrl = `http://localhost:5000/${submission.submissionFile}`;
    
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', submission.submissionFile.split('/').pop());
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/students', {
                headers: { 'x-auth-token': token }
            });
            setStudents(response.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
        }
    };

    const validateCourseForm = () => {
        let errors = {};

        if (!newCourse.title.trim()) {
            errors.title = "Course title is required";
        }
        if (!newCourse.description.trim()) {
            errors.description = "Description is required";
        }
        if (!newCourse.duration || isNaN(newCourse.duration)) {
            errors.duration = "Valid duration is required";
        }

        setCourseErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddCourse = async () => {
        const isValid = validateCourseForm();
        if (!isValid) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/courses', 
                newCourse,
                {
                    headers: { 'x-auth-token': token }
                }
            );

            setCourses([...courses, response.data]);
            setOpenDialog(false);
            setNewCourse({ title: '', description: '', duration: '' });
            setCourseErrors({});
        } catch (error) {
            console.error('Error adding course:', error);
        }
    };

    const handleViewSubmissions = (assignment) => {
        setSelectedAssignmentSubmissions(assignment);
        setOpenSubmissionsDialog(true);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Teacher Profile
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Profile</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Join Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {teacherData && (
                                            <TableRow>
                                                <TableCell>
                                                    <Avatar 
                                                        src={teacherData.profileImage ? `http://localhost:5000/${teacherData.profileImage}` : null}
                                                        alt={teacherData.name}
                                                    />
                                                </TableCell>
                                                <TableCell>{teacherData.name}</TableCell>
                                                <TableCell>{teacherData.email}</TableCell>
                                                <TableCell>
                                                    {new Date(teacherData.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Typography variant="h6" gutterBottom>
                                My Courses
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setOpenDialog(true)}
                                sx={{ mb: 2 }}
                            >
                                Add New Course
                            </Button>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Students</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Array.isArray(courses) && courses.map((course) => (
                                            <TableRow key={course._id}>
                                                <TableCell>{course.title}</TableCell>
                                                <TableCell>{course.description}</TableCell>
                                                <TableCell>{course.duration}</TableCell>
                                                <TableCell>{course.enrolledStudents?.length || 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Submitted Assignments
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/add-assignment')}
                                sx={{ mb: 2 }}
                            >
                                Add New Assignment
                            </Button>

                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Assignment Name</TableCell>
                                            <TableCell>Course</TableCell>
                                            <TableCell>Deadline</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Array.isArray(assignments) && assignments.map((assignment) => (
                                            <TableRow key={assignment._id}>
                                                <TableCell>{assignment.name}</TableCell>
                                                <TableCell>{assignment.courseName}</TableCell>
                                                <TableCell>
                                                    {new Date(assignment.deadline).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={new Date(assignment.deadline) > new Date() ? 'Active' : 'Expired'}
                                                        color={new Date(assignment.deadline) > new Date() ? 'success' : 'error'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton 
                                                        color="primary"
                                                        onClick={() => handleViewSubmissions(assignment)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Course Title"
                        fullWidth
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        error={!!courseErrors.title}
                        helperText={courseErrors.title}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        error={!!courseErrors.description}
                        helperText={courseErrors.description}
                    />
                    <TextField
                        margin="dense"
                        label="Duration"
                        fullWidth
                        value={newCourse.duration}
                        onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                        error={!!courseErrors.duration}
                        helperText={courseErrors.duration}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddCourse} color="primary">
                        Add Course
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherProfile;
