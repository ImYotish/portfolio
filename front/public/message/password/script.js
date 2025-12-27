const toggleBtn = document.querySelectorAll('.togglePassword');
const passwordEl = document.querySelectorAll('.password');
const usernameEl = document.querySelector('#username')
const form = document.querySelector('#passwordForm')
const result = document.querySelector('#result')

toggleBtn.forEach((btn, i) => {
    const password = passwordEl[i]
    btn.addEventListener('click', () => {
        const hidden = password.type === 'password';
        password.type = hidden ? 'text' : 'password';
        btn.textContent = hidden ? '👁️' : '🙈';
    })
});

form.addEventListener('submit', async e => {
    e.preventDefault();
    result.textContent = "";


    const password = passwordEl[0].value.trim();
    const password2 = passwordEl[1].value.trim();
    const username = usernameEl.value.trim();

    console.log(password, password2, username)

    if (!username || !password || !password2) {
        return result.textContent = "Please fill in all fields";
    }

    if (password !== password2) {
        return result.textContent = "Passwords do not match";
    }

    try {
        const res = await fetch('http://localhost:3000/message/password', {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const data = await res.json()

        console.log(res)
        console.log(data)

        if (!res.ok) {
            result.textContent = data.message
        } if (data.success) {
            window.location.href = '../../message/index.html';
        }
        
    }
    catch(err) {
        return console.log (err.message)
    }
});
