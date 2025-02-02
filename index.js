const corsAnywhere = require('cors-anywhere');

const host = '0.0.0.0';
const port = process.env.PORT || 8080;

const server = corsAnywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2'],
});

// Explicitly handle OPTIONS requests for preflight
server.on('request', (req, res) => {
    if (req.method === 'OPTIONS') {
        // Set CORS headers for preflight requests
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Duffel-Version');
        res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
        res.writeHead(204); // No content for preflight
        res.end();
        return;
    }

    // Forward all other requests to the cors-anywhere handler
    server.emit('request', req, res);
});

server.listen(port, host, () => {
    console.log(`CORS Anywhere proxy running on ${host}:${port}`);
});