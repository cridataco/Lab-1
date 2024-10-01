require("dotenv").config({ path: "../../.env" });

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.MIDDLEWAREPORT || 5001;

app.use(cors());
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

let servers = [];
let requestCounts = new Map();
let serverLogs = new Map();
const serverHealth = new Map();

setInterval(async () => {
  console.log("servers", servers);
  console.log(serverHealth);
  for (const server of servers) {
    try {
      const response = await axios.get(`${server}/requests`);
      requestCounts.set(server, response.data);
    } catch (error) {
      console.error(`Error fetching request count from ${server}:`, error.message);
    }
  }
}, 2000);

const MAX_RETRIES = 3;
const HEALTH_CHECK_INTERVAL = 30000;

const checkServerHealth = async (server) => {
  try {
    await axios.get(`${server}/health`, { timeout: 5000 });
    serverHealth.set(server, true);
  } catch (error) {
    serverHealth.set(server, false);
  }
};

setInterval(() => {
  servers.forEach(checkServerHealth);
}, HEALTH_CHECK_INTERVAL);

const balanceLoad = async (req, res, next) => {
  const availableServers = servers.filter(server => serverHealth.get(server) !== false);
  
  if (availableServers.length === 0) {
    return res.status(503).send("No servers available");
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const leastConnectedServer = availableServers.reduce((min, server) => 
      (requestCounts.get(server) || 0) < (requestCounts.get(min) || 0) ? server : min
    );

    try {
      console.log(`Gabriel es pvto${leastConnectedServer}${req.url}`)
      const response = await axios({
        method: req.method,
        url: `${leastConnectedServer}${req.url}`,
        data: req.body,
        headers: req.headers,
        timeout: 10000
      });

      requestCounts.set(leastConnectedServer, (requestCounts.get(leastConnectedServer) || 0) + 1);

      if (!serverLogs.has(leastConnectedServer)) {
        serverLogs.set(leastConnectedServer, []);
      }

      serverLogs.get(leastConnectedServer).push({
        timestamp: new Date(),
        method: req.method,
        url: req.url,
        status: response.status,
        payload: req.body,
        headers: req.headers,
      });

      return res.send(response.data);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed for server ${leastConnectedServer}: ${error.message}`);
      
      if (!serverLogs.has(leastConnectedServer)) {
        serverLogs.set(leastConnectedServer, []);
      }

      serverLogs.get(leastConnectedServer).push({
        timestamp: new Date(),
        method: req.method,
        url: req.url,
        status: error.response ? error.response.status : 500,
        payload: req.body,
        headers: req.headers,
        error: error.message,
      });

      serverHealth.set(leastConnectedServer, false);
      const index = availableServers.indexOf(leastConnectedServer);
      if (index > -1) {
        availableServers.splice(index, 1);
      }

      if (availableServers.length === 0) {
        break;
      }
    }
  }
  console.log(serverHealth);
  // Si todos los intentos fallan
  res.status(503).send("No servers available");
};

app.use('/api', balanceLoad);

app.post("/register", (req, res) => {
  const { server } = req.body;
  console.log(`Registering server: ${server}`);
  if (!servers.includes(server)) {
    servers.push(server);
    requestCounts.set(server, 0);
    serverLogs.set(server, []);
    console.log(`Server registered: ${server}`);
    res.sendStatus(200);
  } else {
    console.log(`Server already registered: ${server}`);
    res.sendStatus(200);
  }
});

app.get("/monitor", (req, res) => {
  const serverData = servers.map((server) => ({
    server,
    requests: requestCounts.get(server),
    logs: serverLogs.get(server),
  }));
  res.json(serverData);
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

app.listen(port, () => {
  console.log(`Middleware running on port ${port}`);
});
