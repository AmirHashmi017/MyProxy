const corsAnywhere = require('cors-anywhere');

const host = '0.0.0.0';
const port = process.env.PORT || 8080;

corsAnywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, () => {
    console.log(`CORS Anywhere proxy running on ${host}:${port}`);
});