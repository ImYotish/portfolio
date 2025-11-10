const { MAIN_URL } = window._env_;

async function checkSession() {
  try {
    const res = await fetch(`${MAIN_URL}/check-session`, {
      credentials: "include"
    });
    const data = await res.json();
    console.log("🔎 Résultat checkSession:", data);

    if (data.loggedIn) {
      window.location.href = "../../message/";
    }
  } catch (err) {
    console.error("❌ Erreur checkSession:", err);
  }
}

checkSession();

const passwordEl = document.querySelector('#password');
const togglePassword = document.getElementById('togglePassword');

  togglePassword.addEventListener('click', () => {
      const hidden = passwordEl.type === 'password';
      passwordEl.type = hidden ? 'text' : 'password';
      togglePassword.textContent = hidden ? '👁️' : '🙈';
  })

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value.trim();
  const password = document.querySelector('#password').value
  const resultEl = document.getElementById('result');
  
  if (!username || !password) {
    resultEl.textContent = 'Veuillez remplir tous les champs';
    return;
  }

  try {
    console.log('📝 Tentative de connexion pour:', username);

    // 👉 On utilise MAIN_URL injecté par Nginx via /env.js

    const res = await fetch(`${MAIN_URL}/login`, {
      method: 'POST',
      credentials: 'include', // important pour recevoir le cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log("📨 Réponse backend:", data);

    if (res.ok && data.success) {
      window.location.href = "../../message/";
    } else {
      resultEl.textContent = data.message || 'Erreur lors de la connexion';
    }

  } catch (err) {
    console.error('❌ Erreur réseau:', err);
    resultEl.textContent = 'Erreur de connexion au serveur';
  }
});