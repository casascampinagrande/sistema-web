// ========================================
// PROFILE.JS - Carrega dados do usuário e anúncios do backend fictício
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Pega o usuário logado (simulado via localStorage)
    const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Se não houver usuário logado, usa Amanda como padrão (para demonstração)
    const currentUserEmail = loggedUser ? loggedUser.email : 'amanda@example.com';
    
    // Carrega dados do backend fictício
    await loadProfileData(currentUserEmail);
    
  } catch(e) {
    console.error('Erro ao carregar perfil:', e);
  }
});

// Função principal que carrega todos os dados
async function loadProfileData(userEmail) {
  try {
    // Faz requisições paralelas para users.json e ads.json
    const [usersResponse, adsResponse] = await Promise.all([
      fetch('users.json'),
      fetch('ads.json')
    ]);
    
    const users = await usersResponse.json();
    const ads = await adsResponse.json();
    
    // Encontra o usuário atual
    const currentUser = users.find(u => u.email === userEmail);
    
    if (!currentUser) {
      console.error('Usuário não encontrado');
      return;
    }
    
    // Filtra anúncios do usuário
    const userAds = ads.filter(ad => ad.ownerEmail === userEmail);
    
    // Popula os dados na página
    populateUserInfo(currentUser);
    populateUserAds(userAds);
    
  } catch(e) {
    console.error('Erro ao carregar dados:', e);
  }
}

// Popula informações do usuário na sidebar
function populateUserInfo(user) {
  // Avatar
  const avatarEl = document.querySelector('.profile-avatar');
  if (avatarEl) avatarEl.src = user.avatar;
  
  // Nome
  const nameEl = document.querySelector('.profile-user-name');
  if (nameEl) {
    const verifiedIcon = user.verified ? `
      <svg class="verified-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#00A5CF"/>
        <path d="M11.5 5.5L7 10L4.5 7.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    ` : '';
    nameEl.innerHTML = `${user.name} ${verifiedIcon}`;
  }
  
  // Status online
  const statusEl = document.querySelector('.profile-status');
  if (statusEl) {
    statusEl.innerHTML = `
      <span class="status-dot"></span>
      ${user.online ? 'online' : 'offline'}
    `;
    statusEl.className = `profile-status ${user.online ? 'online' : 'offline'}`;
  }
  
  // Membro desde
  const memberSinceEl = document.querySelector('.profile-member-since span');
  if (memberSinceEl) memberSinceEl.textContent = `Na Valorize desde ${user.memberSince}`;
  
  // Localização
  const locationEl = document.querySelector('.profile-location span');
  if (locationEl) locationEl.textContent = user.location;
  
  // Nível de cadastro (barra de progresso)
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) progressFill.style.width = `${user.cadastroLevel}%`;
  
  // Verificações
  updateVerificationItems(user.verifications);
}

// Atualiza os itens de verificação
function updateVerificationItems(verifications) {
  const verificationTypes = ['email', 'phone', 'facebook', 'identity'];
  
  verificationTypes.forEach(type => {
    const item = document.querySelector(`.verification-item[data-verification="${type}"]`);
    if (item) {
      if (verifications[type]) {
        item.classList.add('verified');
      } else {
        item.classList.remove('verified');
      }
    }
  });
}

// Popula os anúncios do usuário
function populateUserAds(ads) {
  // Atualiza contador de anúncios
  const statsBoxStrong = document.querySelector('.ads-count-total');
  if (statsBoxStrong) {
    statsBoxStrong.textContent = `${ads.length} anúncios`;
  }
  
  const listingsCount = document.querySelector('.listings-count');
  if (listingsCount) {
    listingsCount.textContent = `${ads.length} de ${ads.length} anúncios publicados`;
  }
  
  // Ordena anúncios por data (mais recentes primeiro)
  ads.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Renderiza grid de anúncios
  const adsGrid = document.querySelector('.ads-grid');
  if (!adsGrid) return;
  
  adsGrid.innerHTML = ''; // Limpa conteúdo existente
  
  ads.forEach(ad => {
    const adCard = createAdCard(ad);
    adsGrid.appendChild(adCard);
  });
  
  // Adiciona funcionalidade aos botões de favorito
  attachFavoriteListeners();
}

// Cria um card de anúncio
function createAdCard(ad) {
  const div = document.createElement('div');
  div.className = 'ad-card-profile';
  
  const formattedDate = formatDate(ad.date);
  
  div.innerHTML = `
    <div class="ad-image">
      <img src="${ad.image}" alt="${ad.title}">
      <span class="ad-image-count">📷 ${ad.imageCount}</span>
    </div>
    <div class="ad-content">
      <h3>${ad.title}</h3>
      <div class="ad-location">
        <svg width="12" height="12" fill="#6b7280" viewBox="0 0 12 12">
          <circle cx="6" cy="4" r="2"/>
          <path d="M10 10c0-2.21-1.79-4-4-4s-4 1.79-4 4"/>
        </svg>
        <span>${ad.city}</span>
      </div>
      <p class="ad-date">${formattedDate}</p>
      <button class="ad-favorite" data-ad-id="${ad.id}">♡</button>
    </div>
  `;
  
  return div;
}

// Formata a data para exibição
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 24) {
    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours < 2) return 'Há 1 hora';
    return `Há ${diffHours} horas`;
  } else if (diffDays === 1) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Ontem, ${hours}:${minutes}`;
  } else if (diffDays < 7) {
    return `Há ${diffDays} dias`;
  } else {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().substr(2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }
}

// Adiciona listeners aos botões de favorito
function attachFavoriteListeners() {
  document.querySelectorAll('.ad-favorite').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      this.textContent = this.textContent === '♡' ? '♥' : '♡';
      this.classList.toggle('favorited');
      
      // Aqui você poderia salvar no localStorage ou enviar para o backend
      const adId = this.getAttribute('data-ad-id');
      console.log('Favorito alternado para anúncio:', adId);
    });
  });
}

// Funcionalidade de busca e filtros
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('.search-input');
  const filterSelects = document.querySelectorAll('.filter-select');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterAds);
  }
  
  filterSelects.forEach(select => {
    select.addEventListener('change', filterAds);
  });
});

// Filtra anúncios baseado em busca e filtros
function filterAds() {
  const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
  const cards = document.querySelectorAll('.ad-card-profile');
  
  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const location = card.querySelector('.ad-location span')?.textContent.toLowerCase() || '';
    
    const matchesSearch = title.includes(searchTerm) || location.includes(searchTerm);
    
    card.style.display = matchesSearch ? 'block' : 'none';
  });
}
