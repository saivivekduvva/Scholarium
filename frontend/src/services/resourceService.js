/**
 * Service for fetching external educational resources.
 */

export const fetchDevToArticles = async (tag) => {
  try {
    const response = await fetch(`https://dev.to/api/articles?tag=${tag.toLowerCase()}&per_page=4`);
    if (!response.ok) throw new Error('Failed to fetch from Dev.to');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Dev.to articles:', error);
    return [];
  }
};

export const fetchOpenLibraryBooks = async (query) => {
  try {
    const formattedQuery = query.replace(/\s+/g, '+');
    const response = await fetch(`https://openlibrary.org/search.json?q=${formattedQuery}&limit=4`);
    if (!response.ok) throw new Error('Failed to fetch from OpenLibrary');
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching OpenLibrary books:', error);
    return [];
  }
};

export default {
  fetchDevToArticles,
  fetchOpenLibraryBooks,
};
