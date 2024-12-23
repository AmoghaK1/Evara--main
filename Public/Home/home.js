// On window load, check if the user is logged in via the session

function updateUserSection() {
  const loginStatus = localStorage.getItem('loginStatus') || 'open';
  const user = localStorage.getItem('user');
  const flag = localStorage.getItem('flag') || '0';
  const userSection = document.getElementById('user-section');

  if (loginStatus === 'loggedin' && user) {
    userSection.innerHTML = `
    <img src="/ImagesHome/pfp_final_1.png" 
               alt="Profile Picture" 
               id="pfp" onclick="window.location.href='/Profile/profile.html?loginStatus=loggedin&user=${user}';"
               style="width: 40px; 
                      height: 40px; 
                      margin-right: 1rem; 
                      margin-left: 1.75rem; 
                      border-radius: 50%; 
                      cursor: pointer;" />    
    <div class="user-toggle-container">
            <button class="toggle-btn" id="toggle-menu-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div class="dropdown-menu" id="dropdown-menu">
                <a href="/Sell/sell.html" class="dropdown-item">Sell</a>
                <a href="#" class="dropdown-item" id="logout-btn">Logout</a>
            </div>
        </div>
    `;

    // Show custom alert
    if(flag === '0') {
        showAlert(`Welcome back, ${user}!`);
    } else if(flag === '1') {
        showAlert('Product Uploaded Successfully!');
        localStorage.setItem('flag', '0');
    }

    // Toggle Menu Button
    const toggleBtn = document.getElementById('toggle-menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    toggleBtn.addEventListener('click', function() {
        toggleBtn.classList.toggle('active');
        dropdownMenu.classList.toggle('show');
    });

    // Logout Handler
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
        window.location.href = 'home-live.html';
    });

    // Close dropdown if clicked outside
    document.addEventListener('click', function(event) {
        if (!userSection.contains(event.target)) {
            toggleBtn.classList.remove('active');
            dropdownMenu.classList.remove('show');
        }
    });
    
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

// Call the function when the window loads
window.onload = updateUserSection;

// Placeholder functions (you'll need to implement these)
function showAlert(message) {
// Implement your custom alert functionality
alert(message);
}

function handleLogout() {
// Implement your logout logic here
localStorage.removeItem('loginStatus');
localStorage.removeItem('user');
}
// Initialize the page
async function initializePage() {
  // Check URL parameters for initial load
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

  // Update the user section
  updateUserSection();

  // Load products if the function exists
  if (typeof loadProducts === 'function') {
      await loadProducts();
  }
}

// Function to handle login
function handleLogin(username) {
  localStorage.setItem('loginStatus', 'loggedin');
  localStorage.setItem('user', username);
  localStorage.setItem('flag', '0');
  updateUserSection();
}

// Helper function for showing alerts (if you don't have one already)
function showAlert(message) {
  // You can customize this based on your alert implementation
  alert(message);
  // Or if you have a custom alert function, use that instead
  // customAlert(message);
}

// Call initializePage when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

function showAlert(message) {
  document.getElementById('alert-message').innerText = message;
  document.getElementById('custom-alert').style.display = 'block';
}

function closeAlert() {
  document.getElementById('custom-alert').style.display = 'none';
}

// Function to create product box HTML (reusable for both initial load and search)
function createProductBox(item) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'item';
  
  itemDiv.innerHTML = `
    <img src="${item.product_image}" alt="Product Image"> 
    <h3>${item.product_name}</h3>
    <p class="item-description">
      ${item.short_description}...<a href="/details/product-details.html?id=${item.productID}" class="read-more">Read more</a>
    </p>
    <p>Price: ${item.price}</p>
    <p>Category: ${item.product_category}</p>
    <p>Location: ${item.location}</p>
    <p>Status: ${item.status}</p>
  `;
  
  return itemDiv;
}

// Function to display products in the container
function displayProducts(products) {
  const itemsContainer = document.getElementById('items-container');
  itemsContainer.innerHTML = ''; // Clear existing content
  
  if (products.length === 0) {
    itemsContainer.innerHTML = '<p>No matching products found.</p>';
    return;
  }
  
  products.forEach(item => {
    const itemDiv = createProductBox(item);
    itemsContainer.appendChild(itemDiv);
  });
}

