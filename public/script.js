const grid = document.getElementById('anime-list');
const gridSkeleton = document.getElementById('grid-skeleton');

function renderSkeletons(container, count = 12){
  container.innerHTML = '';
  for (let i=0;i<count;i++){
    const s = document.createElement('div');
    s.className = 's';
    container.appendChild(s);
  }
}

async function loadTrending(){
  try{
    if(gridSkeleton){ renderSkeletons(gridSkeleton, 12); }
    const res = await fetch('/api/trending');
    const data = await res.json();
    if(gridSkeleton){ gridSkeleton.classList.add('hidden'); }

    grid.innerHTML = data.map(anime => `
      <article class="card" role="article">
        <a href="/anime.html?id=${anime.id}" aria-label="Open ${anime.title.romaji}">
          <img class="thumb" src="${anime.coverImage.large}" alt="${anime.title.romaji}" loading="lazy" />
          <div class="meta">
            <div class="title">${anime.title.romaji}</div>
          </div>
        </a>
      </article>
    `).join('');
  }catch(err){
    console.error(err);
    if(grid){ grid.innerHTML = `<div class="info-card">Failed to load trending anime.</div>`; }
  }
}

document.addEventListener('DOMContentLoaded', loadTrending);