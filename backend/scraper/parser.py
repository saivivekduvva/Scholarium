from bs4 import BeautifulSoup
import re

class Parser:
    def parse(self, html, url):
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove unwanted elements
        for script_or_style in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script_or_style.decompose()

        data = {
            "title": self._get_title(soup),
            "url": url,
            "headings": self._get_headings(soup),
            "paragraphs": self._get_paragraphs(soup),
            "code_snippets": self._get_code_snippets(soup),
            "metadata": self._get_metadata(soup)
        }
        return data

    def _get_title(self, soup):
        title_tag = soup.find('h1') or soup.find('title')
        return title_tag.get_text().strip() if title_tag else "No Title Found"

    def _get_headings(self, soup):
        headings = []
        for h in soup.find_all(['h1', 'h2', 'h3']):
            headings.append({"tag": h.name, "text": h.get_text().strip()})
        return headings

    def _get_paragraphs(self, soup):
        # Focus on the main content area if possible
        content_selectors = ['.article-body', '.entry-content', '.main-content', '#main']
        content_area = None
        for selector in content_selectors:
            content_area = soup.select_one(selector)
            if content_area: break
        
        target = content_area if content_area else soup
        paragraphs = [p.get_text().strip() for p in target.find_all('p') if len(p.get_text().strip()) > 20]
        return paragraphs

    def _get_code_snippets(self, soup):
        snippets = []
        # Common code block selectors
        code_blocks = soup.find_all(['pre', 'code'])
        for block in code_blocks:
            code_text = block.get_text().strip()
            if code_text and len(code_text) > 10:
                snippets.append(code_text)
        return list(set(snippets)) # Basic deduplication of identical snippets

    def _get_metadata(self, soup):
        meta = {}
        # Try to find category or tags
        tags = soup.find_all('a', rel='tag')
        if tags:
            meta['tags'] = [t.get_text().strip() for t in tags]
        
        description = soup.find('meta', attrs={'name': 'description'})
        if description:
            meta['description'] = description.get('content', '')
            
        return meta
