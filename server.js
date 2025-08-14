// server.js (Updated)

const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// This assumes your html, css, and js files are in a folder named 'public'
app.use(express.static(path.join(__dirname, 'public')));

async function fetchAniList(query, variables){
  try{
    const { data } = await axios.post('https://graphql.anilist.co', { query, variables }, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    });
    return data;
  }catch(err){
    console.error('AniList error:', err.response?.data || err.message);
    throw new Error('AniList request failed');
  }
}

// ... (Your existing /api/trending, /api/search, /api/anime/:id routes are here) ...
// (No changes needed to the existing routes)

// ####################################################################
// ## NEW CODE BLOCK TO ADD ##
// This new route will fetch the streaming links from Consumet.
// ####################################################################
app.get('/api/watch/:episodeId', async (req, res) => {
    try {
        const episodeId = req.params.episodeId;
        const url = `https://api.consumet.org/anime/gogoanime/watch/${episodeId}?server=gogocdn`;
        
        const { data } = await axios.get(url);
        res.json(data);

    } catch (err) {
        res.status(500).json({ 
            error: 'Failed to fetch streaming links.', 
            message: err.message 
        });
    }
});


// Fallback to serve the main HTML file for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`AniWave running at http://localhost:${PORT}`));