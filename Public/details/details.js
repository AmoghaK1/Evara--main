document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const buttonContainer = document.getElementsByClassName("buttons")[0]; // Corrected line
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  buttonContainer.innerHTML = `
    <a href="#" id="buyLink"><button class="buy">Buy</button></a>
    <button class="contact" id="contact">Contact Seller</button>
  `;

  const buyLink = document.getElementById('buyLink');
  const buyBtn = document.getElementsByClassName("buy")[0];
  
  if (!userData) { // Check if user data is missing in localStorage (user is not logged in)
    buyBtn.addEventListener('click', (event) => {
      event.preventDefault(); // Prevents the button from redirecting
      alert("Please login to continue...!");
    });
  } else {
    // If user is logged in, allow redirection to the payment page
    buyLink.href = `/Buy/Payment.html?productId=${productId}`;
  }
  
  fetch(`http://localhost:3000/api/products/${productId}`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const item = data[0];

        const productImage = document.getElementById('product-image');
        productImage.innerHTML = `
          <img src="${item.product_image}" alt="Product image">
        `;

        const productDesc = document.getElementById('product-desc');
        productDesc.innerHTML = `
          <h2>${item.product_name}</h2>
          <p>${item.product_desc}</p>
          <p>Price: ${item.price}</p>
          <p>Location: ${item.location}</p>
          <p>Status: ${item.status}</p>
        `;

        

        const contactSellerButton = document.getElementById('contact-seller-button');
        contactSellerButton.addEventListener('click', () => {
          // Replace this alert with your actual "contact seller" logic
          alert(`Contacting the seller for product ID: ${productId}`);
        });
      } else {
        const productDesc = document.getElementById('product-desc');
        productDesc.innerHTML = '<p>Item not found</p>';
      }
    })
    .catch(err => console.error('Error fetching product details:', err));

  function saveProductId(productId) {
    localStorage.setItem('productId', productId);
  }

  function removeProductId() {
    localStorage.removeItem('productId');
  }
});
