const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const authroute = require('./routes/authrouter');
const cookieParser = require('cookie-parser');
const app = express();
const prisma = new PrismaClient();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use('/api',authroute);
app.use(cookieParser);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server nyala di http://localhost:${PORT}`);
});
