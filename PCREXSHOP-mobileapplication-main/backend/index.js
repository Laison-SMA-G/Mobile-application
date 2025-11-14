// backend/index.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Add MongoDB
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 10000;

// -----------------------------
// Serve frontend build
// -----------------------------
app.use(express.static(path.join(__dirname, '../frontend/build')));

// -----------------------------
// API routes
// -----------------------------
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Add your other API routes here
// app.use('/api/users', require('./routes/users'));

// -----------------------------
// For React Router: serve index.html on all other routes
// -----------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// -----------------------------
// Connect to MongoDB
// -----------------------------
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
