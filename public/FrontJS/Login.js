async function fazerLogin() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const mensagem = document.getElementById('mensagem');

  if (!email || !senha) {
    mensagem.textContent = 'Preencha todos os campos.';
    return;
  }

  try {
    const resposta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: senha })
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      mensagem.style.color = 'green';
      mensagem.textContent = resultado.mensagem;

      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    } else {
      mensagem.style.color = 'red';
      mensagem.textContent = resultado.mensagem;
    }

  } catch (erro) {
    console.error('Erro:', erro);
    mensagem.style.color = 'red';
    mensagem.textContent = 'Erro ao conectar com o servidor.';
  }
}