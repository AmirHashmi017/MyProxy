const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 8080;

// Enable CORS for all routes
app.use(cors({
    origin: 'https://vercel-deployment-client-topaz.vercel.app', // Allow your frontend origin
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Duffel-Version'], // Allow these headers
    credentials: true, // Allow credentials
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://vercel-deployment-client-topaz.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Duffel-Version');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    res.status(204).end(); // No content for preflight
});

// Proxy endpoint
app.use('/proxy', express.json(), async (req, res) => {
    try {
        const targetUrl = req.url.slice(1); // Remove the leading slash
        const fullUrl = `https://api.duffel.com/${targetUrl}`;

        // Log request details for debugging
        console.log('Request Method:', req.method);
        console.log('Request URL:', fullUrl);
        console.log('Request Headers:', {
            'Content-Type': req.headers['content-type'],
            'Authorization': req.headers['authorization'] || `Bearer ${process.env.DUFFEL_TEST_API_KEY}`,
            'Duffel-Version': 'v2',
        });
        console.log('Request Body:', req.body);

        // Forward the request to Duffel API
        const response = await axios({
            method: req.method,
            url: fullUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers['authorization'] || `Bearer ${process.env.DUFFEL_TEST_API_KEY}`,
                'Duffel-Version': 'v2',
            },
            data: req.body,
        });

        // Send the Duffel API's response back to the client
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);

        // Log the full error response from Duffel API (if available)
        if (error.response) {
            console.error('Duffel API error response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
            });
        }

        // Forward the Duffel API's error response to the client
        res.status(error.response?.status || 500).json({
            error: 'Proxy request failed',
            details: error.response?.data || error.message,
        });
    }
});

app.listen(port, () => {
    console.log(`Custom proxy running on port ${port}`);
});