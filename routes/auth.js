const express = require('express');
const { authenticate, registerUser, loginUser, logoutUser } = require('../lib/function');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

module.exports = router;