// Initial load of all products
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    displayProducts(data);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Handle search
document.getElementById('search-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const searchQuery = document.getElementById("search-query").value;
  const locationQuery = document.getElementById("location-input").value;
  const queryString = `search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`;
  
  try {
    const response = await fetch(`/api/search?${queryString}`);
    const data = await response.json();
    displayProducts(data);
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
});

function populateSearch(item) {
  document.getElementById('search-query').value = item;
  document.getElementById('search-form').dispatchEvent(new Event('submit'));
}
// On window load, check if the user is logged in via the session
//  window.onload = function() {
//   // Fetch the session data to check if the user is logged in
//   fetch('http://localhost:3000/session')
//     .then(response => response.json())
//     .then(data => {
//       const userSection = document.getElementsByClassName('bellandlogin');
//       console.log(data.loggedIn);
//       if (data.loggedIn) {
//         // User is logged in, replace login button with profile picture
//         userSection.innerHTML = `
//           <img src="${data.profilePicture}" alt="Profile Picture" id="pfp" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer;" />
//         `;
        
//         // Add event listener to redirect to profile page on profile picture click
//         document.getElementById('pfp').addEventListener('click', function() {
//           window.location.href = '/profile';
//         });
//       } else {
//         // User is not logged in, keep the login button
//         userSection.innerHTML = `
//           <a class="btn btn-light" href="/Login/login.html" role="button" style="font-size: 0.70rem; height: 2rem; transform: rotate(-0.61deg); transform-origin: 0 0; background: white; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 40px; backdrop-filter: blur(4px)">Login In</a>
//         `;
//       }
//     });

// }; 
// function showAlert(message) {
//   const alertBox = document.getElementById('custom-alert');
//   document.getElementById('alert-message').innerText = message;
//   alertBox.style.display = 'block';
//   alertBox.classList.remove('fade-out');
//   alertBox.classList.add('fade-in');
// }

// function closeAlert() {
//   const alertBox = document.getElementById('custom-alert');
//   alertBox.classList.remove('fade-in');
//   alertBox.classList.add('fade-out');

//   // Hide the popup after the fade-out animation completes
//   setTimeout(() => {
//     alertBox.style.display = 'none';
//   }, 500); // Match this duration to the fade-out animation duration
// }



// window.onload = async function() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const status = urlParams.get('status');
//   const user = urlParams.get('user');
//   const flag = urlParams.get('flag');

//   if (status === 'loggedin' && user) {
//     const userSection = document.getElementById('user-section');
//     userSection.innerHTML = `
//           <img src="/ImagesHome/pfp_final_1.png" alt="Profile Picture" id="pfp" style="width: 40px; height: 40px; margin-right: 1rem; margin-left: 1.75rem; border-radius: 50%; cursor: pointer;" />
//           <a class="btn btn-light" href="/Sell/sell.html" role="button" style="font-size: 0.86rem; width:6rem; height: 2.2rem; transform: rotate(-0.61deg); transform-origin: 0 0; background: white; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 40px; backdrop-filter: blur(4px)">Sell</a>
//     `;

//     // Show custom alert
//     if(flag === '0'){
//       showAlert(`Welcome back, ${user}!`);
//     } else if(flag === '1'){
//       showAlert('Product Uploaded Successfully!');
//     }

//     // Add event listener to redirect to profile page on profile picture click
//     document.getElementById('pfp').addEventListener('click', function() {
//       window.location.href = '/profile';
//     });
//   }

//   if (status === 'open') {
//     const userSection = document.getElementById('user-section');
//     userSection.innerHTML = `
//           <a class="btn btn-light" href="/Login/login.html" role="button" style="font-size: 0.70rem; height: 2rem; width: 4.7rem; transform: rotate(-0.61deg); transform-origin: 0 0; background: white; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 40px; backdrop-filter: blur(4px)">Login In</a>
//     `;
//   }
// };

// function showAlert(message) {
//   document.getElementById('alert-message').innerText = message;
//   document.getElementById('custom-alert').style.display = 'block';
// }

// function closeAlert() {
//   document.getElementById('custom-alert').style.display = 'none';
// }

// // Function to create product box HTML (reusable for both initial load and search)
// function createProductBox(item) {
//   const itemDiv = document.createElement('div');
//   itemDiv.className = 'item';
  
