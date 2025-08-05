const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const axios = require("axios");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

app.use(express.static("public")); // for serving frontend

// Broadcast to all connected clients
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Poll stock data every 30 seconds and broadcast
setInterval(async () => {
  try {
    const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
            function: "GLOBAL_QUOTE",
            symbol: "AAPL", // or any other stock symbol
            apikey: process.env.ALPHA_VANTAGE_API_KEY,
        },
    });

console.log(JSON.stringify(response.data, null, 2));

    const price = response.data["Global Quote"]["05. price"];
    broadcast({ symbol: "AAPL", price });
  } catch (err) {
    console.error("API Error:", err.message);
  }
}, 3600000); // 1 hour

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
