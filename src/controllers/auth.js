const express = require("express");
const {PrismaClient} = require("@prisma/client");
const {generateAccessToken, generateRefreshToken, verifyRefreshToken} = 
require("../utils/jwt");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

exports.register = async (req,res) => {
     try {
        const { email, password, name } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exist!'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            }
        });

        res.status(201).json({
            message: 'User registered succesfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Registration failed',
            error: error.message
        });
    }
};

exports.login = async (req,res) => {
    try {
        const { email, password } = req.body;
            const user = await prisma.user.findUnique({
            where: { email } 
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshTokenData = generateRefreshToken(user.id);

        await prisma.refreshToken.create({
            data: {
                token: refreshTokenData.token,
                userId: user.id,
                familyId: refreshTokenData.familyId,
                expiresAt: refreshTokenData.expiresAt
            }
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 
        });

        res.cookie('refreshToken', refreshTokenData.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth/refresh-token', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
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
            message: 'Login failed',
            error: error.message
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies?.refreshToken; 
        const refreshTokenFromBody = req.body?.refreshToken;    
        const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token not found'
            });
        }

       
        const payload = verifyRefreshToken(refreshToken); 

        const tokenData = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
                isRevoked: false,
                expiresAt: {
                    gt: new Date()
                },
                userId: payload.userId
            },
            include: {
                user: true
            }
        });

        if (!tokenData) {
            
            if (payload && payload.familyId) {
                await prisma.refreshToken.updateMany({
                    where: { familyId: payload.familyId },
                    data: { isRevoked: true }
                });
            }
            return res.status(401).json({
                message: 'Invalid, expired, or revoked refresh token'
            });
        }

        const { familyId, userId } = tokenData;

        
        await prisma.refreshToken.update({
            where: { id: tokenData.id },
            data: { isRevoked: true }
        });

       
        const newAccessToken = generateAccessToken(userId);
       
        const newRefreshTokenData = generateRefreshToken(familyId);

        await prisma.refreshToken.create({
            data: {
                token: newRefreshTokenData.token,
                userId: userId,
                familyId: familyId, 
                expiresAt: newRefreshTokenData.expiresAt
            }
        });

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });
        res.cookie('refreshToken', newRefreshTokenData.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth/refresh-token',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Token refreshed successfully',
            tokens: { 
                accessToken: newAccessToken,
                refreshToken: newRefreshTokenData.token
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' }); 

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired refresh token.', error: error.message });
        }
        
        res.status(500).json({ message: 'Refresh Token failed', error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies?.refreshToken;
        const refreshTokenFromBody = req.body?.refreshToken;
        const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

        if (refreshToken) {
            await prisma.refreshToken.updateMany({
                where: {
                    token: refreshToken
                },
                data: {
                    isRevoked: true
                }
            });
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' }); 

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            message: 'Logout failed',
            error: error.message
        });
    }
};