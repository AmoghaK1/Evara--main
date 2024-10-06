 // On window load, check if the user is logged in via the session
 window.onload = function() {
  // Fetch the session data to check if the user is logged in
  fetch('http://localhost:3000/session')
    .then(response => response.json())
    .then(data => {
      const userSection = document.getElementsByClassName('bellandlogin');
      
      if (data.loggedIn) {
        // User is logged in, replace login button with profile picture
        userSection.innerHTML = `
          <img src="${data.profilePicture}" alt="Profile Picture" id="pfp" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer;" />
        `;
        
        // Add event listener to redirect to profile page on profile picture click
        document.getElementById('pfp').addEventListener('click', function() {
          window.location.href = '/profile';
        });
      } else {
        // User is not logged in, keep the login button
        userSection.innerHTML = `
          <a class="btn btn-light" href="/Login/login.html" role="button" style="font-size: 0.70rem; height: 2rem; transform: rotate(-0.61deg); transform-origin: 0 0; background: white; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 40px; backdrop-filter: blur(4px)">Login In</a>
        `;
      }
    });
};


window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const user = urlParams.get('user');

  if (status === 'registered') {
    alert('Welcome! You are registered successfully.');
  }

  if (status === 'loggedin' && user) {
    alert(`Welcome back, ${user}!`);
  }
};


fetch('http://localhost:3000/api/products')
      .then(response => response.json())
      .then(data => {
        const itemsContainer = document.getElementById('items-container');
        data.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'item';

          // Populate each item div with item data
          itemDiv.innerHTML = `
           <img src="${item.product_image}" alt="${item.product_name}" />  
            <h3>${item.product_name}</h3>
            <p class="item-description">
             ${item.short_description}...<a href="/details/product-details.html?id=${item.productID}" class="read-more">Read more</a>
            </p>

            <p>Price: ${item.price}</p>
            <p>Category: ${item.product_category}</p>
            <p>Location: ${item.location}</p>
            <p>Status: ${item.status}</p>
          `;
          itemsContainer.appendChild(itemDiv);
        });
      });

