const express = require('express');
const axios = require('axios');

const app = express();
const port = 5000;

let servers = [];

app.use(express.json());

app.post('/register', (req, res) => {
    const { server } = req.body;
    if (!servers.includes(server)) {
        servers.push(server);
        axios.post('http://localhost:5000/register', { server })
            .then(() => res.sendStatus(200))
            .catch(error => res.status(500).send(error.message));
    } else {
        res.sendStatus(200);
    }
});

app.get('/servers', (req, res) => {
    res.json(servers);
});

app.listen(port, () => {
    console.log(`Discovery Server running on port ${port}`);
});