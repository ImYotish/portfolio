async function sessionCheck() {
  try {
    console.log('🔍 Vérification de session...');
    
    const testRes = await fetch(`http://localhost:3000/check-session`, {
      method: 'GET',
      credentials: 'include',
    });
  
    const testData = await testRes.json();
    console.log('📊 Données de session:', testData);
    
    if (testData.loggedIn) {
      console.log('✅ Utilisateur connecté:', testData.user);
      welcome.textContent = `Bienvenue ${testData.user}, tu es maintenant connecté !`;
      return true;
    } else {
      console.log('❌ Session non reconnue, redirection immédiate...');
      // ⚠️ REDIRECTION IMMÉDIATE sans délai
      window.location.replace('/public/sign-in/index.html'); // replace au lieu de href
      return false;
    }
    
  } catch (err) {
    console.error('❌ Erreur test session:', err);
    // En cas d'erreur, rediriger aussi
    window.location.replace('/public/sign-in/index.html');
    return false;
  }
}

// ⚠️ AJOUT: Événements pour détecter le retour sur la page
window.addEventListener('pageshow', function(event) {
  console.log('📄 Page affichée - depuis cache:', event.persisted);
  
  // Si la page vient du cache (bouton précédent), vérifier la session
  if (event.persisted) {
    console.log('🔄 Page chargée depuis le cache, vérification session...');
    sessionCheck();
  }
});

// ⚠️ AJOUT: Vérifier la session quand la page redevient visible
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    console.log('👁️ Page redevenue visible, vérification session...');
    sessionCheck();
  }
});

// ⚠️ AJOUT: Vérifier la session au focus de la fenêtre
window.addEventListener('focus', function() {
  console.log('🎯 Fenêtre en focus, vérification session...');
  sessionCheck();
});

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Page chargée normalement');
  
      // Vérification initiale
      await sessionCheck();

      const result = document.querySelector('#result');
      const logoutBtn = document.querySelector('#logout');
      const searchBtn = document.getElementById("searchBtn");
      const searchInput = document.getElementById("searchInput");
      const conversationList = document.getElementById("conversationList");
      const mainSidebar = document.getElementById("mainsidebar")

    function addConversation(username) {

        const newConv = document.createElement("div");
          newConv.classList.add(`conversation`);
          newConv.id = `conversation_${username}`
          newConv.innerHTML = `<span>${username}</span>`;

        conversationList.appendChild(newConv);

        const sidebarUser = document.createElement('div');
        sidebarUser.classList.add(`sidebar`);
        sidebarUser.id = `sidebar_${username}`
        sidebarUser.innerHTML = `
        <div class="sidebarHeader">
          <h3 class="sidebarUser">Conversation avec ${username}</h3>
          <button class="closeSidebar">✖</button>
        </div>
        <div class="chatContent" id="chatContent_${username}">
        </div>
        <div class="chatInputZone">
          <input type="text" class="chatInput" placeholder="💬 Ton message…" />
          <button class="messageBtn">Envoyer</button>
        </div>
        `

        
        const messageBtn = sidebarUser.querySelector('.messageBtn')
        const messages = sidebarUser.querySelector('.chatContent')
        

        newConv.addEventListener('click', () => {
          const sidebar = document.querySelectorAll('.sidebar')
          sidebar.forEach(conv => {
            conv.style.display = 'none'
          })
          sidebarUser.style.display = sidebarUser.style.display === 'flex' ? 'none' : 'flex';
        })
        
        const closeBtn = sidebarUser.querySelector('.closeSidebar');
        closeBtn.addEventListener('click', () => {
          sidebarUser.style.display = 'none'
        })

        messageBtn.addEventListener('click', async () => {
          const text = sidebarUser.querySelector('.chatInput')
          const send = text.value

          const res = await fetch('http://localhost:3000/message', {
            method: 'POST',
            credentials: "include",
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({ send, username, send })
          })

          if (!res.ok) {
            result.textContent = "Erreur d'envoi"
          } else {

            const newMessage = document.createElement("div");
              newMessage.classList.add(`message`);
              newMessage.innerHTML = `<span>${send}</span>`;

            text.value = "";

          messages.appendChild(newMessage)
          }
        })

        mainSidebar.appendChild(sidebarUser);
      }

      async function generateConv() {

        const res = await fetch("http://localhost:3000/generateconv", {
          method: "POST",
          credentials: 'include',
          headers: {'Content-type': 'application/json'},
          body: ""
        })

        const data = await res.json()

        if(res.ok) {
          if (!data.data) {
            console.log("aucune conversations")
          } else {

            console.log(data.data.rows.length)

            for (let i = 0; i < data.data.rows.length; i++) {
              const username = data.data.rows[i].username

              addConversation(username)
          
              console.log(username)

              const resEl = await fetch("http://localhost:3000/generatemessage", {
                method: "POST",
                credentials: 'include',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({ username })
            })

            const dataMessage = await resEl.json()

            console.log(dataMessage.data.rows[0].content)
            console.log(dataMessage.data.rows.length)


            const message = document.querySelector(`#chatContent_${username}`)

            for (let i = 0; i < dataMessage.data.rows.length; i++) {
            
              const send = dataMessage.data.rows[i].content

              const newMessage = document.createElement("div");
                newMessage.classList.add(`message`);
                newMessage.innerHTML = `<span>${send}</span>`;

              message.appendChild(newMessage)
            }
          }

          }
        }
      }

      generateConv()

  searchBtn.addEventListener('click', async () => {

    try {
      const username = searchInput.value.trim();

      if (!username) {
        searchInput.value = "";
        console.log("Veuillez remplir le champ")
        return result.textContent = 'Veuillez remplir le champ';
      };

      if (document.getElementById(`sidebar_${username}`)) {
        searchInput.value = "";
        console.log("Utilisateur déjà sélectionné")
        return result.textContent = 'Utilisateur déjà sélectionné';
      }

      const res = await fetch('http://localhost:3000/username', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({username})
      })

      const data = await res.json();

      if (!data.success) {
        console.log("Aucun utilisateur")
        return result.textContent =  data.message;
      } 

      const id = data.id

      const createConvRes = await fetch('http://localhost:3000/createconv', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({id})
      })

      if (!createConvRes.ok) {
        console.log('ça marche pas')
      } else {
        console.log('ça marche pas')
      }

      searchInput.value = "";
      result.textContent = "";

      addConversation(username)

      console.log("Fini")
      }
      catch (err) {
        console.log(err.message);
      }


  });















  // Gestionnaire de logout
  logoutBtn.addEventListener('click', async () => {
    console.log('🚪 Tentative de déconnexion...');
    
    try {
      const res = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      console.log('📨 Réponse logout:', data);

      if (res.ok && data.success) {
        console.log('✅ Déconnexion réussie');
        
        console.log('🍪 Cookies après logout:', document.cookie);
        
        // ⚠️ CHANGEMENT: Redirection immédiate avec replace
        setTimeout(() => {
          window.location.replace('/public/sign-in/index.html');
        }, 1000);
        
      } else {
        console.log('❌ Erreur logout:', data.message);
        result.textContent = data.message || "Erreur de déconnexion";
      }

    } catch (err) {
      console.error('❌ Erreur réseau logout:', err);
      result.textContent = 'Erreur réseau lors de la déconnexion';
    }
  });
});