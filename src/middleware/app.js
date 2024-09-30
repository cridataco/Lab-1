require('dotenv').config( {path: '../../.env'} );

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.MIDDLEWAREPORT;

app.use(bodyParser.json());
let servers = process.env.SERVERS ? process.env.SERVERS.split(',') : [];  // IPS de los pcs o instancias dockerizadas
let requestCounts = new Map();
let serverLogs = new Map();

servers.forEach(server => {
    requestCounts.set(server, 0);
    serverLogs.set(server, []);
});

setInterval(() => {
    requestCounts.forEach((value, key) => {
        requestCounts.set(key, 0);
    });
}, 60000);


app.use(async (req, res, next) => {  //Esto es el baleanceador de cargas con logs y contadores por server en el middleware
    let leastConnectedServer = servers[0]; 
    let minRequests = requestCounts.get(leastConnectedServer);

    for (const [server, count] of requestCounts) {
        if (count < minRequests) {
            leastConnectedServer = server;
            minRequests = count;
        }
    }

    let responseSent = false;

    for (let i = 0; i < servers.length; i++) {
        try {
            const response = await axios({
                method: req.method,
                url: `${leastConnectedServer}${req.url}`,
                data: req.body,
                headers: req.headers,
            });

            requestCounts.set(leastConnectedServer, requestCounts.get(leastConnectedServer) + 1);

            serverLogs.get(leastConnectedServer).push({
                timestamp: new Date(),
                method: req.method,
                url: req.url,
                status: response.status,
                payload: req.body,
                headers: req.headers
            });

            res.send(response.data);
            responseSent = true;
            break; 
        } catch (error) {
            serverLogs.get(leastConnectedServer).push({
                timestamp: new Date(),
                method: req.method,
                url: req.url,
                status: error.response ? error.response.status : 500,
                payload: req.body,
                headers: req.headers,
                error: error.message
            });

            leastConnectedServer = servers[(servers.indexOf(leastConnectedServer) + 1) % servers.length];
        }
    }

    if (!responseSent) {
        res.status(503).send('No servers available');
    }
});

app.post('/register', (req, res) => { // Ruta para registrar severs desde el discovery server
    const { server } = req.body;
    if (!servers.includes(server)) {
        servers.push(server);
        requestCounts.set(server, 0);
        serverLogs.set(server, []);
    }
    res.sendStatus(200);
});

app.post('/tokens', async (req, res) => { 
    const { data } = req.body;
    console.log(`Text received mid: ${data}`);
    try{
        const res = await axios.post(`http://${server}/register`, { data });
        res.sendStatus(200);
    }catch(error){
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.get('/monitor', (req, res) => {  // Se accede a esta ruta para obtener el estado de los servers y graficarlo en el frontend
    const serverData = servers.map(server => ({
        server,
        requests: requestCounts.get(server),
        logs: serverLogs.get(server)
    }));
    res.json(serverData);
});

app.listen(port, () => {
    console.log(`Middleware running on port ${port}`);
});
