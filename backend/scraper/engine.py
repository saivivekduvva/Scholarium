import json
import os
from urllib.parse import urlparse
from .fetcher import Fetcher
from .parser import Parser
from .robots_handler import RobotsHandler
from .utils import Deduplicator, Exporter

class ScraperEngine:
    def __init__(self, config_path):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
            
        self.fetcher = Fetcher(self.config['user_agent'])
        self.parser = Parser()
        self.robots = RobotsHandler(self.config['user_agent'])
        self.deduplicator = Deduplicator()
        self.results = []

    def run(self, urls):
        count = 0
        max_pages = self.config.get('max_pages', 10)
        
        for url in urls:
            if count >= max_pages:
                break
                
            # 1. Domain Check
            domain = urlparse(url).netloc.replace('www.', '')
            if domain not in self.config['allowed_domains']:
                print(f"Skipping {url}: Domain not allowed.")
                continue
                
            # 2. Duplicate Detection
            if not self.deduplicator.is_new(url):
                print(f"Skipping {url}: Already visited.")
                continue
                
            # 3. Robots.txt Check
            if not self.robots.is_allowed(url):
                print(f"Skipping {url}: Disallowed by robots.txt.")
                continue
                
            # 4. Fetch (with polite delay)
            delay = self.config['request_delay'].get(domain, 0)
            print(f"Fetching {url} (delay: {delay}s)...")
            html = self.fetcher.fetch(url, delay=delay)
            
            if html:
                # 5. Parse
                data = self.parser.parse(html, url)
                self.results.append(data)
                count += 1
                print(f"Successfully scraped: {data['title']}")
                
        # 6. Export
        if self.results:
            out_folder = self.config['output_folder']
            json_file = Exporter.to_json(self.results, out_folder, "scraped_results")
            csv_file = Exporter.to_csv(self.results, out_folder, "scraped_results")
            print(f"\nScraping complete! Results saved to:\n- {json_file}\n- {csv_file}")
        else:
            print("No data collected.")
