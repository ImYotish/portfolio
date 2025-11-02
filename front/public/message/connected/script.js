const { BASE_URL, MAIN_URL, CHATGPT_URL, MESSAGE_URL } = window._env_;

const welcome = document.querySelector('#welcome'); // ⚠️ assure-toi d’avoir un <div id="welcome"></div> dans ton HTML
const result = document.querySelector('#result');
const logoutBtn = document.querySelector('#logout');
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const conversationList = document.getElementById("conversationList");
const mainSidebar = document.getElementById("mainsidebar");

// ------------------- Vérification de session -------------------
async function sessionCheck() {
  try {
    console.log('🔍 Vérification de session...');

    const res = await fetch(`${MAIN_URL}/check-session`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json();
    console.log('📊 Données de session:', data);

    if (res.ok && data.loggedIn && data.user) {
      console.log('✅ Utilisateur connecté:', data.user);
      welcome.textContent = `Bienvenue ${data.user.username || data.user.email}, tu es maintenant connecté !`;
      return true;
    } else {
      console.warn('❌ Session non reconnue, redirection immédiate...');
      window.location.replace('../sign-in/index.html');
      return false;
    }
  } catch (err) {
    console.error('❌ Erreur test session:', err);
    window.location.replace('../sign-in/index.html');
    return false;
  }
}

sessionCheck();

// Vérifications auto quand la page revient en focus/cache
window.addEventListener('pageshow', e => { if (e.persisted) sessionCheck(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sessionCheck(); });
window.addEventListener('focus', () => sessionCheck());

// ------------------- DOM Ready -------------------
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Page chargée normalement');
  const loggedIn = await sessionCheck();
  if (!loggedIn) return;

  // ------------------- Ajout conversation -------------------
  function addConversation({ id, username }) {
    const newConv = document.createElement("div");
    newConv.classList.add("conversation");
    newConv.id = `conversation_${id}`;
    newConv.innerHTML = `<span>${username}</span>`;
    conversationList.appendChild(newConv);

    const sidebarUser = document.createElement('div');
    sidebarUser.classList.add("sidebar");
    sidebarUser.id = `sidebar_${id}`;
    sidebarUser.innerHTML = `
      <div class="sidebarHeader">
        <h3 class="sidebarUser">Conversation avec ${username}</h3>
        <button class="closeSidebar">✖</button>
      </div>
      <div class="chatContent" id="chatContent_${id}"></div>
      <div class="chatInputZone">
        <input type="text" class="chatInput" placeholder="💬 Ton message…" />
        <button class="messageBtn">Envoyer</button>
      </div>
    `;

    const messageBtn = sidebarUser.querySelector('.messageBtn');
    const messages = sidebarUser.querySelector('.chatContent');

    // Affichage sidebar
    newConv.addEventListener('click', () => {
      document.querySelectorAll('.sidebar').forEach(conv => conv.style.display = 'none');
      sidebarUser.style.display = 'flex';
    });

    sidebarUser.querySelector('.closeSidebar').addEventListener('click', () => {
      sidebarUser.style.display = 'none';
    });

    // Envoi message
    messageBtn.addEventListener('click', async () => {
      const text = sidebarUser.querySelector('.chatInput');
      const content = text.value.trim();
      if (!content) return;

      try {
        const res = await fetch(`${MESSAGE_URL}/message`, {
          method: 'POST',
          credentials: "include",
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ content, recipientId: id })
        });

        if (!res.ok) {
          result.textContent = "Erreur d'envoi du message";
        } else {
          const newMessage = document.createElement("div");
          newMessage.classList.add("message");
          newMessage.innerHTML = `<span>${content}</span>`;
          messages.appendChild(newMessage);
          text.value = "";
          messages.scrollTop = messages.scrollHeight;
        }
      } catch (err) {
        console.error("❌ Erreur envoi message:", err);
        result.textContent = "Erreur réseau lors de l'envoi";
      }
    });

    mainSidebar.appendChild(sidebarUser);
  }

  // ------------------- Génération conversations -------------------
  async function generateConv() {
    try {
      const res = await fetch(`${MESSAGE_URL}/generateconv`, {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-type': 'application/json' }
      });

      const data = await res.json();
      if (res.ok && data.data?.length) {
        for (let row of data.data) {
          const { id, username } = row;
          addConversation({ id, username });

          const resEl = await fetch(`${MESSAGE_URL}/generatemessage`, {
            method: "POST",
            credentials: 'include',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ id })
          });

          const dataMessage = await resEl.json();
          const messageZone = document.querySelector(`#chatContent_${id}`);

          for (let msg of dataMessage.data) {
            const newMessage = document.createElement("div");
            newMessage.classList.add("message");
            newMessage.innerHTML = `<span>${msg.content}</span>`;
            messageZone.appendChild(newMessage);
          }
        }
      } else {
        console.log("ℹ️ Aucune conversation trouvée");
      }
    } catch (err) {
      console.error("❌ Erreur génération conversations:", err);
    }
  }
  generateConv();

  // ------------------- Recherche utilisateur -------------------
  searchBtn.addEventListener('click', async () => {
    try {
      const username = searchInput.value.trim();
      if (!username) {
        result.textContent = 'Veuillez remplir le champ';
        return;
      }

      const res = await fetch(`${MESSAGE_URL}/username`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await res.json();
      if (!data.success) {
        result.textContent = data.message;
        return;
      }

      const { id: userId, username: foundUsername } = data;

      if (document.getElementById(`sidebar_${userId}`)) {
        result.textContent = 'Utilisateur déjà sélectionné';
        return;
      }

      await fetch(`${MESSAGE_URL}/createconv`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });

      addConversation({ id: userId, username: foundUsername });

      searchInput.value = "";
      result.textContent = "";
    } catch (err) {
      console.error("❌ Erreur recherche utilisateur:", err);
      result.textContent = "Erreur réseau lors de la recherche";
    }
  });

  // ------------------- Logout -------------------
  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`${MAIN_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.replace('../sign-in/index.html');
      } else {
        result.textContent = data.message || "Erreur de déconnexion";
      }
    } catch (err) {
      console.error("❌ Erreur logout:", err);
      result.textContent = 'Erreur réseau lors de la déconnexion';
    }
  });
});