import urllib.robotparser
from urllib.parse import urlparse

class RobotsHandler:
    def __init__(self, user_agent):
        self.user_agent = user_agent
        self.parsers = {}

    def _get_parser(self, domain):
        if domain not in self.parsers:
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(f"https://{domain}/robots.txt")
            try:
                rp.read()
                self.parsers[domain] = rp
            except Exception as e:
                print(f"Warning: Could not read robots.txt for {domain}: {e}")
                return None
        return self.parsers[domain]

    def is_allowed(self, url):
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        path = parsed_url.path
        
        parser = self._get_parser(domain)
        if not parser:
            return True # Default to True if robots.txt is missing/unreachable
            
        return parser.can_fetch(self.user_agent, url)
