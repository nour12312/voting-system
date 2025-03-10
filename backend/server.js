require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const csurf = require('csurf');
const socketIO = require('socket.io');
const http = require('http');
const session = require('express-session'); // For req.session
const nodemailer = require('nodemailer'); // Add this line

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(csurf({ cookie: true }));

// Add session middleware
app.use(session({
  secret: 'your-secret-key', // Use a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Step 4: Setup Nodemailer and attach it to req
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Share transporter with routes
app.use((req, res, next) => {
  req.transporter = transporter;
  next();
});

// Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));

// Real-time Results with Socket.IO
io.on('connection', (socket) => {
  socket.on('vote', async (candidate) => {
    // Save vote to database
    // Emit updated results to all clients
    io.emit('results', calculateResults());
  });
});

// Vote Route
app.post('/vote', async (req, res) => {
  const { candidate } = req.body;
  // Save vote to MongoDB
  await Vote.create({ candidate });
  res.json({ message: 'Vote saved' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));