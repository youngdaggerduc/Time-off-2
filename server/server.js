const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const dotenv = require('dotenv');
   const authRoutes = require('./routes/auth');
   const timeOffRoutes = require('./routes/timeOff');

   dotenv.config();
   const app = express();

   app.use((req, res, next) => {
     console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
     next();
   });

   app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));

   app.use(express.json(), (err, req, res, next) => {
     if (err) {
       console.error('JSON parsing error:', err);
       return res.status(400).json({ message: 'Invalid JSON payload', error: err.message });
     }
     next();
   });

   app.use((req, res, next) => {
     console.log('Request body:', req.body);
     next();
   });

   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('Connected to MongoDB'))
     .catch((err) => console.error('MongoDB connection error:', err));

   app.use('/api/auth', authRoutes);
   app.use('/api/timeoff', timeOffRoutes);

   app.use((err, req, res, next) => {
     console.error('Global error:', err);
     res.status(500).json({ message: 'Server error', error: err.message });
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));