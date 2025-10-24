// simple async include loader
async function includeHTML(selector, url){
  const el = document.querySelector(selector);
  if(!el) return;
  try {
    const res = await fetch(url);
    if (res.ok) {
      el.innerHTML = await res.text();
      console.log(`Successfully included ${url} into ${selector}`); // Debugging
    } else {
      console.error(`Failed to fetch ${url}: ${res.status}`); // Debugging
    }
  } catch(e){
    console.error('Include failed', url, e);
  }
}

(async () => {
  // header target and sidebar target may be at different relative paths
  // try root path, then parent path if not found
  const basePaths = ['', '../', './'];
  async function tryInclude(sel, filename){
    for(const p of basePaths){
      try {
        const res = await fetch(p + filename);
        if(res.ok){
          const text = await res.text();
          document.querySelector(sel).innerHTML = text;
          return true;
        }
      } catch(e){}
    }
    return false;
  }

  console.log('Attempting to include header.html...');
  const success = await tryInclude('#header-target', 'header.html');
  if (success) {
    console.log('header.html successfully included. Dispatching headerLoaded event.');
    document.dispatchEvent(new Event('headerLoaded')); // Custom event
  } else {
    console.error('Failed to include header.html. Check file path and server setup.');
  }

  console.log('Attempting to include sidebar.html...');
  await tryInclude('#sidebar-target','sidebar.html');
})();

// Ensure search bar functionality only runs when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('search-results');

  if (!searchInput || !searchResults) {
    console.error('Search input or results container not found in DOM.');
    return;
  }

  searchInput.addEventListener('input', async (event) => {
    const query = event.target.value.toLowerCase();
    searchResults.innerHTML = '';

    if (query.length < 2) {
      searchResults.classList.add('hidden');
      return;
    }

    try {
      const response = await fetch('search-index.json');
      const pages = await response.json();

      const matches = pages.filter(page => page.title.toLowerCase().includes(query));

      if (matches.length > 0) {
        searchResults.classList.remove('hidden');
        matches.forEach(match => {
          const resultItem = document.createElement('div');
          resultItem.className = 'search-result-item';
          resultItem.innerHTML = `<a href="${match.url}">${match.title}</a>`;
          searchResults.appendChild(resultItem);
        });
      } else {
        searchResults.classList.add('hidden');
      }
    } catch (error) {
      console.error('Error fetching search index:', error);
    }
  });

  document.addEventListener('click', (event) => {
    if (!searchResults.contains(event.target) && event.target !== searchInput) {
      searchResults.classList.add('hidden');
    }
  });
});
