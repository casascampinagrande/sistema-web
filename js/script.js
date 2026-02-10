document.addEventListener('DOMContentLoaded', function(){
  const tabs = document.querySelectorAll('.search-card .tabs .tab');
  const cards = document.querySelectorAll('.listings-grid .ad-card');

  // Carrega os anúncios mais acessados
  loadPopularAds();

  if(!tabs || tabs.length === 0) return;

  function filterByTab(tabText){
    const key = tabText.trim().toLowerCase();
    cards.forEach(card => {
      const typeEl = card.querySelector('.ad-meta .type') || card.querySelector('.type');
      const typeText = typeEl ? typeEl.textContent.trim().toLowerCase() : '';
      if(key === 'venda'){
        card.style.display = typeText.includes('venda') ? '' : 'none';
      } else if(key === 'aluguel'){
        card.style.display = typeText.includes('aluguel') ? '' : 'none';
      } else {
        card.style.display = '';
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', function(e){
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      filterByTab(this.textContent);
    });
  });

  // ativa a aba marcada como .active no carregamento (ou a primeira)
  const active = document.querySelector('.search-card .tab.active') || tabs[0];
  if(active){
    tabs.forEach(t => t.classList.remove('active'));
    active.classList.add('active');
    filterByTab(active.textContent);
  }

});

// Função para carregar os anúncios mais acessados do backend fictício
async function loadPopularAds() {
  try {
    const response = await fetch('ads.json');
    const ads = await response.json();
    
    // Ordena os anúncios por número de visualizações (decrescente)
    const popularAds = ads
      .sort((a, b) => b.views - a.views)
      .slice(0, 8); // Pega os 8 mais acessados
    
    const container = document.getElementById('popularAds');
    if (!container) return;
    
    // Gera o HTML dos cards
    const cardsHTML = popularAds.map(ad => `
      <div class="card small-card">
        <img src="${ad.image}" alt="${ad.title}">
        <h4>${ad.title}</h4>
        <p class="muted">${ad.city}</p>
        <p class="muted" style="font-size: 11px; margin-top: 4px;">${ad.views.toLocaleString('pt-BR')} visualizações</p>
      </div>
    `).join('');
    
    // Duplica os cards para criar efeito de carrossel infinito
    container.innerHTML = `
      <div class="popular-row-wrapper">
        ${cardsHTML}
        ${cardsHTML}
      </div>
    `;
    
  } catch (error) {
    console.error('Erro ao carregar anúncios populares:', error);
  }
}