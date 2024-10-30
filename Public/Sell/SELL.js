document.getElementById('sellForm').addEventListener('submit', function(e) {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userID = userData.userID;
    const username = userData.username;
    
    // Add hidden fields to the form
    const userIDInput = document.createElement('input');
    userIDInput.type = 'hidden';
    userIDInput.name = 'userID';
    userIDInput.value = userID;
    this.appendChild(userIDInput);
  
    const usernameInput = document.createElement('input');
    usernameInput.type = 'hidden';
    usernameInput.name = 'username';
    usernameInput.value = username;
    this.appendChild(usernameInput);
  });