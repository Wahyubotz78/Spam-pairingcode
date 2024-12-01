const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import untuk generate UUID

// Skema untuk User
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email tidak valid']
    },
    password: {
        type: String,
        required: true
    },
    uniqueCode: {
        type: String,
        required: true,
        unique: true // Pastikan kode unik tidak duplikat
    }
}, {
    timestamps: true // Menyimpan waktu pembuatan dan pembaruan
});

// Middleware untuk generate uniqueCode sebelum menyimpan data
userSchema.pre('save', function(next) {
    if (this.isNew) {
        this.uniqueCode = uuidv4();
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;