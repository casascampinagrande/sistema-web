$(function(){
  $('.form').on('submit', function(e){
    e.preventDefault();
    const $msg = $('#login-message');
    const email = $(this).find('input[name="email"]').val().trim();
    const senha = $(this).find('input[name="senha"]').val().trim();

    $msg.removeClass('error success').text('Carregando...');
    // carrega usuários do arquivo e os usuários adicionais salvos em localStorage
    Promise.all([
      fetch('users.json').then(res => { if(!res.ok) return []; return res.json(); }).catch(()=>[]),
      Promise.resolve(JSON.parse(localStorage.getItem('fake_users') || '[]'))
    ])
    .then(([fileUsers, storedUsers]) => {
      const users = (fileUsers || []).concat(storedUsers || []);
      // simula atraso de rede
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === senha);
        if(user){
          localStorage.setItem('user', JSON.stringify({name: user.name, email: user.email}));
          $msg.addClass('success').text('Login bem-sucedido! Redirecionando...');
          setTimeout(() => { window.location.href = 'perfil.html'; }, 900);
        } else {
          $msg.addClass('error').text('E-mail ou senha incorretos.');
        }
      }, 600);
    })
    .catch(err => {
      $msg.addClass('error').text('Erro: ' + (err && err.message ? err.message : err));
    });
  });
});
