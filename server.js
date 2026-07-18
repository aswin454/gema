const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables from .env
dotenv.config();

const { connectDB } = require('./backend/config/db');
const { seedDatabase } = require('./backend/config/seedData');
const { setIoInstance } = require('./backend/services/notificationService');
const apiRoutes = require('./backend/routes/api');

const app = express();
const server = http.createServer(app);

// -------------------------------------------------------------
// Middlewares Setup
// -------------------------------------------------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload directory fallback creation
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Mount routing logic
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// -------------------------------------------------------------
// Socket.IO Communication Integration
// -------------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Inject websocket instance into notification services
setIoInstance(io);

io.on('connection', (socket) => {
  console.log(`Socket Client Connected: ${socket.id}`);

  // User joins their specific private notification room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User socket registered inside channel: ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket Client Disconnected: ${socket.id}`);
  });
});

// -------------------------------------------------------------
// Build / Client Distribution Serving
// -------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 100px;">
        <h1 style="color: #6366f1;">CampusOne AI Server</h1>
        <p>API Endpoint Server is running in development mode.</p>
        <p>Frontend is running separately via Vite.</p>
      </div>
    `);
  });
}

// -------------------------------------------------------------
// Initialize Server and Database Fallback
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect database
  await connectDB();

  // Run seed sequence
  await seedDatabase();

  server.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(`CampusOne AI Server successfully running on Port: ${PORT}`);
    console.log(`Open API endpoint gateway at http://localhost:${PORT}/api`);
    console.log(`=============================================================`);
  });
};

startServer();
