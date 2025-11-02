// public/connected/messaging.js
document.addEventListener('DOMContentLoaded', initMessaging);

async function initMessaging() {
  const userId = await fetchCurrentUser();
  if (!userId) return;

  const discuss = document.querySelector('.discuss');
  discuss.innerHTML = '';
  const dynamicStyle = document.createElement('style');
  document.head.appendChild(dynamicStyle);

  setupAddUserForm(userId, discuss, dynamicStyle);
  await loadConversations(userId, discuss, dynamicStyle);
}

async function fetchCurrentUser() {
  try {
    const res = await fetch('/me');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { id } = await res.json();
    return id;
  } catch (err) {
    console.error('Utilisateur non authentifié:', err);
    window.location.href = '/sign-in/index.html';
    return null;
  }
}

function setupAddUserForm(userId, container, dynamicStyle) {
  const form   = document.querySelector('.add-user');
  const field  = document.getElementById('add-field');
  const result = form.querySelector('.result');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    result.textContent = '';
    const username = field.value.trim();
    if (!username) {
      result.textContent = 'Saisis un nom d’utilisateur ❌';
      return;
    }

    let res, payload;
    try {
      res = await fetch('/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withUsername: username })
      });
    } catch (err) {
      console.error('Fetch /start-conversation failed:', err);
      result.textContent = 'Erreur communication ❌';
      return;
    }

    console.log('↪ /start-conversation status:', res.status);

    if (!res.ok) {
      result.textContent = `Erreur serveur (${res.status}) ❌`;
      return;
    }

    try {
      payload = await res.json();
    } catch (err) {
      console.error('Invalid JSON from /start-conversation:', err);
      result.textContent = 'Erreur réponse serveur ❌';
      return;
    }

    console.log('↪ /start-conversation payload:', payload);

    if (payload.success) {
      field.value = '';
      await loadConversations(userId, container, dynamicStyle);
    } else {
      result.textContent = payload.message || `Erreur (${res.status}) ❌`;
    }
  });
}

async function loadConversations(userId, container, dynamicStyle) {
  container.innerHTML = '';
  try {
    const convos = await fetch('/conversations').then(r => r.json());
    convos.forEach(conv => {
      const block = createConversationBlock(conv, dynamicStyle);
      container.appendChild(block);

      block
        .querySelector(`#toggle-menu-${conv.id}`)
        .addEventListener('change', async evt => {
          if (evt.target.checked) {
            const msgs = await fetchMessages(conv.id);
            renderMessages(block, msgs, userId);
          }
        });
    });
  } catch (err) {
    console.error('Impossible de charger les conversations:', err);
  }
}

async function fetchMessages(convId) {
  const res = await fetch(`/messages?convId=${convId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function sendMessage(convId, content) {
  const res = await fetch('/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId: convId, content })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function createConversationBlock({ id, username, lastMessage }, dynamicStyle) {
  const toggleId = `toggle-menu-${id}`;
  const sendId   = `send-message-${id}`;

  dynamicStyle.sheet.insertRule(
    `#${toggleId}:checked ~ .side-message { width:50vw; visibility:visible; }`,
    dynamicStyle.sheet.cssRules.length
  );

  const el = document.createElement('div');
  el.className = 'message';
  el.innerHTML = `
    <input type="checkbox" id="${toggleId}" hidden>
    <label for="${toggleId}" class="menu-toggle">
      <h2 class="username">${username}</h2>
      <p class="last-message">${lastMessage || ''}</p>
    </label>
    <div class="side-message">
      <div class="content">
        <div class="message-user">${username}</div>
        <div class="separator"></div>
      </div>
      <div class="conv"></div>
      <div class="chat">
        <textarea class="chat-message" rows="1" placeholder="Envoyer un message"></textarea>
        <input type="checkbox" id="${sendId}" hidden>
        <label for="${sendId}" class="send-message">
          <i class="material-icons">send</i>
        </label>
      </div>
    </div>
  `;
  return el;
}

function renderMessages(block, messages, userId) {
  const convContainer = block.querySelector('.conv');
  convContainer.innerHTML = '';

  messages.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className =
      msg.sender_id === userId ? 'message-sender' : 'message-receiver';
    bubble.innerHTML = `<p>${msg.content}</p>`;
    convContainer.appendChild(bubble);
  });

  convContainer.scrollTop = convContainer.scrollHeight;
  setupSendHandler(block, userId);
}

function setupSendHandler(block, userId) {
  const textarea = block.querySelector('.chat-message');
  const label    = block.querySelector('label.send-message');
  if (label.dataset.init) return;
  label.dataset.init = 'true';

  label.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text) return;
    const convId = +label.htmlFor.split('-').pop();

    try {
      const newMsg = await sendMessage(convId, text);
      console.log('↪ POST /messages:', newMsg);
      const bubble = document.createElement('div');
      bubble.className = 'message-sender';
      bubble.innerHTML = `<p>${newMsg.content}</p>`;
      block.querySelector('.conv').appendChild(bubble);
      textarea.value = '';
      block.querySelector('.conv').scrollTop =
        block.querySelector('.conv').scrollHeight;
    } catch (err) {
      console.error('Erreur envoi message:', err);
    }
  });
}