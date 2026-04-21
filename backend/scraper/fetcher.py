import requests
import time
import random
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class Fetcher:
    def __init__(self, user_agent):
        self.session = requests.Session()
        self.user_agent = user_agent
        
        # Setup retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

    def fetch(self, url, delay=0):
        if delay > 0:
            time.sleep(delay)
            
        headers = {'User-Agent': self.user_agent}
        try:
            response = self.session.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
