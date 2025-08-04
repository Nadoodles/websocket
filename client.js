        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = event => {
            const stockData = JSON.parse(event.data);
            document.getElementById('stockPrice').innerText = `${stockData.symbol}: $${stockData.price} (${stockData.timestamp})`;
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        ws.onerror = error => {
            console.error('WebSocket error:', error);
        };