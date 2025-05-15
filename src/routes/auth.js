const express = require("express");
const bcrypt = require("bcryptjs");
const {PrismaClient} = require('@prisma/client');
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");



const router = express.Router();
const prisma = new PrismaClient();

router.post('/register',async (req,res) =>{
    try {
        const {email, password, name} = req.body;
        const existingUser = await prisma.user.findUnique({
            where: {email},
        });

        if(existingUser){
            return res.status(400).json({
                message:'User already exist!'
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await prisma.user.create({
            data: {
                email,
                password:hashedPassword,
                name,
            }
        });

        res.status(201).json({
            message: 'User registered succesfully',
            user:{
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message:'Registration failed',
            error: error.message
        })    
    }
});

router.post('/login', async(req,res)=>{
    try {
        const {email, password} = req.body;
        const user = await prisma.user.findUnique({
            where:email
        });

        if(!user){
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const accesstoken = generateAccessToken(user.id);
        const refreshTokenData = generateRefreshToken();

        await prisma.refreshToken.create({
            data:{
                token: refreshTokenData.token,
                userId: user.id,
                familyId: refreshTokenData.familyId,
                expiresAt: refreshTokenData.expiresAt
            }
        });

        res.cookie('accessToken',accesstoken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 
        });

        res.cookie('refreshToken', refreshTokenData.token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path:'/api/auth/refresh-token',
            maxAge: 15 * 60 * 1000 
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            tokens: {
                accessToken,
                refreshToken: refreshTokenData.token
            }
            });


    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message:'Login failed',
            error: error.message
        })
    }
})