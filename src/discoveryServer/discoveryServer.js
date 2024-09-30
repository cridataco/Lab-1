const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 5000;

let servers = [];

app.use(express.json());
app.use(cors());

app.post('/register', (req, res) => {
    const { server } = req.body;
    console.log(`Registering server: ${server}`);
    if (!servers.includes(server)) {
        servers.push(server);
        axios.post('http://localhost:5001/register', { server: server })
            .then(() => {
                console.log(`Successfully registered ${server} with Monitor Server`);
                res.sendStatus(200);
            })
            .catch((error) => {
                console.error(`Failed to register ${server} with Monitor Server:`, error.message);
               // res.status(503).send(`Error registering with Monitor Server: ${error.message}`);
            });
    } else {
        console.log(`Server already registered: ${server}`);
        res.sendStatus(200);
    }
});

app.get('/servers', (req, res) => {
    res.json(servers);
});

app.listen(port, () => {
    console.log(`Discovery Server running on port ${port}`);
});
