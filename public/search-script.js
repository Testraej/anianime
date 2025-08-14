const sInput = document.getElementById('search-input');
const sButton = document.getElementById('search-button');
const sResults = document.getElementById('search-results');
const sSkeleton = document.getElementById('search-skeleton');

function showSearchSkeleton(){
  if(!sSkeleton) return;
  sSkeleton.classList.remove('hidden');
  sSkeleton.innerHTML = '';
  for(let i=0;i<10;i++){
    const s = document.createElement('div');
    s.className='s';
    sSkeleton.appendChild(s);
  }
}

async function performSearch(){
  const q = sInput.value.trim();
  if(!q) return;
  showSearchSkeleton();
  sResults.innerHTML = '';
  try{
    const res = await fetch(`/api/search?query=${encodeURIComponent(q)}`);
    const data = await res.json();
    sSkeleton.classList.add('hidden');
    
    // The data format is now different (data.results)
    sResults.innerHTML = data.results.map(anime => `
      <article class="card">
        <a href="/anime.html?id=${anime.id}">
          <img class="thumb" src="${anime.image}" alt="${anime.title}" loading="lazy" />
          <div class="meta">
            <div class="title">${anime.title}</div>
          </div>
        </a>
      </article>
    `).join('');
    if(!data.results.length){ sResults.innerHTML = '<div class="info-card">No results found.</div>'; }
  }catch(e){
    console.error(e);
    sSkeleton.classList.add('hidden');
    sResults.innerHTML = '<div class="info-card">Search failed. Please try again.</div>';
  }
}

if(sButton){ sButton.addEventListener('click', performSearch); }
if(sInput){ sInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') performSearch(); }); }