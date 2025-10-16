const toggleBtn = document.querySelector('#togglePassword')
const passwordEl = document.querySelector('#password')
const usernameEl = document.querySelector('#username')

toggleBtn.addEventListener('click', () => {
    passwordEl.type = passwordEl.type === 'password' ? 'text' : 'password';
    toggleBtn.textContent = toggleBtn.textContent === '🙈' ? '👁️' : '🙈';
})


document.getElementById('loginForm').addEventListener('submit', async (e) => {

  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    document.getElementById('result').textContent = 'Veuillez remplir tous les champs';
    return;
  }
  
  try {
    console.log('🔐 Tentative de connexion pour:', username);
    console.log('🌐 Origine actuelle:', window.location.origin);
    
    // ⚠️ CHANGEMENT: Utiliser localhost au lieu de 127.0.0.1
    const serverURL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : 'http://localhost:3000'; // Forcer localhost
    
    console.log('📡 URL du serveur:', serverURL);
    
    const res = await fetch(`${serverURL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    console.log('📨 Réponse serveur:', data);
    
    // Debug détaillé des cookies
    console.log('🍪 Document.cookie après login:', document.cookie);
    console.log('🍪 Cookies disponibles:', document.cookie.split(';'));
    
    if (res.ok && data.success) {
      console.log('✅ Connexion réussie');
      
      // Test immédiat de la session
      setTimeout(async () => {
        try {
          const testRes = await fetch(`${serverURL}/check-session`, {
            method: 'GET',
            credentials: 'include'
          });
        
          const testData = await testRes.json()
          
          if (testData.loggedIn) {
            window.location.href = '/public/connected/index.html';
          } else {
            console.log('❌ Session non reconnue');
            document.getElementById('result').textContent = 'Erreur de session';
          }
          
        } catch (err) {
          console.error('❌ Erreur test session:', err);
        }
      }, 200);
      
    } else {
      document.getElementById('result').textContent = data.message || 'Erreur de connexion';
    }
    
  } catch (err) {
    console.error('❌ Erreur réseau:', err);
    document.getElementById('result').textContent = 'Erreur de connexion au serveur';
  }
});

// Debug au chargement
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌐 Page chargée sur:', window.location.origin);
  console.log('🍪 Cookies au chargement:', document.cookie);
});