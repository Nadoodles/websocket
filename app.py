from flask import Flask, request, jsonify
import yfinance as yf
import pandas as pd
import ta

app = Flask(__name__)

@app.route("/analyze", methods=["POST"])
def analyze():
    symbol = request.json["symbol"]
    data = yf.download(symbol, period="6mo", interval="1d")

    # Add technical indicators
    data["sma"] = ta.trend.sma_indicator(data["Close"], window=14)
    data["rsi"] = ta.momentum.RSIIndicator(data["Close"], window=14).rsi()

    latest = data.iloc[-1]
    price = latest["Close"]
    sma = latest["sma"]
    rsi = latest["rsi"]

    signal = "HOLD"
    if price > sma and rsi < 70:
        signal = "BUY"
    elif price < sma and rsi > 70:
        signal = "SELL"

    return jsonify({
        "symbol": symbol,
        "price": round(price, 2),
        "sma": round(sma, 2),
        "rsi": round(rsi, 2),
        "signal": signal
    })

if __name__ == "__main__":
    app.run(port=5001)
