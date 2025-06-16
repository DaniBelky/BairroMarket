// public/FrontJS/PasswordReset.js
document.addEventListener('DOMContentLoaded', function() {
  const codeBoxes = document.querySelectorAll('.code-box');
  const emailInput = document.getElementById('email');
  const verifyButton = document.querySelector('.verify-button');

  // Funcionalidade para navegação automática entre os campos de código
  codeBoxes.forEach((box, index) => {
    box.addEventListener('input', function() {
      // Permitir apenas números e letras
      this.value = this.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      
      // Mover para o próximo campo automaticamente
      if (this.value.length === 1 && index < codeBoxes.length - 1) {
        codeBoxes[index + 1].focus();
      }
    });

    box.addEventListener('keydown', function(e) {
      // Backspace - voltar para o campo anterior
      if (e.key === 'Backspace' && this.value === '' && index > 0) {
        codeBoxes[index - 1].focus();
      }
    });

    box.addEventListener('paste', function(e) {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      
      // Distribuir os caracteres colados pelos campos
      for (let i = 0; i < Math.min(pasteData.length, codeBoxes.length - index); i++) {
        if (codeBoxes[index + i]) {
          codeBoxes[index + i].value = pasteData[i];
        }
      }
      
      // Focar no próximo campo vazio ou no último campo
      const nextEmptyIndex = Math.min(index + pasteData.length, codeBoxes.length - 1);
      codeBoxes[nextEmptyIndex].focus();
    });
  });

  // Função para coletar o código completo
  function getCompleteCode() {
    return Array.from(codeBoxes).map(box => box.value).join('');
  }

  // Função para verificar o token
  async function verifyToken() {
    const email = emailInput.value.trim();
    const token = getCompleteCode();

    if (!email) {
      alert('Por favor, digite seu e-mail.');
      emailInput.focus();
      return;
    }

    if (token.length !== 6) {
      alert('Por favor, digite o código completo de 6 caracteres.');
      codeBoxes[0].focus();
      return;
    }

    // Desabilitar botão durante verificação
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verificando...';
    verifyButton.style.opacity = '0.6';

    try {
      const response = await fetch('/api/password-recovery/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      });

      const result = await response.json();

      if (result.success) {
        alert('Código verificado com sucesso!');
        // Redirecionar para página de nova senha
        showPasswordResetForm(email, token);
      } else {
        alert(result.message || 'Código inválido.');
        // Limpar campos de código para nova tentativa
        codeBoxes.forEach(box => box.value = '');
        codeBoxes[0].focus();
      }

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      // Reabilitar botão
      verifyButton.disabled = false;
      verifyButton.textContent = 'Verificar';
      verifyButton.style.opacity = '1';
    }
  }

  // Função para mostrar formulário de nova senha
  function showPasswordResetForm(email, token) {
    const container = document.querySelector('.container');
    container.innerHTML = `
      <h1 class="title">Nova Senha</h1>
      <img src="img/logo.png" alt="Logo" class="logo">
      <p>Digite sua nova senha</p>
      
      <label for="newPassword">Nova Senha</label>
      <input type="password" id="newPassword" class="email-input" placeholder="Digite a nova senha" minlength="6">
      
      <label for="confirmPassword">Confirmar Senha</label>
      <input type="password" id="confirmPassword" class="email-input" placeholder="Confirme a nova senha" minlength="6">
      
      <button class="verify-button" onclick="resetPassword('${email}', '${token}')">Redefinir Senha</button>
    `;
  }

  // Event listener para o botão verificar
  verifyButton.addEventListener('click', verifyToken);

  // Event listener para Enter no campo de email
  emailInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      verifyToken();
    }
  });

  // Event listener para Enter nos campos de código
  codeBoxes.forEach(box => {
    box.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        verifyToken();
      }
    });
  });
});

// Função global para redefinir senha (chamada pelo HTML gerado dinamicamente)
async function resetPassword(email, token) {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const button = document.querySelector('.verify-button');

  if (!newPassword || !confirmPassword) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  if (newPassword.length < 6) {
    alert('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('As senhas não coincidem.');
    return;
  }

  // Desabilitar botão durante o processo
  button.disabled = true;
  button.textContent = 'Redefinindo...';
  button.style.opacity = '0.6';

  try {
    const response = await fetch('/api/password-recovery/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword })
    });

    const result = await response.json();

    if (result.success) {
      alert('Senha redefinida com sucesso!');
      // Redirecionar para página de login
      setTimeout(() => {
        window.location.href = 'Index.html';
      }, 1500);
    } else {
      alert(result.message || 'Erro ao redefinir senha.');
    }

  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao conectar com o servidor. Tente novamente.');
  } finally {
    // Reabilitar botão
    button.disabled = false;
    button.textContent = 'Redefinir Senha';
    button.style.opacity = '1';
  }
}