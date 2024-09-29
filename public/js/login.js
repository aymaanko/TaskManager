document.addEventListener('DOMContentLoaded', () => {
  console.log('Script is running');
  if (window.location.pathname === '/') {
    const form = document.getElementById('login-form');
    console.log('Form:', form); // Add this line to log the form variable
    if (form) {
      console.log('Form found');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
          document.getElementById('login-message').innerText = 'Please enter both username and password';
          return;
        }

        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          document.getElementById('login-message').innerText = data.message;

          if (data.success) {
            sessionStorage.setItem('userId', data.userId);
            setTimeout(() => {
              window.location.href = '/tasks.html'; // Redirect to the tasks.html page
            }, 2000);
          }
        } catch (error) {
          console.error('Error:', error.message, error.stack);
          document.getElementById('login-message').innerText = 'An error occurred. Please try again.';
        }
      });
    } else {
      console.error('Element with id "login-form" not found');
    }
  } else {
    console.log('Not running in login.html page');
  }
});