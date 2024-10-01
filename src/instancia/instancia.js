require("dotenv").config();
const os = require('os');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.BACKEND_PORT || 8014;

let requestsCount = 0;

app.use(express.text());
app.use(express.json());
app.use(cors());

app.post('/tokens', (req, res) => {
    console.log(`Text received: ${req.body}`);
    try{
        const tokens = req.body.split(' ').length;
        requestsCount++;
        console.log(`Request count: ${requestsCount}`);
        res.json({ tokens });
    } catch (error) {
        console.error(`Error processing text: ${error.message}`);
    }
});

app.get('/requests', (req, res) => {
    res.json(requestsCount);
});

app.get('/health', (req, res) => {
    res.send('OK');
});

setInterval(() => {
    console.log(`Resetting request count from ${requestsCount} to 0`);
    console.log(`hostname ${os.hostname()}`);
    console.log(`ip ${getContainerIP()}`);
    requestsCount = 0;
}, 2000);

function getContainerIP() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
}

app.listen(port, () => {
    const containerIP = getContainerIP();
    console.log(`Instance running on port ${port}`);
    axios.post('http://discovery-server:5000/register', { server: `http://127.0.0.1:${port}` })
        .then(() => console.log(`Registered with Discovery Server`))
        .catch(error => console.error(`Failed to register: ${error.message}`));
});
