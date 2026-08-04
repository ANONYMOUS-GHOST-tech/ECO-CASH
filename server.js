require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const transactionRoutes = require('./routes/transactions');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT"] }
});

app.use(cors());
app.use(express.json());

// 🔥 IMPORTANT: This serves YOUR index.html, script.js, and styles.css
app.use(express.static(__dirname));

// Inject io into routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use('/api/transactions', transactionRoutes);

// Catch-all: if no API route matches, serve YOUR index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('🟢 Web client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔴 Web client disconnected:', socket.id));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Your frontend is being served from here!`);
});
