const express = require('express');
const {PrismaClient} = require('@prisma/client');
const { isAuthenticated } = require('../middleware/auth');
const { route } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient;

router.get('/user-profile', isAuthenticated, async (req,res) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({
            where:{id: userId},
            select:{
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if(!user){
            res.status(401).json({
                message: 'User not be found!'
            });
        }

        res.json({user});
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
});

router.put('/user-profile', isAuthenticated, async (req,res) => {
    try {
        const userId = req.userId;
        const {name} = req.body;
        
        const updatedUser = await prisma.user.update({
            where:{id: userId},
            data:{name},
            select:{
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json({message: 'Profile updated successfully', user: updatedUser});

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
});

module.exports = router;