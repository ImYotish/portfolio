const toggleBtn = document.querySelector('#togglePassword')
const passwordEl = document.querySelector('#password')
const usernameEl = document.querySelector('#username')
const result = document.querySelector('#result')
const form = document.querySelector('#registerForm')

form.addEventListener('submit', async e => {

    e.preventDefault();
    result.textContent = ""

    const username = usernameEl.value.trim()
    const password = passwordEl.value.trim()

    if (!username || !password) {
        return result.textContent = "Veuillez remplir tous les champs";
    }

    console.log(JSON.stringify({username, password}));

    try {
        const res = await fetch('http://localhost:3000/register', {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const data = await res.json()

        if (!res.ok && !data.success) {
            return result.textContent = data.message
        } else {
            window.location.href = '/public/connected/index.html';
        }
    }
    catch(err) {
        console.log(err)
    }
});


toggleBtn.addEventListener('click', () => {
    passwordEl.type = passwordEl.type === 'password' ? 'text' : 'password';
    toggleBtn.textContent = toggleBtn.textContent === '🙈' ? '👁️' : '🙈';
})