//   itemDiv.innerHTML = `
//     <img src="${item.product_image}" alt="Product Image"> 
//     <h3>${item.product_name}</h3>
//     <p class="item-description">
//       ${item.short_description}...<a href="/details/product-details.html?id=${item.productID}" class="read-more">Read more</a>
//     </p>
//     <p>Price: ${item.price}</p>
//     <p>Category: ${item.product_category}</p>
//     <p>Location: ${item.location}</p>
//     <p>Status: ${item.status}</p>
//   `;
  
//   return itemDiv;
// }

// // Function to display products in the container
// function displayProducts(products) {
//   const itemsContainer = document.getElementById('items-container');
//   itemsContainer.innerHTML = ''; // Clear existing content
  
//   if (products.length === 0) {
//     itemsContainer.innerHTML = '<p>No matching products found.</p>';
//     return;
//   }
  
//   products.forEach(item => {
//     const itemDiv = createProductBox(item);
//     itemsContainer.appendChild(itemDiv);
//   });
// }

// // Initial load of all products
// async function loadProducts() {
//   try {
//     const response = await fetch('/api/products');
//     const data = await response.json();
//     displayProducts(data);
//   } catch (error) {
//     console.error('Error loading products:', error);
//   }
// }

// // Handle search
// document.getElementById('search-form').addEventListener('submit', async function(event) {
//   event.preventDefault();
  
//   const searchQuery = document.getElementById("search-query").value;
//   const locationQuery = document.getElementById("location-input").value;
//   const queryString = `search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`;
  
//   try {
//     const response = await fetch(`/api/search?${queryString}`);
//     const data = await response.json();
//     displayProducts(data);
//   } catch (error) {
//     console.error("Error fetching search results:", error);
//   }
// });

// function populateSearch(item) {
//   document.getElementById('search-query').value = item;
//   document.getElementById('search-form').dispatchEvent(new Event('submit'));
// }

// fetch('http://localhost:3000/api/products')
//       .then(response => response.json())
//       .then(data => {
//         const itemsContainer = document.getElementById('items-container');
//         data.forEach(item => {
//           const itemDiv = document.createElement('div');
//           itemDiv.className = 'item';

//           // Populate each item div with item data
//           itemDiv.innerHTML = `
//             <img src="${item.product_image}" alt="Product Image"> 
//             <h3>${item.product_name}</h3>
//             <p class="item-description">
//              ${item.short_description}...<a href="/details/product-details.html?id=${item.productID}" class="read-more">Read more</a>
//             </p>

//             <p>Price: ${item.price}</p>
//             <p>Category: ${item.product_category}</p>
//             <p>Location: ${item.location}</p>
//             <p>Status: ${item.status}</p>
//           `;
//           itemsContainer.appendChild(itemDiv);
//         });
//       });

//       function handleSearch(event) {
//         event.preventDefault(); // Prevent the form from submitting the traditional way
  
//         const searchQuery = document.getElementById("search-query").value; // Product search term
//         const locationQuery = document.getElementById("location-input").value; // Location search term
//         const queryString = `search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`;
  
//         // Fetch results from the backend
//         fetch(`/api/search?${queryString}`)
//           .then(response => response.json())
//           .then(data => displayResults(data))
//           .catch(error => console.error("Error fetching search results:", error));
//       }
  
//       // Display search results in the DOM
//       function displayResults(results) {
//         const resultsContainer = document.getElementById("results-container");
//         resultsContainer.innerHTML = ""; // Clear previous results
  
//         if (results.length === 0) {
//           resultsContainer.innerHTML = "<p>No matching products found.</p>";
//         } else {
//           results.forEach(item => {
//             const itemDiv = document.createElement("div");
//             itemDiv.innerHTML = `<p>Product: ${item.product_name}, Location: ${item.location}, Price: ${item.price}</p>`;
//             resultsContainer.appendChild(itemDiv);
//           });
//         }
//       }







      const socket = io();
      const notificationBell = document.getElementById('notificationBell');
      const notificationCount = document.getElementById('notificationCount');
      const notificationList = document.getElementById('notificationList');
      const notifications = document.getElementById('notifications');

      let unreadCount = 0;

      // Toggle notification list when bell is clicked
      notificationBell.addEventListener('click', function() {
          notificationList.classList.toggle('show');
          unreadCount = 0;
          notificationCount.innerText = unreadCount;
      });

      // Listen for initial notifications when user connects
      socket.on('initial-notifications', function(data) {
          data.forEach(notification => {
              addNotificationToList(notification);
          });
      });

      // Listen for real-time notifications
      socket.on('notification', function(notification) {
          addNotificationToList(notification);
          unreadCount++;
          notificationCount.innerText = unreadCount;
      });

      // Helper function to add notifications to the list
      function addNotificationToList(notification) {
          const newNotification = document.createElement('li');
          newNotification.innerText = `${notification.title}: ${notification.body} (${notification.timestamp})`;
          notifications.appendChild(newNotification);
      }


   
      // JavaScript function to handle search request
     
    

