const { MAIN_URL } = window._env_;

// Utility function to check session
async function checkSession() {
  try {
    const res = await fetch(`${MAIN_URL}/check-session`, {
      credentials: "include"
    });
    const data = await res.json();
    console.log("🔎 checkSession result:", data);

    if (data.loggedIn) {
      // If already logged in → redirect
      window.location.href = "../../message/index.html";
    }
  } catch (err) {
    console.error("❌ checkSession error:", err);
  }
}

checkSession();

// Auto-call on page load
document.addEventListener("DOMContentLoaded", checkSession);

const passwordEl = document.querySelector('#password');
const togglePassword = document.getElementById('togglePassword');

  togglePassword.addEventListener('click', () => {
      const hidden = passwordEl.type === 'password';
      passwordEl.type = hidden ? 'text' : 'password';
      togglePassword.textContent = hidden ? '👁️' : '🙈';
  })

// Sign-up code
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value.trim();
  const password = document.querySelector('#password').value;
  const resultEl = document.getElementById('result');

  if (!username || !password) {
    resultEl.textContent = 'Please fill in all fields';
    return;
  }

  try {
    console.log('📝 Attempting registration for:', username);

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
      window.location.href = "../../message/index.html";
    } else {
      resultEl.textContent = data.message || 'Error creating account';
    }

  } catch (err) {
    console.error('❌ Error:', err);
    // err.message will be more precise because of the thrown Error
    resultEl.textContent = err.message || 'Server connection error';
  }
});