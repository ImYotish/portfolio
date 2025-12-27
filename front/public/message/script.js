const { BASE_URL, MAIN_URL, CHATGPT_URL, MESSAGE_URL } = window._env_;

const welcome = document.querySelector('#welcome'); // ⚠️ make sure you have a <div id="welcome"></div> in your HTML
const result = document.querySelector('#result');
const logoutBtn = document.querySelector('#logout');
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const conversationList = document.getElementById("conversationList");
const mainSidebar = document.getElementById("mainsidebar");

// ------------------- Session check -------------------
async function sessionCheck() {
  try {
    console.log('🔍 Checking session...');

    const res = await fetch(`${MAIN_URL}/check-session`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json();
    console.log('📊 Session data:', data);

    if (res.ok && data.loggedIn && data.user) {
      console.log('✅ User connected:', data.user);
      welcome.textContent = `Welcome ${data.user.username || data.user.email}, you're now connected !`;
      document.body.style.display = 'block'
      return true;
    } else {
      console.warn('❌ Session not recognized, immediate redirect...');
      window.location.replace('./login/index.html'); 
      return false;
    }
  } catch (err) {
  console.error('❌ Session check error:', err);
    window.location.replace('./login/index.html'); 
    return false;
  }
}

sessionCheck();

// ------------------- DOM Ready -------------------
document.addEventListener('DOMContentLoaded', async () => {

  // ------------------- Add conversation -------------------
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
        <h3 class="sidebarUser">Conversation with ${username}</h3>
        <button class="closeSidebar">✖</button>
      </div>
      <div class="chatContent" id="chatContent_${id}"></div>
      <div class="chatInputZone">
        <input type="text" class="chatInput" placeholder="💬 Your message…" />
        <button class="messageBtn">Send</button>
      </div>
    `;

    const messageBtn = sidebarUser.querySelector('.messageBtn');
    const messages = sidebarUser.querySelector('.chatContent');

    // Show sidebar
    newConv.addEventListener('click', () => {
      document.querySelectorAll('.sidebar').forEach(conv => conv.style.display = 'none');
      sidebarUser.style.display = 'flex';
    });

    sidebarUser.querySelector('.closeSidebar').addEventListener('click', () => {
      sidebarUser.style.display = 'none';
    });

    // Send message
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
          result.textContent = "Message sending error";
        } else {
          const newMessage = document.createElement("div");
          newMessage.classList.add("message");
          newMessage.innerHTML = `<span>${content}</span>`;
          messages.appendChild(newMessage);
          text.value = "";
          messages.scrollTop = messages.scrollHeight;
        }
      } catch (err) {
        console.error("❌ Message sending error:", err);
        result.textContent = "Network error while sending";
      }
    });

    mainSidebar.appendChild(sidebarUser);
  }

  // ------------------- Generate conversations -------------------
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
        console.log("ℹ️ No conversation found");
      }
    } catch (err) {
      console.error("❌ Conversation generation error:", err);
    }
  }
  generateConv();

  // ------------------- User search -------------------
  searchBtn.addEventListener('click', async () => {
    try {
      const username = searchInput.value.trim();
      if (!username) {
        result.textContent = 'Please fill in the field';
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
        result.textContent = 'User already selected';
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
      console.error("❌ User search error:", err);
      result.textContent = "Network error while searching";
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
        window.location.replace('./login/index.html');
      } else {
        result.textContent = data.message || "Logout error";
      }
    } catch (err) {
      console.error("❌ Logout error:", err);
      result.textContent = 'Network error while disconnecting';
    }
  });
});