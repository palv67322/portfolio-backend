const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json()); // Frontend se aane wale JSON data ko padhne ke liye
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vercel link yahan baad me aayega
    credentials: true
}));

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API Route: Jab koi contact form bharega
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill all fields' });
    }

    try {
        // Aapko aane wala email kaisa dikhega
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Data aapke hi email par aayega
            subject: `Portfolio: New Message from ${name}`,
            html: `
                <h3>New Contact Request</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: 'Message sent successfully!' });

    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send message. Try again later.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});