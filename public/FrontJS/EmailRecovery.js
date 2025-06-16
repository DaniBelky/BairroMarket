// public/FrontJS/EmailRecovery.js
let countdownInterval;
let timeLeft = 0;

// Função para iniciar o countdown
function startCountdown(minutes = 2) {
  timeLeft = minutes * 60; // converter para segundos
  const resendText = document.querySelector('.resend-text em');
  
  countdownInterval = setInterval(() => {
    const minutesLeft = Math.floor(timeLeft / 60);
    const secondsLeft = timeLeft % 60;
    
    if (timeLeft > 0) {
      resendText.textContent = `Reenviar código em ${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')} minutos`;
      timeLeft--;
    } else {
      clearInterval(countdownInterval);
      resendText.textContent = 'Clique aqui para reenviar o código';
      resendText.style.cursor = 'pointer';
      resendText.style.textDecoration = 'underline';
      resendText.onclick = resendCode;
    }
  }, 1000);
}

// Função para reenviar código
async function resendCode() {
  const email = document.getElementById('email').value.trim();
  
  if (!email) {
    alert('Por favor, digite seu e-mail primeiro.');
    return;
  }

  try {
    const response = await fetch('/api/password-recovery/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (result.success) {
      alert('Novo código enviado para seu e-mail!');
      startCountdown(2); // Reiniciar countdown
    } else {
      alert(result.message || 'Erro ao reenviar código.');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao conectar com o servidor.');
  }
}

// Função para solicitar código de recuperação
async function requestRecoveryCode() {
  const email = document.getElementById('email').value.trim();
  const button = document.querySelector('.send-code-button');
  
  if (!email) {
    alert('Por favor, digite seu e-mail.');
    return;
  }

  // Validar formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Por favor, digite um e-mail válido.');
    return;
  }

  // Desabilitar botão durante o processo
  button.disabled = true;
  button.textContent = 'Enviando...';
  button.style.opacity = '0.6';

  try {
    const response = await fetch('/api/password-recovery/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (result.success) {
      alert('Código de verificação enviado para seu e-mail!');
      // Iniciar countdown
      startCountdown(2);
      // Redirecionar para a página de verificação
      setTimeout(() => {
        window.location.href = 'RecuperaSenha.html';
      }, 1500);
    } else {
      alert(result.message || 'Erro ao enviar código de verificação.');
    }

  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao conectar com o servidor. Tente novamente.');
  } finally {
    // Reabilitar botão
    button.disabled = false;
    button.textContent = 'Enviar Código';
    button.style.opacity = '1';
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar event listener ao botão
  const sendButton = document.querySelector('.send-code-button');
  if (sendButton) {
    sendButton.addEventListener('click', requestRecoveryCode);
  }

  // Adicionar funcionalidade de Enter no campo de email
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        requestRecoveryCode();
      }
    });
  }
});