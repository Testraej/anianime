// anime-script.js (Completely New Version)

function getParam(name) {
    return new URLSearchParams(location.search).get(name);
}

// Function to play the video
async function loadEpisode(episodeId) {
    const videoContainer = document.getElementById('video-player-container');
    videoContainer.innerHTML = '<p>Loading episode...</p>'; // Show loading message

    try {
        // 1. Call our own server's new API route
        const response = await fetch(`/api/watch/${episodeId}`);
        const data = await response.json();

        // 2. Find the highest quality video source
        const source = data.sources.find(s => s.quality === 'default') || data.sources[data.sources.length - 1];

        if (!source) {
            videoContainer.innerHTML = '<p>Sorry, no video source was found for this episode.</p>';
            return;
        }

        // 3. Create a <video> element
        videoContainer.innerHTML = '<video id="player" controls autoplay style="width: 100%; border-radius: 16px;"></video>';
        const video = document.getElementById('player');

        // 4. Use HLS.js to play the .m3u8 stream
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(source.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // For Safari, which has native HLS support
            video.src = source.url;
            video.addEventListener('loadedmetadata', function () {
                video.play();
            });
        }

    } catch (err) {
        console.error('Error loading episode:', err);
        videoContainer.innerHTML = '<p>Could not load the episode. The API might be down.</p>';
    }
}

// Main function to load all anime details and episode lists
async function loadDetails() {
    const id = getParam('id');
    if (!id) return;

    const detailRoot = document.getElementById('detail-root');
    const episodeList = document.getElementById('episode-list');
    detailRoot.innerHTML = '<div class="center"><div class="grid-skeleton" style="width:100%"><div class="s"></div></div></div>'; // Loading skeleton

    try {
        const res = await fetch(`/api/anime/${id}`);
        const anime = await res.json();

        // --- Render Anime Details (Same as before) ---
        const genres = (anime.genres || []).slice(0, 6).map(g => `<span class="badge">${g}</span>`).join('');
        detailRoot.innerHTML = `
            ${anime.bannerImage ? `<img class="banner" src="${anime.bannerImage}" alt="${anime.title.romaji} banner" />` : ''}
            <div class="detail-wrap">
                <img class="poster" src="${anime.coverImage.large}" alt="${anime.title.romaji} poster" />
                <div class="info-card">
                    <h1 style="margin-top:0">${anime.title.romaji}</h1>
                    <div class="badges">${genres}</div>
                    <p class="description">${(anime.description || '').replace(/<br>/g, '')}</p>
                </div>
            </div>
        `;

        // --- NEW: Generate Episode Buttons ---
        episodeList.innerHTML = ''; // Clear previous episode list
        const animeTitleForId = anime.title.romaji.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        for (let i = 1; i <= anime.episodes; i++) {
            const episodeId = `${animeTitleForId}-episode-${i}`;
            const button = document.createElement('button');
            button.className = 'badge'; // Style it like a badge
            button.style.cursor = 'pointer';
            button.textContent = `Episode ${i}`;
            button.onclick = () => loadEpisode(episodeId);
            episodeList.appendChild(button);
        }

    } catch (e) {
        console.error(e);
        detailRoot.innerHTML = '<div class="info-card">Failed to load details.</div>';
    }
}

document.addEventListener('DOMContentLoaded', loadDetails);