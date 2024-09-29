const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.message === 'Registration successful!!') {
          document.getElementById('register-message').innerText = 'Registration successful! You can now log in.';
          setTimeout(() => {
            window.location.href = '/'; // Redirect to the root URL
          }, 2000);
        } else {
          document.getElementById('register-message').innerText = data.message;
        }
      } catch (error) {
        console.error(error);
        document.getElementById('register-message').innerText = 'An error occurred. Please try again.';
      }
    } else {
      document.getElementById('register-message').innerText = 'Please fill in all fields';
    }
  });
}