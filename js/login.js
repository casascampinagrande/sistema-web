$(function(){
  $('.form').on('submit', function(e){
    e.preventDefault();
    const $msg = $('#login-message');
    const email = $(this).find('input[name="email"]').val().trim();
    const senha = $(this).find('input[name="senha"]').val().trim();

    $msg.removeClass('error success').text('Autenticando...');

    // Agora fazemos a chamada REAL para o seu Django
    fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, senha: senha })
    })
    .then(async res => {
      const data = await res.json();

      if (res.ok) {
        // Sucesso: Salvamos os dados reais no localStorage para o resto do site usar
        localStorage.setItem('user', JSON.stringify({
          name: data.usuario.nome, 
          email: data.usuario.email
        }));

        $msg.addClass('success').text('Login bem-sucedido! Redirecionando...');
        
        setTimeout(() => { 
          window.location.href = 'perfil.html'; 
        }, 900);

      } else {
        // Erro: Mostra a mensagem vinda do Django (Senha errada, conta inativa, etc)
        $msg.addClass('error').text(data.erro || 'Erro ao fazer login.');
      }
    })
    .catch(err => {
      $msg.addClass('error').text('Erro ao conectar com o servidor.');
    });
  });
});