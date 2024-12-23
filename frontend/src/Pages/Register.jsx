import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, Container, Alert, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Register.css';
import logo from '../assets/register-logo.jpg';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [userType, setUserType] = useState('student');
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }
        formData.append('userType', userType);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', formData);
            if (response.status === 200) {
                setSuccess(true);
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.msg || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
          <div className="register-image">
              <div className="image-overlay">
                  <motion.div 
                      className="image-content"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                  >
                      <h2>Welcome to Our Learning Platform</h2>
                      <p>Join thousands of students and teachers in our growing educational community</p>
                      <div className="feature-highlights">
                          <div className="highlight-item">
                              <span className="highlight-number">1000+</span>
                              <span className="highlight-text">Active Students</span>
                          </div>
                          <div className="highlight-item">
                              <span className="highlight-number">100+</span>
                              <span className="highlight-text">Expert Teachers</span>
                          </div>
                          <div className="highlight-item">
                              <span className="highlight-number">50+</span>
                              <span className="highlight-text">Courses</span>
                          </div>
                      </div>
                  </motion.div>
              </div>
              <img src={logo} alt="Education" />
          </div>
            <motion.div 
                className="register-form-container"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="register-form">
                    <Typography variant="h4" className="register-title">Create Account</Typography>
                    <Typography variant="body2" className="register-subtitle">
                        Join our education platform today!
                    </Typography>

                    {error && <Alert severity="error" className="alert-message">{error}</Alert>}
                    {success && <Alert severity="success" className="alert-message">Registration successful!</Alert>}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    
                      <div className="profile-upload">
                            <label htmlFor="profile-image" className="upload-label">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile Preview" className="image-preview" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <span>Upload Profile Picture</span>
                                    </div>
                                )}
                            </label>
                            <input
                                type="file"
                                id="profile-image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden-input"
                            />
                        </div>

                        <FormControl fullWidth className="input-field">
                            <InputLabel>I am a</InputLabel>
                            <Select
                                value={userType}
                                label="I am a"
                                onChange={(e) => setUserType(e.target.value)}
                            >
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Full Name"
                            variant="outlined"
                            fullWidth
                            className="input-field"
                            {...register('name', { required: 'Name is required' })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />

                        <TextField
                            label="Email Address"
                            type="email"
                            variant="outlined"
                            fullWidth
                            className="input-field"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            className="input-field"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Create Account'}
                        </Button>
                        <div className="register-link">
                            <Typography variant="body2">
                                Already an account?{' '}
                                <Link to="/login" className="link">
                                    Login to yourAccount
                                </Link>
                            </Typography>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
