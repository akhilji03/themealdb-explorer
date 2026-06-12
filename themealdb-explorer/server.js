import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Serve static files from the 'public' folder
const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

// Simple In-Memory Cache Object
const cache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 50; // Maximum number of items allowed in cache

// Helper function to handle caching safely
async function getWithCache(url) {
    const now = Date.now();

    // Check if valid cache exists
    if (cache[url] && (now - cache[url].timestamp < CACHE_DURATION)) {
        console.log(`[Cache Hit] Serving from memory: ${url}`);
        return cache[url].data;
    }

    console.log(`[Cache Miss] Fetching from TheMealDB API: ${url}`);
    const response = await fetch(url);
    const data = await response.json();

    // Max Size Eviction Policy (Remove oldest entry if cache gets too big)
    const cacheKeys = Object.keys(cache);
    if (cacheKeys.length >= MAX_CACHE_SIZE) {
        delete cache[cacheKeys[0]];
    }

    // Save to cache
    cache[url] = { data, timestamp: now };
    return data;
}

// REST Endpoint 1: Get Categories
app.get('/api/categories', async(req, res) => {
    try {
        // Utilizing the public JSON schema endpoint documented on api.php
        const data = await getWithCache('https://www.themealdb.com/api/json/v1/1/categories.php');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// REST Endpoint 2: Search Meals by Name
app.get('/api/search', async(req, res) => {
    const query = req.query.s || '';
    try {
        // Utilizing the public search endpoint with developer test key '1'
        const data = await getWithCache(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search meals' });
    }
});

// REST Endpoint 3: Get Random Meal
app.get('/api/random', async(req, res) => {
    try {
        // Random requests bypass cache so the user always sees a fresh entry!
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch random meal' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running locally at http://localhost:${PORT}`);
});