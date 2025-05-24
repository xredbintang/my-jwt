const express = require("express");
const router = express.Router();
const authControll = require('../controllers/auth');

router.post('/register', authControll.register);
router.post('/login', authControll.login);
router.post('/refresh-token', authControll.refreshToken);
router.post('/logout', authControll.logout);

module.exports = router;