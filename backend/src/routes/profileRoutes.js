import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email nickname picture');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            profile: {
                name: user.name,
                email: user.email,
                nickname: user.nickname || '',
                picture: user.picture || ''
            }
        });
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        res.status(500).json({ message: 'Failed to load profile' });
    }
});

router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { nickname, picture } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.nickname = typeof nickname === 'string' ? nickname.trim() : '';

        if (typeof picture === 'string') {
            user.picture = picture;
        }

        await user.save();

        res.json({
            profile: {
                name: user.name,
                email: user.email,
                nickname: user.nickname,
                picture: user.picture || ''
            }
        });
    } catch (error) {
        console.error('Failed to update profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

export default router;