// Add an event listener to capture input in the search box
// document.getElementById('searchBox').addEventListener('input', function() {
//     const query = this.value.trim(); // Trim any unnecessary whitespace
//     const suggestionsDiv = document.getElementById('suggestions'); // Suggestion display area

//     if (query.length > 2) { // Start showing suggestions after 3 characters
//         fetch(`/suggest-locations?q=${encodeURIComponent(query)}`)
//             .then(response => response.json())
//             .then(data => {
//                 // Clear previous suggestions
//                 suggestionsDiv.innerHTML = '';

//                 // Populate the suggestions div with the received data
//                 data.forEach(location => {
//                     const suggestionItem = document.createElement('div');
//                     suggestionItem.textContent = location;
//                     suggestionItem.className = 'suggestion-item'; // Optional: Add class for styling

//                     // Add click event to populate search box with chosen suggestion
//                     suggestionItem.addEventListener('click', () => {
//                         document.getElementById('searchBox').value = location;
//                         suggestionsDiv.innerHTML = ''; // Clear suggestions once selected
//                     });

//                     // Append each suggestion to the suggestions div
//                     suggestionsDiv.appendChild(suggestionItem);
//                 });
//             })
//             .catch(error => console.error('Error fetching location suggestions:', error));
//     } else {
//         // Clear suggestions if query is too short
//         suggestionsDiv.innerHTML = '';
//     }
// });

   
      








//location search option

    //   document.getElementById('locationInput').addEventListener('input', function () {
    //     const query = this.value;
    //     if (query.length > 2) {
    //         fetch(`/api/suggest/location?q=${query}`)
    //             .then(response => response.json())
    //             .then(data => {
    //                 const suggestions = document.getElementById('locationSuggestions');
    //                 suggestions.innerHTML = '';  // Clear previous suggestions
    //                 data.forEach(suggestion => {
    //                     const li = document.createElement('li');
    //                     li.textContent = suggestion.location;
    //                     li.addEventListener('click', function () {
    //                         document.getElementById('locationInput').value = suggestion.location;
    //                         suggestions.innerHTML = '';  // Clear suggestions after selection
    //                     });
    //                     suggestions.appendChild(li);
    //                 });
    //             });
    //     }
    // });
    
    // document.getElementById('itemInput').addEventListener('input', function () {
    //     const query = this.value;
    //     if (query.length > 2) {
    //         fetch(`/api/suggest/item?q=${query}`)
    //             .then(response => response.json())
    //             .then(data => {
    //                 const suggestions = document.getElementById('itemSuggestions');
    //                 suggestions.innerHTML = '';  // Clear previous suggestions
    //                 data.forEach(suggestion => {
    //                     const li = document.createElement('li');
    //                     li.textContent = suggestion.name;
    //                     li.addEventListener('click', function () {
    //                         document.getElementById('itemInput').value = suggestion.name;
    //                         suggestions.innerHTML = '';  // Clear suggestions after selection
    //                     });
    //                     suggestions.appendChild(li);
    //                 });
    //             });
    //     }
    // });
    
    // function searchItems() {
    //     const location = document.getElementById('locationInput').value;
    //     const name = document.getElementById('itemInput').value;
        
    //     fetch(`/api/search?location=${location}&name=${name}`)
    //         .then(response => response.json())
    //         .then(data => {
    //             const resultsDiv = document.getElementById('results');
    //             resultsDiv.innerHTML = '';  // Clear previous results
    //             data.forEach(item => {
    //                 const div = document.createElement('div');
    //                 div.innerHTML = `
    //                     <h3>${item.name}</h3>
    //                     <p>Location: ${item.location}</p>
    //                     <p>Price: $${item.price}</p>
    //                 `;
    //                 resultsDiv.appendChild(div);
    //             });
    //         });
    // }