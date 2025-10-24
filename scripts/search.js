document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('global-search-input');
  const container = document.getElementById('search-results');

  input.addEventListener('input', async () => {
    const query = input.value.trim();
    if (!query) {
      container.classList.add('hidden');
      return;
    }
    const results = await performSearch(query);
    renderResults(results);
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && e.target !== input) {
      container.classList.add('hidden');
    }
  });
});

async function performSearch(query) {
  console.log('Performing search for query:', query); // Debugging log
  if (!query || query.trim().length < 1) return [];
  try {
    const raw = await fetch('search-index.json').then(r => r.json());
    console.log('Fetched search index:', raw); // Debugging log
    const q = query.toLowerCase();
    return raw.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q)
    );
  } catch (error) {
    console.error('Error fetching or processing search index:', error); // Debugging log
    return [];
  }
}

function renderResults(results) {
  console.log('Rendering results:', results); // Debugging log
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  if (!results.length) {
    container.innerHTML = '<div class="sr">No results</div>';
  } else {
    results.forEach(r => {
      const item = document.createElement('div');
      item.className = 'sr-item';
      item.innerHTML = `<strong>${r.title}</strong><p>${r.excerpt}</p>`;
      item.addEventListener('click', () => {
        window.location.href = r.url;
      });
      container.appendChild(item);
    });
  }
  container.classList.remove('hidden');
}
