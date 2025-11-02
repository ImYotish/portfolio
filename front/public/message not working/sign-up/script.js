// script-register.js
document.addEventListener('DOMContentLoaded', () => {
  // Toggle visibilité
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput  = document.getElementById('password');

  togglePassword.addEventListener('click', () => {
    const hidden = passwordInput.type === 'password';
    passwordInput.type = hidden ? 'text' : 'password';
    togglePassword.textContent = hidden ? '🙈' : '👁️';
  });

  // Soumission du formulaire
  const form      = document.getElementById('registerForm');
  const resultDiv = document.getElementById('result');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    resultDiv.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      resultDiv.textContent = 'Tous les champs sont requis ❌';
      return;
    }

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = '/connected/index.html';
      } else {
        resultDiv.textContent = data.message || 'Échec de l\'inscription ❌';
      }
    } catch (err) {
      console.error('Register error:', err);
      resultDiv.textContent = 'Erreur de communication ❌';
    }
  });
});