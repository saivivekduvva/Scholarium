import json
import pandas as pd
import os

class Deduplicator:
    def __init__(self):
        self.visited_urls = set()

    def is_new(self, url):
        if url in self.visited_urls:
            return False
        self.visited_urls.add(url)
        return True

class Exporter:
    @staticmethod
    def to_json(data, folder, filename):
        if not os.path.exists(folder):
            os.makedirs(folder)
            
        filepath = os.path.join(folder, f"{filename}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        return filepath

    @staticmethod
    def to_csv(data, folder, filename):
        if not os.path.exists(folder):
            os.makedirs(folder)
            
        filepath = os.path.join(folder, f"{filename}.csv")
        # Flatten paragraphs and code for CSV readability
        flat_data = []
        for item in data:
            flat_item = {
                "title": item.get("title"),
                "url": item.get("url"),
                "paragraphs": " | ".join(item.get("paragraphs", [])),
                "code_snippets": " --- ".join(item.get("code_snippets", [])),
                "metadata": str(item.get("metadata", {}))
            }
            flat_data.append(flat_item)
            
        df = pd.DataFrame(flat_data)
        df.to_csv(filepath, index=False, encoding='utf-8')
        return filepath
