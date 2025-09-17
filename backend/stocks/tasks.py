from celery import shared_task
from django.core.cache import cache
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import requests
import logging
from .models import Stock, StockPrice
from decouple import config
import time

logger = logging.getLogger(__name__)
channel_layer = get_channel_layer()

# List of 5 stocks to track (matching the original server.js)
STOCK_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]

# Commented out for future use - 500 popular stocks list
# POPULAR_STOCKS = [
#     'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'BRK.B', 'UNH', 'JNJ',
#     'V', 'PG', 'JPM', 'HD', 'MA', 'DIS', 'PYPL', 'NFLX', 'ADBE', 'CMCSA',
#     'PFE', 'TMO', 'ABT', 'PEP', 'KO', 'WMT', 'INTC', 'CSCO', 'MRK', 'ACN',
#     'VZ', 'T', 'CVX', 'DHR', 'ABBV', 'NKE', 'TXN', 'NEE', 'WFC', 'UNP',
#     'QCOM', 'PM', 'RTX', 'HON', 'SPGI', 'LOW', 'IBM', 'AMGN', 'COP', 'INTU',
#     'CAT', 'GS', 'AXP', 'BKNG', 'SYK', 'ADP', 'GILD', 'ISRG', 'VRTX', 'TGT',
#     'ELV', 'MDT', 'ZTS', 'CVS', 'CI', 'ANTM', 'SO', 'DUK', 'AEP', 'EXC',
#     'XOM', 'EOG', 'PXD', 'COP', 'SLB', 'OXY', 'KMI', 'WMB', 'PSX', 'VLO',
#     'MPC', 'HES', 'FANG', 'DVN', 'MRO', 'NOV', 'HAL', 'BKR', 'FTI', 'NBR',
#     'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'USB', 'PNC', 'TFC',
#     'COF', 'SCHW', 'BLK', 'CB', 'AON', 'MMC', 'AIG', 'PRU', 'MET', 'AFL',
#     'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'ADBE', 'CRM',
#     'ORCL', 'INTC', 'CSCO', 'AMD', 'QCOM', 'TXN', 'AVGO', 'MU', 'AMAT', 'LRCX',
#     'KLAC', 'MCHP', 'SNPS', 'CDNS', 'ANSS', 'ADSK', 'CTXS', 'VMW', 'WDAY', 'NOW',
#     'SPLK', 'TEAM', 'OKTA', 'ZM', 'CRWD', 'NET', 'DDOG', 'SNOW', 'PLTR', 'U',
#     'ROKU', 'SQ', 'PYPL', 'SHOP', 'MELI', 'SE', 'BABA', 'JD', 'PDD', 'BIDU',
#     'NIO', 'XPEV', 'LI', 'BILI', 'TME', 'VIPS', 'YMM', 'WB', 'DOYU', 'HUYA',
#     'SPY', 'QQQ', 'IWM', 'VTI', 'VEA', 'VWO', 'BND', 'TLT', 'GLD', 'SLV',
#     'XLF', 'XLK', 'XLE', 'XLI', 'XLV', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE',
#     'ARKK', 'ARKQ', 'ARKW', 'ARKG', 'ARKF', 'ICLN', 'PBW', 'QCLN', 'SMH', 'SOXX',
#     'XLK', 'VGT', 'FTEC', 'IGM', 'IYW', 'QTEC', 'TECL', 'SOXL', 'TQQQ', 'UPRO',
#     'SPXL', 'TMF', 'UDOW', 'UMDD', 'URTY', 'TNA', 'FAS', 'TZA', 'SQQQ', 'SPXS',
#     'SDS', 'QID', 'PSQ', 'DOG', 'SH', 'RWM', 'EWZ', 'EWJ', 'EWG', 'EWU',
#     'EWC', 'EWA', 'EWH', 'EWI', 'EWK', 'EWL', 'EWM', 'EWN', 'EWO', 'EWP',
#     'EWQ', 'EWS', 'EWT', 'EWW', 'EWY', 'EWZ', 'EZA', 'EEM', 'EFA', 'VEA',
#     'VWO', 'VXUS', 'VT', 'ACWI', 'VTEB', 'MUB', 'HYG', 'JNK', 'LQD', 'EMB',
#     'TLT', 'IEF', 'SHY', 'SHM', 'MINT', 'BIL', 'SCHO', 'SCHR', 'SCHM', 'SCHQ',
#     'SPTL', 'SPTS', 'SPTI', 'SPTM', 'SPTN', 'SPTV', 'SPTW', 'SPTX', 'SPTY', 'SPTZ',
#     'SPUA', 'SPUB', 'SPUC', 'SPUD', 'SPUE', 'SPUF', 'SPUG', 'SPUH', 'SPUI', 'SPUJ',
#     'SPUK', 'SPUL', 'SPUM', 'SPUN', 'SPUO', 'SPUP', 'SPUQ', 'SPUR', 'SPUS', 'SPUT',
#     'SPUU', 'SPUV', 'SPUW', 'SPUX', 'SPUY', 'SPUZ', 'SPVA', 'SPVB', 'SPVC', 'SPVD',
#     'SPVE', 'SPVF', 'SPVG', 'SPVH', 'SPVI', 'SPVJ', 'SPVK', 'SPVL', 'SPVM', 'SPVN',
#     'SPVO', 'SPVP', 'SPVQ', 'SPVR', 'SPVS', 'SPVT', 'SPVU', 'SPVV', 'SPVW', 'SPVX',
#     'SPVY', 'SPVZ', 'SPWA', 'SPWB', 'SPWC', 'SPWD', 'SPWE', 'SPWF', 'SPWG', 'SPWH',
#     'SPWI', 'SPWJ', 'SPWK', 'SPWL', 'SPWM', 'SPWN', 'SPWO', 'SPWP', 'SPWQ', 'SPWR',
#     'SPWS', 'SPWT', 'SPWU', 'SPWV', 'SPWW', 'SPWX', 'SPWY', 'SPWZ', 'SPXA', 'SPXB',
#     'SPXC', 'SPXD', 'SPXE', 'SPXF', 'SPXG', 'SPXH', 'SPXI', 'SPXJ', 'SPXK', 'SPXL',
#     'SPXM', 'SPXN', 'SPXO', 'SPXP', 'SPXQ', 'SPXR', 'SPXS', 'SPXT', 'SPXU', 'SPXV',
#     'SPXW', 'SPXX', 'SPXY', 'SPXZ', 'SPYA', 'SPYB', 'SPYC', 'SPYD', 'SPYE', 'SPYF',
#     'SPYG', 'SPYH', 'SPYI', 'SPYJ', 'SPYK', 'SPYL', 'SPYM', 'SPYN', 'SPYO', 'SPYP',
#     'SPYQ', 'SPYR', 'SPYS', 'SPYT', 'SPYU', 'SPYV', 'SPYW', 'SPYX', 'SPYY', 'SPYZ'
# ]

