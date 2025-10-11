// Very small search implementation
async function performSearch(query){
  if(!query || query.trim().length < 1) return [];
  const raw = await fetch('search-index.json').then(r => r.json());
  const q = query.toLowerCase();
  // simple score by title/excerpt matches
  return raw.map(item => {
    const score = (item.title.toLowerCase().includes(q) ? 2 : 0) +
                  (item.excerpt.toLowerCase().includes(q) ? 1 : 0);
    return {...item, score};
  }).filter(i => i.score > 0).sort((a,b) => b.score - a.score);
}

function renderResults(results){
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  if(!results.length){
    container.innerHTML = '<div class="sr">No results</div>';
  } else {
    const list = document.createElement('div');
    list.className = 'sr-list';
    results.forEach(r => {
      const a = document.createElement('a');
      a.href = r.url;
      a.className = 'sr-item';
      a.innerHTML = `<h4>${r.title}</h4><p>${r.excerpt}</p>`;
      list.appendChild(a);
    });
    container.appendChild(list);
  }
  container.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('global-search-input');
  if(!input) return;

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const q = input.value.trim();
      if(!q) { document.getElementById('search-results').classList.add('hidden'); return; }
      const results = await performSearch(q);
      renderResults(results);
    }, 200);
  });

  // close overlay on click outside
  document.addEventListener('click', (e) => {
    const overlay = document.getElementById('search-results');
    if (!overlay) return;
    if(!overlay.contains(e.target) && e.target.id !== 'global-search-input'){
      overlay.classList.add('hidden');
    }
  });
});
