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
             ${item.short_description}...<a href="/details/product-details.html?id=${item.id}" class="read-more">Read more</a>
            </p>

            <p>Price: ${item.price}</p>
            <p>Category: ${item.product_category}</p>
            <p>Location: ${item.location}</p>
            <p>Status: ${item.status}</p>
          `;
          itemsContainer.appendChild(itemDiv);
        });
      });