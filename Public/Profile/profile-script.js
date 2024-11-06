document.addEventListener('DOMContentLoaded', () => {
    const username = populateUserData();
    if (username) {
      populateOrders(username);
    } else {
      const ordersSection = document.getElementById('orders-section');
      if (ordersSection) {
        ordersSection.innerHTML = '<div class="error">Please log in to view your orders</div>';
      }
    }
  });



// Function to populate user data from localStorage
function populateUserData() {
    try {
      // Get user data from localStorage
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        console.error('No user data found in localStorage');
        return;
      }
  
      const userData = JSON.parse(userDataString);
  
      // Update user name
      const userNameElements = document.getElementsByClassName('user-name');
      for (let element of userNameElements) {
        element.textContent = userData.username || 'User Name';
      }
  
      // Update email
      const emailElement = document.querySelector('.user-mail');
      if (emailElement) {
        emailElement.innerHTML = `<i class="fa fa-envelope"></i> ${userData.email || 'No email available'}`;
      }
  
      // Update phone number
      const phoneElement = document.querySelector('.mobile-no');
      if (phoneElement) {
        phoneElement.innerHTML = `<i class="fa fa-phone"></i> ${userData.phoneNumber || 'No phone available'}`;
      }
  
      // Update bio if it exists in userData
      const bioElement = document.querySelector('.bio');
      if (bioElement && userData.bio) {
        bioElement.textContent = userData.bio;
      }
  
      return userData.username; // Return username for use in fetchOrders
    } catch (error) {
      console.error('Error populating user data:', error);
      return null;
    }
  }

async function fetchOrders() {
    try {
      // Get username from URL query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const username = urlParams.get('user');
      
      if (!username) {
        throw new Error('Username not provided');
      }
  
      const response = await fetch(`/profile?user=${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
  
      const data = await response.json();
      return data.orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }
  
  // Function to create a card element for an order
  function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Convert image path to proper URL
    
    card.innerHTML = `
      <img src="${order.product_image}" alt="${order.product_image}" class="card-img">
      <div class="card-content">
        <h3 class="card-title">${order.product_name}</h3>
        <p class="card-description">${order.short_description}</p>
        <div class="card-details">
          <p class="price">Price: $${order.price}</p>
          <p class="seller">Seller: ${order.seller_name}</p>
          <p class="category">Category: ${order.product_category}</p>
          <p class="location">Location: ${order.location}</p>
          <p class="status">Status: ${order.status}</p>
          <p class="date">Ordered: ${new Date(order.transaction_date).toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    return card;
  }
  
  // Function to populate the orders section
  async function populateOrders() {
    const ordersSection = document.getElementById('orders-section');
    if (!ordersSection) {
      console.error('Orders section not found');
      return;
    }
  
    // Clear existing content
    ordersSection.innerHTML = '';
  
    // Show loading state
    ordersSection.innerHTML = '<div class="loading">Loading orders...</div>';
  
    try {
      const orders = await fetchOrders();
  
      // Clear loading state
      ordersSection.innerHTML = '';
  
      if (orders.length === 0) {
        ordersSection.innerHTML = '<div class="no-orders">No orders found</div>';
        return;
      }
  
      // Create and append order cards
      orders.forEach(order => {
        const card = createOrderCard(order);
        ordersSection.appendChild(card);
      });
  
    } catch (error) {
      console.error('Error populating orders:', error);
      ordersSection.innerHTML = '<div class="error">Error loading orders</div>';
    }
  }
  const styles = document.createElement('style');
styles.textContent = `
  .card-details {
    margin-top: 10px;
    font-size: 0.9em;
  }
  .card-details p {
    margin: 5px 0;
  }
  .loading, .no-orders, .error {
    text-align: center;
    padding: 20px;
    font-size: 1.1em;
  }
  .error {
    color: #dc3545;
  }
  .price {
    font-weight: bold;
    color: #2c5282;
  }
  .status {
    text-transform: capitalize;
  }
`;
document.head.appendChild(styles);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  populateOrders();
});

// JavaScript to toggle between orders and prev orders
document.getElementById("orders-tab").addEventListener("click", function (e) {
    e.preventDefault();

    // Show the Orders section and hide the Prev Orders section
    document.getElementById("orders-section").style.display = "flex";
    document.getElementById("prevorders-section").style.display = "none";

    // Update the active class for tabs
    this.classList.add("active");
    document.getElementById("prevorders-tab").classList.remove("active");
});

document.getElementById("prevorders-tab").addEventListener("click", function (e) {
    e.preventDefault();

    // Show the Prev Orders section and hide the Orders section
    document.getElementById("prevorders-section").style.display = "flex";
    document.getElementById("orders-section").style.display = "none";

    // Update the active class for tabs
    this.classList.add("active");
    document.getElementById("orders-tab").classList.remove("active");
});

// Additional code to toggle between Orders and Settings
document.getElementById("settings-tab").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("orders-section").style.display = "none";
    document.getElementById("prevorders-section").style.display = "none";
    document.getElementById("settings-section").style.display = "flex";

    // Update the active class for tabs
    this.classList.add("active");
    document.getElementById("orders-tab").classList.remove("active");
    document.getElementById("prevorders-tab").classList.remove("active");
});
