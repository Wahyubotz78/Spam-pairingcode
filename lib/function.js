const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require("mongoose");
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

require("dotenv").config()

// Konfigurasi
const SECRET_KEY = process.env.JWT_SECRET || 'secret';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defaultDB';

// Koneksi MongoDB
mongoose.connect(MONGODB_URI, {})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Skema Validasi
const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// Middleware Autentikasi
async function authenticate(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Menyimpan data user ke req
        next();
    } catch (err) {
        console.error('Authentication error:', err.message);
        res.status(401).json({ message: 'Invalid token' });
    }
}

// Fungsi Registrasi
async function registerUser(req, res) {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const uniqueCode = uuidv4();

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            uniqueCode,
        });

        await newUser.save();
        const token = jwt.sign({ id: newUser._id, uniqueCode: newUser.uniqueCode }, SECRET_KEY, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data' });
    }
}

// Fungsi Login
async function loginUser(req, res) {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password salah' });
        }

        const token = jwt.sign({ id: user._id, uniqueCode: user.uniqueCode }, SECRET_KEY, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat login' });
    }
}

// Fungsi Logout
function logoutUser(req, res) {
    try {
        res.clearCookie('token');
        res.redirect("/");
    } catch (err) {
        console.error('Logout error:', err.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat logout' });
    }
}

module.exports = {
    authenticate,
    registerUser,
    loginUser,
    logoutUser,
};