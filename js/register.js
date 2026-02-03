$(function(){
  $('form.form').on('submit', function(e){
    e.preventDefault();
    const $msg = $('#register-message');
    $msg.removeClass('error success').text('Processando...');

    const form = $(this);
    const nome = form.find('input[name="nome"]').val().trim();
    const nome_preferido = form.find('input[name="nome_preferido"]').val().trim();
    const tipo_conta = form.find('input[name="tipo_conta"]:checked').val();
    const cpf = form.find('input[name="cpf"]').val().trim();
    const cnpj = form.find('input[name="cnpj"]').val().trim();
    const data_nascimento = form.find('input[name="data_nascimento"]').val();
    const email = form.find('input[name="email"]').val().trim();
    const senha = form.find('input[name="senha"]').val();
    const confirmar_senha = form.find('input[name="confirmar_senha"]').val();
    const opt_in = form.find('input[name="opt_in"]').is(':checked');

    if(senha.length < 6){
      $msg.addClass('error').text('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if(senha !== confirmar_senha){
      $msg.addClass('error').text('As senhas não coincidem.');
      return;
    }

    // carrega usuários existentes (arquivo + localStorage)
    Promise.all([
      fetch('users.json').then(res => { if(!res.ok) return []; return res.json(); }).catch(()=>[]),
      Promise.resolve(JSON.parse(localStorage.getItem('fake_users') || '[]'))
    ])
    .then(([fileUsers, storedUsers]) => {
      const users = (fileUsers || []).concat(storedUsers || []);
      const exists = users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase());
      if(exists){
        $msg.addClass('error').text('Já existe uma conta com esse e-mail.');
        return;
      }

      const newUser = {
        name: nome || nome_preferido || email,
        preferredName: nome_preferido || '',
        email: email,
        password: senha,
        tipo_conta: tipo_conta,
        cpf: cpf || '',
        cnpj: cnpj || '',
        data_nascimento: data_nascimento || '',
        opt_in: !!opt_in,
        created_at: new Date().toISOString()
      };

      const updatedStored = (storedUsers || []).concat([newUser]);
      localStorage.setItem('fake_users', JSON.stringify(updatedStored));

      // também guarda usuário logado
      localStorage.setItem('user', JSON.stringify({name: newUser.name, email: newUser.email}));

      $msg.addClass('success').text('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => { window.location.href = 'perfil.html'; }, 900);
    })
    .catch(err => {
      $msg.addClass('error').text('Erro: ' + (err && err.message ? err.message : err));
    });

  });
});
