require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// 🔥 FIX: import the flat routes.js file instead of a folder
const transactionRoutes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT"] }
});

app.use(cors());
app.use(express.json());

// Serves your static files (index.html, script.js, styles.css)
app.use(express.static(__dirname));

// Inject io into routes so they can emit real‑time events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes – all start with /api/transactions
app.use('/api/transactions', transactionRoutes);

// Catch‑all: if no API route matches, serve your index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('🟢 Web client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔴 Web client disconnected:', socket.id));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Your frontend is being served from here!`);
});
