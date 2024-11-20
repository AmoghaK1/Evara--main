// Function to update user section
function updateUserSection() {
    const loginStatus = localStorage.getItem('loginStatus') || 'open';
    const user = localStorage.getItem('user');
    const flag = localStorage.getItem('flag') || '0';
    const userSection = document.getElementById('user-section');

    if (loginStatus === 'loggedin' && user) {
        userSection.innerHTML = `
            <div class="d-flex align-items-center">
                <a class="btn btn-light" 
                   href="/Sell/sell.html" 
                   role="button" 
                   style="font-size: 0.86rem; 
                          width:6rem; 
                          height: 2.2rem; 
                          margin-right: 1rem;
                          transform: rotate(-0.61deg); 
                          transform-origin: 0 0; 
                          background: white; 
                          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); 
                          border-radius: 40px; 
                          backdrop-filter: blur(4px)">Sell</a>
                <a class="btn btn-light" 
                   href="#" 
                   id="logout-btn"
                   role="button" 
                   style="font-size: 0.86rem; 
                          width:6rem; 
                          height: 2.2rem; 
                          transform: rotate(-0.61deg); 
                          transform-origin: 0 0; 
                          background: white; 
                          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); 
                          border-radius: 40px; 
                          backdrop-filter: blur(4px)">Logout</a>
            </div>
        `;

        // Profile picture click handler
        document.getElementById('pfp').addEventListener('click', function() {
            window.location.href = `/Profile/profile.html?status=loggedin&user=${user}`;
        });

        // Logout handler
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
            window.location.href = '/Home/home-live.html';
        });

        // Show custom alert
        if(flag === '0') {
            showAlert(`Welcome back, ${user}!`);
        } else if(flag === '1') {
            showAlert('Product Uploaded Successfully!');
            localStorage.setItem('flag', '0');
        }
    } else {
        userSection.innerHTML = `
            <a class="btn btn-light" 
               href="/Login/login.html" 
               role="button" 
               style="font-size: 0.70rem; 
                      height: 2rem; 
                      width: 4.7rem; 
                      transform: rotate(-0.61deg); 
                      transform-origin: 0 0; 
                      background: white; 
                      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); 
                      border-radius: 40px; 
                      backdrop-filter: blur(4px)">Login In</a>
        `;
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('loginStatus');
    localStorage.removeItem('user');
    localStorage.removeItem('flag');
    showAlert('Logged out successfully!');
}

// Function to show alert (customize as needed)
function showAlert(message) {
    alert(message);
}

// Initialize page
function initializePage() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    const userParam = urlParams.get('user');
    const flagParam = urlParams.get('flag');

    // Update localStorage if URL parameters exist
    if (statusParam && userParam) {
        localStorage.setItem('loginStatus', statusParam);
        localStorage.setItem('user', userParam);
        if (flagParam) {
            localStorage.setItem('flag', flagParam);
        }
    }

    // Update user section
    updateUserSection();
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);