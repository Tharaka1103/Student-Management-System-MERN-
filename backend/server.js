require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');

const app = express();
const uploadsDir = path.join(__dirname, 'uploads', 'assignments');
fs.mkdirSync(uploadsDir, { recursive: true });
// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/payment', require('./routes/payment'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
