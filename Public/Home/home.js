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


window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const user = urlParams.get('user');
  if (status === 'registered') {
    const userSection = document.getElementById('user-section');
    userSection.innerHTML = `
          <img src="/ImagesHome/pfp-test.jpg" alt="Profile Picture" id="pfp" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer;" />
          <a class="btn btn-light" href="/Sell/sell.html" role="button" style="font-size: 0.7rem; height: 2rem; transform: rotate(-0.61deg); transform-origin: 0 0; background: white; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 40px; backdrop-filter: blur(4px)">Sell</a>
        `;
    alert('Welcome! You are registered successfully.');

  }

  if (status === 'loggedin' && user) {
    const userSection = document.getElementById('user-section');
    userSection.innerHTML = `
          <img src="/ImagesHome/pfp-test.jpg" alt="Profile Picture" id="pfp" style="width: 40px; height: 40px; margin-right: 1rem; margin-left: 1.75rem ; border-radius: 50%; cursor: pointer;" />
          <a class="btn btn-light" href="/Sell/sell.html" role="button" style="font-size: 0.86rem; width:6rem; height: 2.2rem; transform: rotate(-0.61deg); transform-origin: 0 0; background: white; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 40px; backdrop-filter: blur(4px)">Sell</a>
        `;
        
    alert(`Welcome back, ${user}!`);
    
        
        // Add event listener to redirect to profile page on profile picture click
        document.getElementById('pfp').addEventListener('click', function() {
          window.location.href = '/profile';
        });
  }
  if(status ==='open'){
    const userSection = document.getElementById('user-section');
    userSection.innerHTML = `
          <a class="btn btn-light" href="/Login/login.html" role="button" style="font-size: 0.70rem; height: 2rem; width: 4.7rem; transform: rotate(-0.61deg); transform-origin: 0 0; background: white; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 40px; backdrop-filter: blur(4px)">Login In</a>
        `;
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
          itemsContainer.appendChild(itemDiv);
        });
      });

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