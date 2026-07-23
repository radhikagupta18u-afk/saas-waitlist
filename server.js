const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

console.log('🔄 Connecting to MongoDB Cloud Database...');

mongoose.connect(process.env.MONGO_URI)
    .catch(err => console.error("⚠️ Connection Error:", err.message));

mongoose.connection.on('connected', () => {
    console.log('💾 SUCCESS: Connected to MongoDB Cloud Database!');
});

// Database schema
const WaitlistSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    submittedAt: { type: Date, default: Date.now }
});

const Waitlist = mongoose.model('Waitlist', WaitlistSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Clean signup endpoint without email engine blocks
app.post('/api/signup', async (req, res) => {
    try {
        const userEmail = req.body.email;
        
        const newSubscriber = new Waitlist({ email: userEmail });
        await newSubscriber.save();
        
        console.log(`💾 Saved permanently to Cloud DB: ${userEmail}`);
        res.sendStatus(200);
    } catch (error) {
        if (error.code === 11000) {
            console.log(`⚠️ Email already exists: ${req.body.email}`);
            res.status(400).send('Email already signed up!');
        } else {
            console.error('❌ Database error:', error.message);
            res.status(500).send('Server error');
        }
    }
});

app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});
