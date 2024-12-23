import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Login.css';
import loginImage from '../assets/login-logo.jpg';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', data);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-image">
                <div className="image-overlay">
                    <motion.div 
                        className="image-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>Welcome Back!</h2>
                        <p>Access your personalized dashboard and continue your learning journey</p>
                        <div className="feature-highlights">
                            <div className="highlight-item">
                                <span className="highlight-number">24/7</span>
                                <span className="highlight-text">Learning Access</span>
                            </div>
                            <div className="highlight-item">
                                <span className="highlight-number">Live</span>
                                <span className="highlight-text">Interactive Sessions</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <img src={loginImage} alt="Learning Platform" />
            </div>

            <motion.div 
                className="login-form-container"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-form">
                    <Typography variant="h4" className="login-title">Sign In</Typography>
                    <Typography variant="body2" className="login-subtitle">
                        Welcome back to your learning journey!
                    </Typography>

                    {error && <Alert severity="error" className="alert-message">{error}</Alert>}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            label="Email Address"
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
                                required: 'Password is required'
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
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>

                        <div className="register-link">
                            <Typography variant="body2">
                                Don't have an account?{' '}
                                <Link to="/register" className="link">
                                    Create Account
                                </Link>
                            </Typography>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
