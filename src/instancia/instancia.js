const os = require('os');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8012;

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
    requestsCount = 0;
}, 60000);

function getContainerIP() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            // Filtrar por IPv4 y excluir direcciones internas (127.0.0.1)
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
}

app.listen(port, () => {
    const containerIP = getContainerIP();
    console.log(`Instance running on port ${port}`);
    axios.post('http://192.168.1.14:5000/register', { server: `http://0.0.0.0:${port}` })
        .then(() => console.log(`Registered with Discovery Server`))
        .catch(error => console.error(`Failed to register: ${error.message}`));
});
