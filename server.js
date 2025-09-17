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

const STOCK_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];

// Function to fetch stock data for a single symbol
const fetchStockData = async (symbol) => {
	try {
		const response = await axios.get(`https://www.alphavantage.co/query`, {
			params: {
				function: "GLOBAL_QUOTE",
				symbol,
				apikey: process.env.ALPHA_VANTAGE_API_KEY,
			},
		});

		const price = response.data["Global Quote"]["05. price"];
		broadcast({ symbol, price, timestamp: new Date().toISOString() });
		console.log(`Updated ${symbol}: $${price}`);
	} catch (err) {
		console.error(`API Error for ${symbol}:`, err.message);
	}
};

// Function to check all stocks with rate limiting
const checkAllStocks = async () => {
	console.log("Starting hourly stock check...");
	
	// Check stocks one by one with 12-second delays to respect rate limits
	for (let i = 0; i < STOCK_SYMBOLS.length; i++) {
		await fetchStockData(STOCK_SYMBOLS[i]);
		
		// Wait 12 seconds between requests (5 requests per minute = 12 seconds apart)
		if (i < STOCK_SYMBOLS.length - 1) {
			await new Promise(resolve => setTimeout(resolve, 12000));
		}
	}
	
	console.log("Completed hourly stock check");
};

// Start the hourly stock checking
// First check after 1 minute, then every hour
setTimeout(() => {
	checkAllStocks(); // Initial check
	setInterval(checkAllStocks, 3600000); // Then every hour
}, 60000); // Wait 1 minute before first check

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
