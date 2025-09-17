from django.core.management.base import BaseCommand
from stocks.models import Stock

class Command(BaseCommand):
    help = 'Initialize the database with the 5 stock symbols'

    def handle(self, *args, **options):
        # Stock symbols from the original server.js
        stock_symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]
        
        # Stock names mapping
        stock_names = {
            "AAPL": "Apple Inc.",
            "GOOGL": "Alphabet Inc. Class A",
            "MSFT": "Microsoft Corporation",
            "AMZN": "Amazon.com Inc.",
            "TSLA": "Tesla Inc."
        }
        
        created_count = 0
        for symbol in stock_symbols:
            stock, created = Stock.objects.get_or_create(
                symbol=symbol,
                defaults={
                    'name': stock_names.get(symbol, symbol),
                    'is_active': True
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created stock: {symbol} - {stock.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Stock already exists: {symbol} - {stock.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully processed {len(stock_symbols)} stocks. Created {created_count} new stocks.')
        )
