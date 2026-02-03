document.addEventListener('DOMContentLoaded', function(){
  try{
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if(!user) return;

    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const detailName = document.getElementById('detailName');
    const detailNick = document.getElementById('detailNick');
    const detailPhone = document.getElementById('detailPhone');
    const headerActions = document.getElementById('headerActions');

    if(nameEl) nameEl.textContent = user.name || user.email || '';
    if(emailEl) emailEl.textContent = user.email || '';
    if(detailName) detailName.textContent = user.name || detailName.textContent;

    // tenta preencher dados adicionais salvos em fake_users
    const stored = JSON.parse(localStorage.getItem('fake_users') || '[]');
    const full = (stored || []).find(u => u.email && u.email.toLowerCase() === (user.email||'').toLowerCase());
    if(full){
      if(detailNick) detailNick.textContent = full.preferredName || full.name || detailNick.textContent;
      if(detailPhone) detailPhone.textContent = full.phone || detailPhone.textContent;
    }

    // atualiza header: mostra nome, link para perfil e botão de logout
    if(headerActions){
      headerActions.innerHTML = '';
      const span = document.createElement('span');
      span.className = 'muted';
      span.style.marginRight = '8px';
      span.textContent = 'Olá, ' + (user.name || user.email || 'usuário');
      headerActions.appendChild(span);

      const perfilLink = document.createElement('a');
      perfilLink.href = 'perfil.html';
      perfilLink.className = 'btn btn-secondary';
      perfilLink.textContent = 'Meu Perfil';
      headerActions.appendChild(perfilLink);

      const logoutBtn = document.createElement('button');
      logoutBtn.id = 'logoutBtn';
      logoutBtn.className = 'btn';
      logoutBtn.style.marginLeft = '8px';
      logoutBtn.textContent = 'Sair';
      headerActions.appendChild(logoutBtn);

      logoutBtn.addEventListener('click', function(){
        localStorage.removeItem('user');
        // opcional: não remover fake_users para manter os cadastros
        window.location.href = 'login.html';
      });
    }
  }catch(e){
    console.error('profile.js error', e);
  }
});
