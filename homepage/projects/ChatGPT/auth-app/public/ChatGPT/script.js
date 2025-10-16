document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#form');
  const input = document.querySelector('#input');
  const presentation = document.querySelector('#presentation');
  const disclaimer = document.querySelector('#disclaimer');
  const text = document.querySelector('#text');
  const content = document.querySelector('#content');
  const load = document.querySelector('#load');
  const loader = document.querySelector('.loader');
  const detect = document.querySelector('#loader');
  const nav = document.querySelector('#nav');
  const main = document.querySelector('#main');
  const sidebar = document.querySelector('#sidebar')
  const sidebarText = document.querySelector('#sidebarText')
  const detec = document.querySelector('#out')
  const newConv = document.querySelector('#newConv')
  const newChat = document.querySelector('#newChat')
  const iconChatGPT = document.querySelector('#icon-chatgpt')
  const iconHover = document.querySelector('.icon-hover')
  const iconDefault = document.querySelector('.icon-default')
  const open = document.querySelector('#open')

  function conv(a) {

    if (a.innerHTML) {
      input.classList.remove('justify-center', 'h-screen');
      presentation.classList.add('invisible', 'absolute');
      disclaimer.classList.remove('invisible');
      form.classList.remove('max-w-4xl');
      form.classList.add('max-w-5xl');
    }
  }

  conv(content)

  async function api(body, onToken) {
    const reader = body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      onToken(chunk)
    }
  }

  open.addEventListener('mouseenter', () => {

    document.documentElement.style.setProperty('--sidebar-width', '20rem');
    sidebarText.textContent = 'Fermer la barre latérale';
    newChat.style.display = 'none';
    newConv.textContent = 'Nouveau chat';
    newConv.style.opacity = '1';
    newConv.classList.remove('hidden')
    iconChatGPT.classList.remove('hidden', 'absolute')
    iconHover.style.display = 'none';
    iconDefault.style.color = 'inline';

  })

  open.addEventListener('mouseleave', () => {
    if (detect.textContent === 'fermé') {
      document.documentElement.style.setProperty('--sidebar-width', '4rem');
      sidebarText.textContent = 'Ouvrir la barre latérale';
      newChat.style.display = 'inline';
      newConv.textContent = '';
      newConv.style.opacity = '0';
      newConv.classList.add('hidden')
      iconChatGPT.classList.add('hidden', 'absolute')
    }
  })


  sidebar.addEventListener('mouseenter', () => {
      const currentWidth = getComputedStyle(document.documentElement)
        .getPropertyValue('--sidebar-width')
        .trim(); // supprime espaces

      if (currentWidth === '4rem') {
        iconHover.style.display = 'inline';
        iconDefault.style.color = 'none';
      }

      sidebar.addEventListener('click', () => {    

        if (currentWidth === '20rem') {
          // On ferme
          document.documentElement.style.setProperty('--sidebar-width', '4rem');
          sidebarText.textContent = 'Ouvrir la barre latérale';
          newChat.style.display = 'inline';
          newConv.textContent = '';
          newConv.style.opacity = '0';
          newConv.classList.add('hidden')
          iconChatGPT.classList.add('hidden', 'absolute')
          detect.textContent = 'fermé'

        } else {
          // On ouvre
          document.documentElement.style.setProperty('--sidebar-width', '20rem');
          sidebarText.textContent = 'Fermer la barre latérale';
          newChat.style.display = 'none';
          newConv.textContent = 'Nouveau chat';
          newConv.style.opacity = '1';
          newConv.classList.remove('hidden')
          iconChatGPT.classList.remove('hidden', 'absolute')
          iconHover.style.display = 'none';
          iconDefault.style.color = 'inline';
          detect.textContent = 'ouvert'
        }
      })
        
    });

    sidebar.addEventListener('mouseleave', () => {
      const currentWidth = getComputedStyle(document.documentElement)
        .getPropertyValue('--sidebar-width')
        .trim(); // supprime espaces

      if (currentWidth === '4rem') {
        iconHover.style.display = 'none';
        iconDefault.style.color = 'inline';
      }
    });
    

    
  

  load.style.display = 'none';
  nav.style.setProperty('position', 'fixed', 'important');
  nav.style.setProperty('visibility', 'visible', 'important');

  main.style.setProperty('position', 'static', 'important');
  main.style.setProperty('visibility', 'visible', 'important');

  text.focus();

  text.addEventListener('input', () => {
    text.style.height = 'auto';
    
    text.style.height = text.scrollHeight + 'px'
  })

  text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
  })

  form.addEventListener('submit', async e => {
    e.preventDefault

    const messages = [{ role: 'user', content: text.value.trim() }]


    console.log(messages)

    const res = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
      })
    })

    const id = res.headers.get('X-Conv-Id');

    console.log(id)

    
    if (id) {
      console.log(id)
      window.location.href = `/public/ChatGPT/${id}`;
      console.log(id)
    } else {
      console.error('ID manquant dans la réponse');
    }

    const out = document.createElement('div');
    out.classList.add('out')

    const inValue = document.createElement('div');
    inValue.classList.add('flex', 'justify-end');

    content.appendChild(inValue);

    conv(content)


    const div = document.createElement('div');
    div.classList.add('flex', 'bg-black/10', 'p-2', 'rounded-lg');
    div.textContent = text.value;

    inValue.appendChild(div);

    text.value = "";
    text.style.height = "";
    
    let fullText = ""

    api(res.body, (token) => {
      fullText += token;
      out.innerHTML = marked.parse(fullText);
      content.appendChild(out);
    })

    text.focus()
    }
  )})