const { MAIN_URL } = window._env_;

// Fonction utilitaire pour vérifier la session
async function checkSession() {
  try {
    const res = await fetch(`${MAIN_URL}/check-session`, {
      credentials: "include"
    });
    const data = await res.json();
    console.log("🔎 Résultat checkSession:", data);

    if (data.loggedIn) {
      // Si déjà connecté → redirection directe
      window.location.href = "/message/connected/index.html";
    }
  } catch (err) {
    console.error("❌ Erreur checkSession:", err);
  }
}

checkSession();

// 👉 Appel automatique au chargement de la page
document.addEventListener("DOMContentLoaded", checkSession);

// 👉 Ton code d’inscription
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value.trim();
  const password = document.querySelector('#password').value;
  const resultEl = document.getElementById('result');

  if (!username || !password) {
    resultEl.textContent = 'Veuillez remplir tous les champs';
    return;
  }

  try {
    console.log('📝 Tentative d’inscription pour:', username);

    const res = await fetch(`${MAIN_URL}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    // 👇 Ajout de cette vérification
    if (!res.ok) {
      // Tente de lire le corps de l'erreur s'il y en a un
      const errorData = await res.json().catch(() => ({})); // .catch au cas où le corps n'est pas du JSON
      throw new Error(errorData.message || `Erreur HTTP: ${res.status}`);
    }

    const data = await res.json();
    console.log("📨 Réponse backend:", data);

    if (data.success) {
      console.log("Redirection");
      window.location.href = "/message/connected/index.html";
    } else {
      resultEl.textContent = data.message || 'Erreur lors de la création du compte';
    }

  } catch (err) {
    console.error('❌ Erreur:', err);
    // err.message sera plus précis grâce au 'throw new Error'
    resultEl.textContent = err.message || 'Erreur de connexion au serveur';
  }
});