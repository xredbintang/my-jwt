const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const ms = require('ms');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// server.js
app.use(cors({
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (misalnya, curl, Postman)
    if (!origin) return callback(null, true);

    // Daftar origin yang diizinkan (Anda bisa menambahkan lebih banyak jika perlu)
    const whitelist = [
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      // Jika Anda memiliki port lain untuk frontend, tambahkan di sini
      // 'http://localhost:3001',
      // 'http://127.0.0.1:3001'
    ];

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Untuk pengembangan, Anda mungkin ingin log origin yang tidak diizinkan
      console.warn(`CORS: Origin ${origin} not allowed.`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


global.ms = ms;


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'JWT Auth API with Express & Prisma' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
