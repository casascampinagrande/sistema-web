$(function () {
  $('.form').on('submit', function (e) {
    e.preventDefault();
    const $msg = $('#login-message');
    const email = $(this).find('input[name="email"]').val().trim();
    const senha = $(this).find('input[name="senha"]').val().trim();

    $msg.removeClass('error success').text('Autenticando...');

    fetch('/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // IMPORTANTE: Django espera 'username' e 'password' por padrão
      body: JSON.stringify({ username: email, password: senha })
    })
    .then(async res => {
      const data = await res.json(); // Lemos o JSON apenas uma vez aqui

      if (res.ok) {
        // Salva o token exatamente como o profile.js vai buscar
        localStorage.setItem('userToken', data.token);
        
        $msg.addClass('success').text('Login bem-sucedido! Redirecionando...');

        setTimeout(() => {
          window.location.href = 'perfil.html';
        }, 900);
      } else {
        $msg.addClass('error').text(data.erro || 'E-mail ou senha incorretos.');
      }
    })
    .catch(err => {
      console.error(err);
      $msg.addClass('error').text('Erro ao conectar com o servidor.');
    });
  });
});