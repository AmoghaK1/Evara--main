document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
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
          <p>Status: ${item.status}</p>`
        
      } else {
        // Handle case when no data is returned
        productDesc.innerHTML = '<p>Item not found</p>';
      }
    })
    .catch(err => console.error('Error fetching product details:', err));
});
