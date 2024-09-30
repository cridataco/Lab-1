const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 4000;
const tokenCount  = [];
let requestsCount = 0;

app.use(express.json());

app.post('/tokens', (req, res) => {
    const { text } = req.body;
    console.log(`Text received: ${text}`);
    const tokens = text.split(' ').length;
    res.json({ tokens });
    tokenCount.push(tokens);
    requestsCount++;
    console.log(`Request count: ${requestsCount}`);
    console.log(`tokens count: ${tokenCount}`);
    res.json({ tokens });
});

app.get('/tokens', (req, res) => {
    res.json(tokenCount);
});

app.get('/requests', (req, res) => {
    res.json(requestsCount);
});

app.listen(port, () => {
    console.log(`Instance running on port ${port}`);
    axios.post('http://localhost:5000/register', { server: `http://localhost:${port}` })
        .then(() => console.log(`Registered with Discovery Server`))
        .catch(error => console.error(`Failed to register: ${error.message}`));
});