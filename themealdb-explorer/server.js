import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

const cache = {};
const CACHE_DURATION = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 50;

async function getWithCache(url) {
    const now = Date.now();

    if (cache[url] && (now - cache[url].timestamp < CACHE_DURATION)) {
        console.log(`[Cache Hit] Serving from memory: ${url}`);
        return cache[url].data;
    }

    console.log(`[Cache Miss] Fetching from TheMealDB API: ${url}`);
    const response = await fetch(url);
    const data = await response.json();

    const cacheKeys = Object.keys(cache);
    if (cacheKeys.length >= MAX_CACHE_SIZE) {
        delete cache[cacheKeys[0]];
    }

    cache[url] = { data, timestamp: now };
    return data;
}

app.get('/api/categories', async(req, res) => {
    try {
        const data = await getWithCache('https://www.themealdb.com/api/json/v1/1/categories.php');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.get('/api/search', async(req, res) => {
    const query = req.query.s || '';
    try {
        const data = await getWithCache(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search meals' });
    }
});

app.get('/api/random', async(req, res) => {
    try {
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