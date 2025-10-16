// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Toggle visibilité des mots de passe
  const toggles = document.querySelectorAll('.togglePassword');
  const inputs  = document.querySelectorAll('.password-input');

  toggles.forEach((toggle, i) => {
    toggle.addEventListener('click', () => {
      const input = inputs[i];
      const hidden = input.type === 'password';
      input.type     = hidden ? 'text' : 'password';
      toggle.textContent = hidden ? '🙈' : '👁️';
    });
  });

  // Soumission du formulaire de reset
  const form = document.getElementById('resetForm');
  const resultDiv = document.getElementById('result');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const username       = document.getElementById('username').value.trim();
    const newPassword    = document.getElementById('newPassword').value;
    const confirmPassword= document.getElementById('confirmPassword').value;

    if (!username || !newPassword || !confirmPassword) {
      resultDiv.textContent = 'Tous les champs sont requis ❌';
      return;
    }

    if (newPassword !== confirmPassword) {
      resultDiv.textContent = 'Les mots de passe ne correspondent pas ❌';
      return;
    }

    try {
      // Utilise une URL relative si tu sers ta page avec Express
      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword })
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = '/connected/index.html';
      } else {
        resultDiv.textContent = data.message || (data.error || 'Erreur inconnue ❌');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      resultDiv.textContent = 'Erreur serveur ❌';
    }
  });
});