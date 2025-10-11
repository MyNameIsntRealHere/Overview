// simple async include loader
async function includeHTML(selector, url){
  const el = document.querySelector(selector);
  if(!el) return;
  try {
    const res = await fetch(url);
    el.innerHTML = await res.text();
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

  await tryInclude('#header-target','header.html');
  await tryInclude('#sidebar-target','sidebar.html');

  // wire up header search to open search overlay
  const openSearch = document.getElementById('open-search');
  const globalSearch = document.getElementById('global-search-input');
  if(openSearch && globalSearch){
    openSearch.addEventListener('click', (e)=> { e.preventDefault(); globalSearch.focus(); });
  }
  const searchOpenBtn = document.getElementById('search-open');
  if(searchOpenBtn && globalSearch) searchOpenBtn.addEventListener('click', ()=> globalSearch.focus());
})();