@shared_task
def fetch_stock_data_task():
    """Fetch stock data for all stocks"""
    logger.info("Starting stock data fetch task")
    
    api_key = config('ALPHA_VANTAGE_API_KEY')
    if not api_key:
        logger.error("Alpha Vantage API key not configured")
        return
    
    # Process stocks one by one with 12-second delays to respect rate limits
    # (5 requests per minute = 12 seconds apart)
    for i, symbol in enumerate(STOCK_SYMBOLS):
        try:
            fetch_single_stock_data.delay(symbol)
            # Wait 12 seconds between requests (except for the last one)
            if i < len(STOCK_SYMBOLS) - 1:
                time.sleep(12)
        except Exception as e:
            logger.error(f"Error scheduling fetch for {symbol}: {str(e)}")
    
    logger.info("Stock data fetch task completed")

@shared_task
def fetch_single_stock_data(symbol):
    """Fetch data for a single stock"""
    try:
        api_key = config('ALPHA_VANTAGE_API_KEY')
        
        # Fetch current quote
        quote_url = "https://www.alphavantage.co/query"
        quote_params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': api_key
        }
        
        response = requests.get(quote_url, params=quote_params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if 'Global Quote' in data and data['Global Quote']:
            quote_data = data['Global Quote']
            
            # Get or create stock
            stock, created = Stock.objects.get_or_create(
                symbol=symbol,
                defaults={'name': symbol, 'is_active': True}
            )
            
            # Create price record
            price_data = {
                'price': float(quote_data.get('05. price', 0)),
                'volume': int(quote_data.get('06. volume', 0)),
                'open_price': float(quote_data.get('02. open', 0)),
                'high_price': float(quote_data.get('03. high', 0)),
                'low_price': float(quote_data.get('04. low', 0)),
                'previous_close': float(quote_data.get('08. previous close', 0)),
                'change': float(quote_data.get('09. change', 0)),
                'change_percent': float(quote_data.get('10. change percent', 0).rstrip('%'))
            }
            
            StockPrice.objects.create(stock=stock, **price_data)
            
            # Send WebSocket update
            send_stock_update(stock, price_data)
            
            logger.info(f"Updated {symbol}: ${price_data['price']}")
            
        else:
            logger.warning(f"No data received for {symbol}")
            
    except Exception as e:
        logger.error(f"Error fetching data for {symbol}: {str(e)}")

def send_stock_update(stock, price_data):
    """Send stock update via WebSocket"""
    try:
        from .serializers import StockListSerializer
        
        # Prepare data for WebSocket
        stock_data = {
            'id': stock.id,
            'symbol': stock.symbol,
            'name': stock.name,
            'latest_price': price_data['price'],
            'change_percent': price_data['change_percent']
        }
        
        # Send to WebSocket group
        async_to_sync(channel_layer.group_send)(
            'stock_updates',
            {
                'type': 'stock_update',
                'data': stock_data
            }
        )
    except Exception as e:
        logger.error(f"Error sending WebSocket update for {stock.symbol}: {str(e)}")

@shared_task
def cleanup_old_prices():
    """Clean up old price data to keep database size manageable"""
    from datetime import datetime, timedelta
    
    # Keep only last 7 days of price data
    cutoff_date = datetime.now() - timedelta(days=7)
    
    deleted_count = StockPrice.objects.filter(
        timestamp__lt=cutoff_date
    ).delete()[0]
    
    logger.info(f"Cleaned up {deleted_count} old price records")

