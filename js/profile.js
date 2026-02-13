document.addEventListener('DOMContentLoaded', async function () {
  const token = localStorage.getItem('userToken');

  if (!token || token === "undefined" || token === "null") {
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/meu-perfil/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      populateUserInfo(userData);
      populateUserAds([]);
      configurarBotaoSair();

      populateUserInfo(userData);
      populateUserAds([]);
    } else {
      localStorage.removeItem('userToken');
      window.location.href = 'login.html';
    }

  } catch (e) {
    console.error('Erro ao carregar perfil:', e);
  }
});

function populateUserInfo(user) {
  // 1. Nome
  const nameEl = document.querySelector('.profile-user-name');
  if (nameEl) nameEl.textContent = user.name;

  // 2. Avatar
  const avatarEl = document.querySelector('.profile-avatar');
  if (avatarEl) avatarEl.src = user.avatar;

  // 3. Status Online
  const statusEl = document.querySelector('.profile-status');
  if (statusEl) {
    statusEl.innerHTML = '<span class="status-dot" style="background:#4ade80; display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:5px;"></span> online';
  }

  // 4. Membro desde
  const memberSinceEl = document.querySelector('.profile-member-since span');
  if (memberSinceEl) memberSinceEl.textContent = `Na Valorize desde ${user.memberSince}`;

  // 5. Localização
  const locationEl = document.querySelector('.profile-location span');
  if (locationEl) locationEl.textContent = user.location;

  // 6. Nível de cadastro (Barra de progresso)
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) progressFill.style.width = `${user.cadastroLevel}%`;
}

function configurarBotaoSair() {
  // Procura o link que aponta para login.html no topo da página
  const linksEntrar = document.querySelectorAll('a[href="login.html"]');

  linksEntrar.forEach(btn => {
    btn.textContent = 'Sair';
    btn.href = '#'; // Evita que ele tente ir para a tela de login
    btn.classList.add('btn-logout'); // Opcional: para estilizar via CSS se quiser

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("Fazendo logout...");
      localStorage.removeItem('userToken');
      window.location.href = 'index.html'; // Manda para a home após sair
    });
  });
}



function populateUserAds(ads) {
  const adsGrid = document.querySelector('.ads-grid');
  if (adsGrid) {
    adsGrid.innerHTML = ads.length === 0
      ? '<p style="padding:20px; color:#666;">Você ainda não possui anúncios publicados.</p>'
      : '';
  }
}

// Botão Sair
document.addEventListener('click', function (e) {
  if (e.target && e.target.textContent === 'Sair') {
    localStorage.removeItem('userToken');
    window.location.href = 'index.html';
  }
});