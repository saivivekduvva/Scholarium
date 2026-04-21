import sys
import os

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper.engine import ScraperEngine

def main():
    # Initialize the engine with config
    config_file = os.path.join(os.path.dirname(__file__), "config.json")
    scraper = ScraperEngine(config_file)
    
    # Ready-to-run examples as requested
    targets = [
        "https://www.geeksforgeeks.org/python-programming-language/",
        "https://www.programiz.com/python-programming/first-program"
    ]
    
    print("Starting Scholarium Content Scraper...")
    print("-" * 40)
    
    scraper.run(targets)

if __name__ == "__main__":
    main()
