const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8011;

let requestsCount = 0;

app.use(express.json());
app.use(cors());

app.post('/tokens', (req, res) => {
    const { text } = req.body;
    console.log(`Text received: ${text}`);
    const tokens = text.split(' ').length;
    requestsCount++;
    console.log(`Request count: ${requestsCount}`);
    res.json({ tokens });
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
