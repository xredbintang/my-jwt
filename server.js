const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const authroute = require('./routes/authrouter')

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/api',authroute)



app.get('/api', (req, res) => {
    res.json({ message: 'API is running, boss!' });
});

app.get('/boi', (req, res) => {
  res.json({ message: 'BOY!' });
});

app.get('/yiax', (req, res) => {
  res.json({ message: 'balawa' });nb
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server nyala di http://localhost:${PORT}`);
});
