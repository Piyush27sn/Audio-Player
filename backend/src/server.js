import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/GoogleAuth.js';
import profileRoutes from './routes/profileRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import cors from 'cors';
import { verifyToken } from './middleware/auth.js';

dotenv.config();


const app = express();
// Allow very large JSON payloads for base64 images (profile photos)
app.use(express.json({ limit: '20mb' }));
// CORS: allow all origins for dev, or restrict as needed
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use('/uploads', express.static('uploads'));
app.use('/', authRoutes);

app.use('/api', profileRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send("Backend running");
});

app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "You accessed a protected route!", user: req.user });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});