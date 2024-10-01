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

setInterval(async () => {
  console.log("servers", servers);
  for (const server of servers) {
    try {
      const response = await axios.get(`${server}/requests`);
      requestCounts.set(server, response.data);
    } catch (error) {
      console.error(`Error fetching request count from ${server}:`, error.message);
    }
  }
}, 60000);

const balanceLoad = async (req, res, next) => {
  if (servers.length > 0) {
    let leastConnectedServer = servers[0];
    let minRequests = requestCounts.get(leastConnectedServer) || Infinity;

    for (const [server, count] of requestCounts) {
      if (count < minRequests) {
        leastConnectedServer = server;
        minRequests = count;
      }
    }
    console.log(`req.url: ${leastConnectedServer}${req.url}`);
    console.log(`req.body: ${req.body}`);
    console.log(`req.method: ${req.method}`);
    try {
      const response = await axios({
        method: req.method,
        url: `${leastConnectedServer}${req.url}`,
        data: req.body,
        headers: req.headers,
      });

      requestCounts.set(leastConnectedServer, requestCounts.get(leastConnectedServer) + 1);

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

      res.send(response.data);
    } catch (error) {
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

      res.status(503).send("No servers available");
    }
  } else {
    res.status(503).send("No servers available");
  }
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
