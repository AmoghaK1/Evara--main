window.onload = function(){
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    console.log(status);
    if(status === 'registered'){
      alert('Registered Successfully! Please login to Continue..');
    }
  }


document.addEventListener('DOMContentLoaded', function() {
  // Function to handle user login
  async function handleLogin(event) {
    event.preventDefault();
    
    const identifier = document.getElementById('identifier').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem('userData', JSON.stringify({
          username: data.user.username,
          email: data.user.email,
          phoneNumber: data.user.phoneNumber,
          userId: data.user.id
        }));
        
        // Redirect to home page with status
        window.location.href = `/Home/home-live.html?status=loggedin&user=${data.user.username}`;
      } else {
        alert(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  }

  // Add event listener to the form
  const loginForm = document.querySelector('.content__form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Function to check if user is logged in
  function checkLoginStatus() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user;
    }
    return null;
  }

  // Function to handle logout
  function logout() {
    localStorage.removeItem('userData');
    // Redirect to login page
    window.location.href = '/Login/login.html';
  }
});