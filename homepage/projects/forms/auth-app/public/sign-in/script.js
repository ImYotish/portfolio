document.addEventListener('DOMContentLoaded', () => {
  // Toggle mot de passe (facultatif)
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput  = document.getElementById('password');
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const hidden = passwordInput.type === 'password';
      passwordInput.type     = hidden ? 'text' : 'password';
      togglePassword.textContent = hidden ? '🙈' : '👁️';
    });
  }

  // Formulaire de login
  const form      = document.getElementById('loginForm');
  const resultDiv = document.getElementById('result');
  if (!form || !resultDiv) {
    console.error('⚠️ script-login.js : form ou result introuvable');
    return;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    resultDiv.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = passwordInput?.value || '';

    if (!username || !password) {
      resultDiv.textContent = 'Tous les champs sont requis ❌';
      return;
    }

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('⚠️ le serveur n’a pas renvoyé du JSON valide', jsonErr);
        resultDiv.textContent = 'Réponse serveur invalide ❌';
        return;
      }

      console.log('↪ /login response', res.status, data);

      if (res.ok && data.success) {
        console.log('✅ Connexion réussie, redirection...');
        // tu peux aussi utiliser location.assign
        window.location.href = '/connected/index.html';
      } else {
        // Affiche statut + message d’erreur
        const msg = data.message || data.error || `Échec (${res.status})`;
        resultDiv.textContent = msg;
      }
    } catch (err) {
      console.error('❌ Erreur fetch /login :', err);
      resultDiv.textContent = 'Erreur de communication ❌';
    }
  });
});