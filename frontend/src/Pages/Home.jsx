import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaChalkboardTeacher, FaUserGraduate, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import '../Styles/Home.css'

const Home = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUser(decoded.user);
        }
    }, []);

    const handleProfileClick = () => {
        if (user.userType === 'teacher') {
            navigate('/tprofile');
        } else {
            navigate('/sprofile');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="home">
            {user && (
                <div className="user-controls">
                    <motion.div 
                        className="profile-icon-wrapper"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleProfileClick}
                    >
                        {user.profileImage ? (
                            <img 
                                src={`http://localhost:5000/${user.profileImage}`} 
                                alt="Profile" 
                                className="profile-image"
                            />
                        ) : (
                            <FaUserCircle className="default-profile-icon" />
                        )}
                    </motion.div>
                    <button 
                        className="logout-button"
                        onClick={handleLogout}
                        variant="contained"
                    >
                        Logout
                    </button>
                </div>
            )}
            <section className="hero-section">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1>Welcome to Student Management System</h1>
                    <p>Effortlessly Manage Students, Courses, and Teachers</p>
                    {user && (
                                            <h2 className="welcome-message">
                                                {user.userType === 'student' ? 'Welcome Student!' : 'Welcome Teacher!'}
                                            </h2>
                                        )}
                    
                    {!user && (
                        <div className="button-group">
                            <motion.button
                                className="btn btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.location.href = '/register'}
                            >
                                Get Started
                            </motion.button>
                            <motion.button
                                className="btn btn-outline"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.location.href = '/login'}
                            >
                                Login
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </section>

            <section className="features-container">
                <motion.h2 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Our Features
                </motion.h2>
                <div className="features-grid">
                {[
                    {
                        icon: <FaBook size={50} />,
                        title: "Course Enrollment",
                        text: "Students can enroll in courses with assigned teachers and manage their curriculum.",
                        buttonText: "Browse Courses",
                        link: "/course"
                    }
                ].map((feature, index) => (
                    <motion.div
                        key={index}
                        className="feature-card"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        viewport={{ once: true }}
                    >
                        <div className="feature-icon-wrapper">
                            {feature.icon}
                        </div>
                        <h3>{feature.title}</h3>
                        <p>{feature.text}</p>
                        <motion.button
                            className="btn feature-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = feature.link}
                        >
                            {feature.buttonText}
                        </motion.button>
                    </motion.div>
                ))}

                </div>
            </section>

            <section className="cta-section">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h3>Ready to get started?</h3>
                    <p>Join us today and experience the future of student management.</p>
                    {!user && (
                        <motion.button
                            className="btn btn-primary animate-pulse"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/register'}
                        >
                            Sign Up Now
                        </motion.button>
                    )}
                </motion.div>
            </section>
        </div>
    );
};

export default Home;