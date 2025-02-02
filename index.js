const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 8080;

// CORS configuration
app.use(cors({
    origin: 'https://vercel-deployment-client-topaz.vercel.app', // Allow your frontend origin
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Duffel-Version'], // Allow these headers
    credentials: true, // Allow credentials
}));

// Handle preflight requests
app.options('*', cors()); // Enable preflight for all routes

// Proxy endpoint
app.use('/proxy', async (req, res) => {
    try {
        const targetUrl = req.url.slice(1); // Remove the leading slash
        const response = await axios({
            method: req.method,
            url: `https://api.duffel.com${targetUrl}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers['authorization'] || `Bearer ${process.env.DUFFEL_TEST_API_KEY}`,
                'Duffel-Version': 'v2',
            },
            data: req.body,
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Proxy request failed',
            details: error.message,
        });
    }
});

app.listen(port, () => {
    console.log(`Custom proxy running on port ${port}`);
});