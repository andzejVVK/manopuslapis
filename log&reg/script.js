document.getElementById('loginButton').addEventListener('click', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // gmailo validacija
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
        errorMessage.textContent = 'Abu laukai privalo buti užpildyti.';
        return;
    }

    if (!emailPattern.test(email)) {
        errorMessage.textContent = 'Neteisingas paštas.';
        return;
    }

    if (email === 'a.listvanas@gmail.com' && password === 'andrzej123') {
        alert('Login successful!');
        errorMessage.textContent = '';
    } else {
        errorMessage.textContent = 'Neteisingas Paštas arba slaptažodis.';
    }
});
