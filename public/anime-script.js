function getParam(name) {
    return new URLSearchParams(location.search).get(name);
}

async function loadEpisode(episodeId) {
    const videoContainer = document.getElementById('video-player-container');
    videoContainer.innerHTML = '<p>Loading episode...</p>';

    try {
        const response = await fetch(`/api/watch/${episodeId}`);
        const data = await response.json();

        const source = data.sources.find(s => s.quality === 'default') || data.sources[data.sources.length - 1];

        if (!source) {
            videoContainer.innerHTML = '<p>Sorry, no video source was found for this episode.</p>';
            return;
        }

        videoContainer.innerHTML = '<video id="player" controls autoplay style="width: 100%; border-radius: 16px;"></video>';
        const video = document.getElementById('player');

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(source.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source.url;
            video.addEventListener('loadedmetadata', () => video.play());
        }

    } catch (err) {
        console.error('Error loading episode:', err);
        videoContainer.innerHTML = '<p>Could not load the episode. The API might be down.</p>';
    }
}

async function loadDetails() {
    // The ID is now a string like 'spy-x-family'
    const id = getParam('id');
    if (!id) return;

    const detailRoot = document.getElementById('detail-root');
    const episodeList = document.getElementById('episode-list');
    detailRoot.innerHTML = '<div class="center"><div class="grid-skeleton" style="width:100%"><div class="s"></div></div></div>';

    try {
        const res = await fetch(`/api/anime/${id}`);
        const anime = await res.json();

        // Render details using the new data structure
        const genres = (anime.genres || []).slice(0, 6).map(g => `<span class="badge">${g}</span>`).join('');
        detailRoot.innerHTML = `
            ${anime.image ? `<img class="banner" src="${anime.image}" alt="${anime.title} banner" />` : ''}
            <div class="detail-wrap">
                <img class="poster" src="${anime.image}" alt="${anime.title} poster" />
                <div class="info-card">
                    <h1 style="margin-top:0">${anime.title}</h1>
                    <div class="badges">${genres}</div>
                    <p class="description">${anime.description || 'No description available.'}</p>
                </div>
            </div>
        `;

        // Generate episode buttons from the 'episodes' array
        episodeList.innerHTML = '';
        if (anime.episodes && anime.episodes.length > 0) {
            anime.episodes.forEach(episode => {
                const button = document.createElement('button');
                button.className = 'badge';
                button.style.cursor = 'pointer';
                button.textContent = `Episode ${episode.number}`;
                // The API gives us the exact episodeId we need to pass
                button.onclick = () => loadEpisode(episode.id);
                episodeList.appendChild(button);
            });
        } else {
            episodeList.innerHTML = 'No episodes found.';
        }

    } catch (e) {
        console.error(e);
        detailRoot.innerHTML = '<div class="info-card">Failed to load details. The API might be down.</div>';
    }
}

document.addEventListener('DOMContentLoaded', loadDetails);