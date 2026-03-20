const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
// Is line ko sabse upar rakhna zaroori hai, ye system ko IPv4 force karta hai
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); 
require('dotenv').config();

const app = express();

// ==========================================
// 🚀 ROBUST CORS SETUP
// ==========================================
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:5173';

app.use(cors({
    origin: [frontendUrl, 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));

app.use(express.json()); 

// ==========================================
// 📧 BULLETPROOF NODEMAILER SETUP (IPv6 Bypassed)
// ==========================================
const transporter = nodemailer.createTransport({
    // 'service: gmail' hata kar humne explicit host aur port daala hai
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL use karne ke liye
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        // Yeh Render ke server ko unauthorized block karne se rokega
        rejectUnauthorized: false
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill all fields' });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, 
            subject: `Portfolio: New Message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #4f46e5;">New Contact Request</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4f46e5;">${message}</p>
                </div>
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
    console.log(`CORS allowed for: ${frontendUrl}`);
});