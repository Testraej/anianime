const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const CONSUMET_API_URL = "https://api.consumet.org/anime/gogoanime";

// This serves all the files in your 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- NEW API ROUTES USING GOGOANIME ---

// GETS TOP AIRING ANIME (for the homepage)
app.get('/api/trending', async (req, res) => {
  try {
    const { data } = await axios.get(`${CONSUMET_API_URL}/top-airing`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load top airing anime.' });
  }
});

// SEARCHES FOR ANIME
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: 'Query is required.' });
    
    const { data } = await axios.get(`${CONSUMET_API_URL}/${query}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Search failed.' });
  }
});

// GETS DETAILED ANIME INFO
app.get('/api/anime/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data } = await axios.get(`${CONSUMET_API_URL}/info/${id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load anime details.' });
  }
});

// GETS THE STREAMING LINKS FOR AN EPISODE
app.get('/api/watch/:episodeId', async (req, res) => {
    try {
        const episodeId = req.params.episodeId;
        const { data } = await axios.get(`${CONSUMET_API_URL}/watch/${episodeId}?server=gogocdn`);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch streaming links.' });
    }
});


// Fallback to serve the main HTML file for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`AniWave running on port ${PORT}`));