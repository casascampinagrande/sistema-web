$(function () {

  const $radios = $('input[name="tipo_conta"]');
  const $dateRow = $('#dateRow');
  const $cpfRow = $('#cpfRow');
  const $cnpjRow = $('#cnpjRow');

  function updateFields() {
    const val = $('input[name="tipo_conta"]:checked').val();
    if (val === 'pf') {
      $dateRow.show(); $cpfRow.show(); $cnpjRow.hide();
    } else {
      $dateRow.hide(); $cpfRow.hide(); $cnpjRow.show();
    }
  }

  $radios.on('change', updateFields);
  updateFields(); // Executa ao carregar a página

  $('form.form').on('submit', function (e) {
    e.preventDefault();
    const $msg = $('#register-message');
    $msg.removeClass('error success').text('Processando...');

    const form = $(this);
    const nome = form.find('input[name="nome"]').val().trim();
    const email = form.find('input[name="email"]').val().trim();
    const senha = form.find('input[name="senha"]').val();
    const confirmar_senha = form.find('input[name="confirmar_senha"]').val();

    // Define qual documento pegar
    const tipo_conta = form.find('input[name="tipo_conta"]:checked').val();
    const documento = tipo_conta === 'pf' ? form.find('input[name="cpf"]').val().trim() : form.find('input[name="cnpj"]').val().trim();

    // Validações básicas de UI que ela já fez
    if (senha.length < 6) {
      $msg.addClass('error').text('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar_senha) {
      $msg.addClass('error').text('As senhas não coincidem.');
      return;
    }

    // Integração com Django
    const payload = {
      nome: nome,
      email: email,
      senha: senha,
      cpf_cnpj: documento,
      creci: null,
      telefone: null
    };

    fetch('http://127.0.0.1:8000/api/registrar/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (res.ok) {
          // Sucesso real no banco de dados!
          $msg.addClass('success').text('Cadastro realizado com sucesso! Redirecionando...');

          // mantive a parte de salvar no localStorage para seu front continuar achando que está logado
          setTimeout(() => {
            // Passa o email na URL para a próxima página
            window.location.href = `confirmacao_pendente.html?email=${encodeURIComponent(email)}`;
          }, 1500);
        } else {
          // Erros vindos do Django (ex: e-mail já existe)
          let erroTexto = "Erro ao cadastrar.";
          if (data.email) erroTexto = "Este e-mail já está em uso.";
          if (data.cpf_cnpj) erroTexto = "Este CPF/CNPJ já está cadastrado.";

          $msg.addClass('error').text(erroTexto);
        }
      })
      .catch(err => {
        $msg.addClass('error').text('Erro ao conectar com o servidor back-end.');
      });
  });
});