 // On window load, check if the user is logged in via the session
 document.addEventListener("DOMContentLoaded", function() {
  fetch('/session')
    .then(response => response.json())
    .then(data => {
      const userSection = document.getElementById('user-section');

      if (data.loggedIn) {
        // Clear existing children
        while (userSection.firstChild) {
          userSection.removeChild(userSection.firstChild);
        }

        // Create image element for profile picture
        const img = document.createElement('img');
        img.src = data.profilePicture; // Profile picture URL
        img.alt = 'Profile Picture';
        img.id = 'pfp';
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.borderRadius = '50%';
        img.style.cursor = 'pointer';

        // Append image to user section
        userSection.appendChild(img);

        // Add event listener for profile picture click
        img.addEventListener('click', function() {
          window.location.href = '/profile';
        });
      }
    })
    .catch(err => {
      console.error('Error fetching session data:', err);
    });
});

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

