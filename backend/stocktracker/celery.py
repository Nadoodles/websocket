import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stocktracker.settings')

app = Celery('stocktracker')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule
app.conf.beat_schedule = {
    'fetch-stock-data': {
        'task': 'stocks.tasks.fetch_stock_data_task',
        'schedule': 60.0,  # Run every minute (5 stocks = 1 minute total)
    },
    'cleanup-old-prices': {
        'task': 'stocks.tasks.cleanup_old_prices',
        'schedule': 86400.0,  # Run daily
    },
}

app.conf.timezone = 'UTC'

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
