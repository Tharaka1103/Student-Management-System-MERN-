import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { TextField, Button, Alert, CircularProgress } from '@mui/material';
import { FaEdit, FaUser, FaEnvelope, FaGraduationCap } from 'react-icons/fa';
import '../Styles/Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profileImage: null
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { 'x-auth-token': token }
            });
            setUser(response.data);
            setFormData({
                name: response.data.name,
                email: response.data.email
            });
            setPreviewImage(response.data.profileImage ? `http://localhost:5000/${response.data.profileImage}` : '/default-avatar.png');
        } catch (err) {
            setError('Failed to fetch profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                profileImage: file
            });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            if (formData.profileImage) {
                formDataToSend.append('profileImage', formData.profileImage);
                if (user.profileImage) {
                    // Delete old image first
                    await axios.delete(`http://localhost:5000/api/auth/profile/image/${user.profileImage}`, {
                        headers: { 'x-auth-token': token }
                    });
                }
            }

            const response = await axios.put(
                'http://localhost:5000/api/auth/profile',
                formDataToSend,
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setUser(response.data);
            setPreviewImage(response.data.profileImage ? `http://localhost:5000/${response.data.profileImage}` : '/default-avatar.png');
            setSuccess('Profile updated successfully');
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress className="loading-spinner" />;

    return (
        <div className="profile-container">
            <motion.div 
                className="profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="profile-header">
                    <div className="profile-image-container">
                        {isEditing ? (
                            <label htmlFor="profile-image-upload" className="image-upload-label">
                                <img 
                                    src={previewImage}
                                    alt="Profile" 
                                    className="profile-image"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                                <div className="image-overlay">
                                    <FaEdit size={20} />
                                </div>
                                <input
                                    id="profile-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        ) : (
                            <img 
                                src={user.profileImage ? `http://localhost:5000/${user.profileImage}` : '/default-avatar.png'} 
                                alt="Profile" 
                                className="profile-image"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                        )}
                    </div>
                    <div className="button-group">
                        <Button 
                            variant="outlined"
                            onClick={() => {
                                setIsEditing(!isEditing);
                                if (!isEditing) {
                                    setPreviewImage(user.profileImage ? `http://localhost:5000/${user.profileImage}` : '/default-avatar.png');
                                }
                            }}
                            className="edit-button"
                            style={{ marginRight: '10px' }}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </Button>
                        <Button 
                            variant="outlined"
                            color="error"
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {error && <Alert severity="error" className="alert-message">{error}</Alert>}
                {success && <Alert severity="success" className="alert-message">{success}</Alert>}

                <div className="profile-content">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="edit-form">
                            <TextField
                                fullWidth
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="input-field"
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                value={formData.email}
                                disabled
                                className="input-field"
                            />
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                        </form>
                    ) : (
                        <div className="profile-details">
                            <div className="detail-item">
                                <FaUser className="detail-icon" />
                                <div>
                                    <h3>Name</h3>
                                    <p>{user.name}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaEnvelope className="detail-icon" />
                                <div>
                                    <h3>Email</h3>
                                    <p>{user.email}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaGraduationCap className="detail-icon" />
                                <div>
                                    <h3>Role</h3>
                                    <p>{user.userType}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;