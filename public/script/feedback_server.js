// feedback_server.js - Standalone server just for feedback
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Feedback server is running!' });
});

// Simple login (no database, no JWT)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Accept any login for testing
    res.json({
        success: true,
        token: 'test-token-' + Date.now(),
        user: {
            id: 'test-id',
            email: email,
            name: 'Test User',
            role: 'Admin'
        }
    });
});

// Feedback endpoint (no auth for testing)
app.get('/api/feedback', (req, res) => {
    res.json([
        {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            message: "This is test feedback from the simple server.",
            type: "general",
            rating: 5,
            status: "new",
            createdAt: new Date().toISOString()
        }
    ]);
});

app.listen(3001, () => {
    console.log('✅ Feedback server running on http://localhost:3001');
});