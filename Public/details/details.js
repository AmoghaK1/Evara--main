document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  fetch(`http://localhost:3000/api/items/${productId}`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const item = data[0];  
        const productDetails = document.getElementById('product-details');
        productDetails.innerHTML = `
          <h2>${item.title}</h2>
          <img src="${item.image_url}" class="prod-img">
          <p>${item.description}</p>
          <p>Price: ${item.price}</p>
          <p>Location: ${item.location}</p>
          <p>Status: ${item.status}</p>
        `;
      } else {
        // Handle case when no data is returned
        productDetails.innerHTML = '<p>Item not found</p>';
      }
    })
    .catch(err => console.error('Error fetching product details:', err));
});
