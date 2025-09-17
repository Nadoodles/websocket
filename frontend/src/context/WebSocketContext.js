import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stocks, setStocks] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws/stocks/');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setSocket(ws);
        reconnectAttempts.current = 0;
        
        // Subscribe to all stocks
        ws.send(JSON.stringify({
          type: 'subscribe',
          symbols: ['all']
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'initial_data') {
            const stocksData = {};
            data.data.forEach(stock => {
              stocksData[stock.symbol] = stock;
            });
            setStocks(stocksData);
            setLastUpdate(new Date());
          } else if (data.type === 'stock_update') {
            setStocks(prevStocks => ({
              ...prevStocks,
              [data.data.symbol]: data.data
            }));
            setLastUpdate(new Date());
            
            // Show toast for significant price changes
            if (Math.abs(data.data.change_percent) > 5) {
              const changeText = data.data.change_percent > 0 ? '+' : '';
              toast.success(
                `${data.data.symbol}: $${data.data.latest_price} (${changeText}${data.data.change_percent.toFixed(2)}%)`,
                {
                  duration: 3000,
                  icon: data.data.change_percent > 0 ? '📈' : '📉',
                }
              );
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        } else {
          toast.error('Connection lost. Please refresh the page.');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error occurred');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      toast.error('Failed to connect to server');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socket) {
      socket.close();
    }
  };

  const subscribeToStocks = (symbols) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        symbols: symbols
      }));
    }
  };

  const unsubscribeFromStocks = (symbols) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        symbols: symbols
      }));
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  const value = {
    socket,
    isConnected,
    stocks,
    lastUpdate,
    subscribeToStocks,
    unsubscribeFromStocks,
    reconnect: connect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

