const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection Logic
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Database Connected Successfully! 🎉'))
  .catch((err) => console.log('Database Connection Error: ', err));
  // Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/group', require('./routes/group'));
app.use('/api/expense', require('./routes/expense'));


// Basic Test Route
app.get('/', (req, res) => {
  res.send('Smart Splitter Server is Running! 🚀');
});

// Port Settings
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
