const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const { Buffer } = require('buffer');
const bcrypt = require('bcrypt');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = socketIo(server);

app.use(session({
  secret: 'ABCXYZ123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set 'true' if using https
}));


// Connect to MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // Replace with your MySQL username
  password: 'Vedmysql@007', // Replace with your MySQL password
  database: 'evaradb'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
  } else {
    console.log('Connected to your server');
  }
});

// API to get all items
app.get('/api/products', (req, res) => {
  
  const query = 'SELECT productID, product_name, product_category, LEFT(product_desc, 20) AS short_description, price, location, status, product_image FROM products';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});
app.get('/api/search', (req, res) => {
  const search = req.query.search || "";      // Get search term for product
  const location = req.query.location || "";  // Get search term for location

  const query = `
    SELECT * FROM products 
    WHERE product_name LIKE ? AND location LIKE ?
  `;

  db.query(query, [`%${search}%`, `%${location}%`], (error, results) => {
    if (error) return res.status(500).send("Error retrieving results");

    res.json(results);  // Return matching products as JSON
  });
});

// API to get a specific item by ID
app.get('/api/products/:id', (req, res) => {
  console.log(`Fetching item with ID: ${req.params.id}`);  // Log the ID
  const query = 'SELECT * FROM products WHERE productID = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
    
  });
});


// Backend route
app.get('/api/bill-details/:id', (req, res) => {
  const productId = req.params.id;
  console.log("billing", productId);

  // First check if productId exists
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // Add error logging
  console.log(`Attempting to fetch details for product: ${productId}`);

  // Fetch the seller's name
  db.query('SELECT username FROM sellers WHERE productID = ?', [productId], (err, sellerResult) => {
    if (err) {
      console.error('Database error (sellers):', err);
      return res.status(500).json({ error: 'Error fetching seller data' });
    }

    if (!sellerResult || sellerResult.length === 0) {
      console.log('No seller found for productId:', productId);
      return res.status(404).json({ error: 'Seller not found' });
    }

    const sellerName = sellerResult[0].username;

    // Fetch the product name and price
    db.query('SELECT product_name, price FROM products WHERE productID = ?', [productId], (err, productResult) => {
      if (err) {
        console.error('Database error (products):', err);
        return res.status(500).json({ error: 'Error fetching product data' });
      }

      if (!productResult || productResult.length === 0) {
        console.log('No product found for productId:', productId);
        return res.status(404).json({ error: 'Product not found' });
      }

      const { product_name, price } = productResult[0];

      // Get buyer name from session or localStorage
      

      // Prepare the bill details response
      const billDetails = {
        from: sellerName,
        
        product: product_name,
        price: price,
        totalAmount: price
      };

      console.log('Sending bill details:', billDetails);
      res.json(billDetails);
    });
  });
});






app.get('/Home/home-live.html', (req,res) => {
  
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: 'evara_userImages',  // Specify folder in Cloudinary
      allowedFormats: ['jpeg', 'png', 'jpg'],
      public_id: (req,file) => path.parse(file.originalname).name
  }
});

// Initialize Multer
const upload = multer({ storage });



app.post('/finalPayment', upload.single('image'), (req, res) => {
  // Access query parameters from req.query
  const productId = req.query.productId;  // Access productId from query string
  const payMethod = req.query.method;     // Access method from query string
  const user = req.query.user;            // Access user from query string

  // The URL of the uploaded image on Cloudinary
  const imageURL = req.file.path;
  console.log(productId,payMethod,user);
  // Fetch sellerID based on productID
  db.query('SELECT sellerID FROM sellers WHERE productID = ?', [productId], (err, sellerResult) => {
    if (err) {
      console.error('Database error (sellers):', err);
      return res.status(500).json({ error: 'Error fetching seller data' });
    }
    if (!sellerResult || sellerResult.length === 0) {
      console.log('No seller found for productId:', productId);
      return res.status(404).json({ error: 'Seller not found' });
    }

    const sellerId = sellerResult[0].sellerID;

    // Fetch userID based on username
    db.query('SELECT userID FROM users WHERE username = ?', [user], (err, userResult) => {
      if (err) {
        console.error('Database error (userid):', err);
        return res.status(500).json({ error: 'Error fetching buyer data' });
      }
      if (!userResult || userResult.length === 0) {
        console.log('No user found for username:', user);
        return res.status(404).json({ error: 'User not found' });
      }

      const buyerId = userResult[0].userID;

      // Insert the transaction into the database
      db.query(
        'INSERT INTO transactions (sellerID, buyerID, productID, payment_method, payment_screenshot) VALUES (?, ?, ?, ?, ?)',
        [sellerId, buyerId, productId, payMethod, imageURL],
        (err, finalResult) => {
          if (err) {
            console.error('Transaction insertion failed:', err);
            return res.status(500).json({ error: 'Transaction insertion failed' });
          }

          console.log('Transaction successful:', finalResult);
          return res.redirect('/Buy/thankyou.html');
        }
      );
    });
  });
});






app.post('/SELL', upload.single('image'), (req, res) => {
  // Retrieve the product details from the form
  let prodName = req.body.productName;
  let prodCat = req.body.productCategory;
  let price = req.body.price;
  let location = req.body.location;
  let prodDetail = req.body.productDetail;

  // Get user info from request
  const userID = req.body.userID;  // Make sure this matches exactly with what you're sending
  const username = req.body.username;

  // Add some debugging
  console.log('User Data:', { userID, username });

  // Cloudinary image URL
  const imageUrl = req.file.path;

  // First, insert the product
  let productSQL = `INSERT INTO products (product_name, product_category, price, product_desc, product_image, location) VALUES (?,?,?,?,?,?)`;

  db.query(productSQL, [prodName, prodCat, price, prodDetail, imageUrl, location], (err, productResult) => {
    if (err) {
      console.error("Error inserting product:", err);
      return res.status(500).send("Error adding product");
    }

    // Get the ID of the newly inserted product
    const productID = productResult.insertId;

    // Debug the values before insertion
    console.log('Inserting into sellers:', { userID, username, productID });

    // Now insert into sellers table - make sure userID is converted to integer
    let sellerSQL = `INSERT INTO sellers (userID, username, productID) VALUES (?, ?, ?)`;
    
    db.query(sellerSQL, [
      parseInt(userID, 10) || null, // Convert to integer or null if invalid
      username,
      productID
    ], (err, sellerResult) => {
      if (err) {
        console.error("Error inserting seller:", err);
        console.error("SQL Query:", sellerSQL);
        console.error("Values:", [userID, username, productID]);
        return res.status(500).send("Error adding seller information");
      }

      console.log("Product and seller information added successfully");
      res.redirect(`/Home/home-live.html?status=loggedin&user=${username}&flag=1`);
    });
  });
});

// app.get('/api/suggest/location', (req, res) => {
//   const query = req.query.q.toLowerCase();
//   const locations = products
//       .map(p => p.location)
//       .filter(loc => loc.toLowerCase().includes(query));

//   const uniqueLocations = [...new Set(locations)];  // Remove duplicates
//   res.json(uniqueLocations.map(loc => ({ location: loc })));
// });

// // Suggest item endpoint
// app.get('/api/suggest/item', (req, res) => {
//   const query = req.query.q.toLowerCase();
//   const items = products
//       .filter(p => p.product_name.toLowerCase().includes(query))
//       .map(p => ({ name: p.product_name }));

//   res.json(items);
// });

// // Search items by location and name
// app.get('/api/search', (req, res) => {
//   const location = req.query.location.toLowerCase();
//   const name = req.query.name.toLowerCase();

//   const filteredProducts = products.filter(p => 
//       p.location.toLowerCase().includes(location) && 
//       p.product_name.toLowerCase().includes(name)
//   );

//   res.json(filteredProducts);
// });




app.post('/register', async (req, res) => {
  try {
    const { username, email, ph_no, password } = req.body;

    console.log('Password received from form:', password); // Check if password is available

    // Check if the user already exists
    db.query('SELECT username FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send('Database error');
      }
      if (results.length > 0) {
        return res.status(400).send('User already exists');
      }

      // Ensure password is available before hashing
      if (!password) {
        return res.status(400).send('Password is required');
      }

      // Hash the password with bcrypt (use salt rounds, e.g., 10)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Save the new user without the profile picture
      db.query(
        'INSERT INTO users (username, email, ph_no, password) VALUES (?, ?, ?, ?)',
        [username, email, ph_no, hashedPassword],
        (err) => {
          if (err) {
            console.error('Database insertion error:', err);
            return res.status(500).send('Failed to register user');
          }
          console.log('User registered successfully.');

          // Save session and redirect
          req.session.save((err) => {
            if (err) {
              console.error('Session saving error:', err);
              return res.status(500).send('Session error');
            }
            // popup.alert({
            //   content: 'Registered Sucessfully! Please login to Continue..'
            // })
            // myalert('Registered Sucessfully! Please login to Continue..')
            res.redirect('/Login/login.html?status=registered');
          });
        }
      );
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send('Server error');
  }
});




// Server-side (Express) - Update the login endpoint
app.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ? OR username = ? OR ph_no = ?',
    [identifier, identifier, identifier],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Server error' 
        });
      }

      if (results.length > 0) {
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
          req.session.userID = user.userID;
          
          // Send back user data (excluding sensitive information)
          res.status(200).json({ 
            success: true,
            user: {
              username: user.username,
              email: user.email,
              phoneNumber: user.ph_no,
              id: user.userID
            }
          });
        } else {
          res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
          });
        }
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
    }
  );
});

app.get('/profile', (req, res) => {
  const username = req.query.user;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // This query joins the necessary tables to get all orders for a user
  const query = `
    SELECT 
      t.transactionID,
      p.productID,
      p.product_name,
      p.product_category,
      LEFT(p.product_desc, 100) AS short_description,
      p.price,
      p.location,
      p.status,
      p.product_image,
      s.username AS seller_name,
      t.processed_at
    FROM transactions t
    JOIN users u ON t.buyerID = u.userID
    JOIN products p ON t.productID = p.productID
    JOIN sellers s ON t.sellerID = s.sellerID
    WHERE u.username = ?
    ORDER BY t.processed_at DESC
  `;

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Error fetching orders' });
    }

    if (!results || results.length === 0) {
      return res.status(200).json({ orders: [] });
    }

    return res.status(200).json({ orders: results });
  });
});
// app.get('/profile', (req,res) => {
//   const username = req.query.user;
//   console.log(username);
//   if(!username){
//     console.log("username not readable")
//   }

//   db.query('SELECT username from sellers where sellerID = (SELECT sellerID from transactions where buyerID = (SELECT userID from users where username = ?))', [username], (err,res) => {
//     if(err){
//       console.error('Database error(username): ',err);
//       return res.status(500).json({error: 'Error fetching data!!'});
//     }
//     if(!res || res.length===0){
//       console.log('No user found for this buyerid:', username);
//       return res.status(404).json({ error: 'user not found' });
//     }
//     const sellerName = res[0].username;

//     db.query('SELECT productID, product_name,product_category,LEFT(product_desc,20) AS short_description, price, location, status, product_image FROM products where productID = (SELECT productID from sellers where username = ?)',[sellerName], (err,prodResult) => {
//       if (err) {
//         return res.status(500).json({ error: 'Database query failed' });
//       }

//       const { productID,product_name,product_category,short_description,price,location,status,product_image } = prodResult[0];

//       const orderHistory = {
//         seller: sellerName,
        
//       }

//     })



//   })


// })







app.get('/send-notification', (req, res) => {
  const notification = {
      title: "New Notification",
      body: "You have a new notification",
      timestamp: new Date().toLocaleString()
  };

  io.emit('notification', notification);
  res.send("Notification sent!");
});

io.on('db', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
      console.log('user disconnected');
  });
});


//SEARCH//

// Define the search endpoint to handle both product and location search


// db.connect(err => {
//   if (err) throw err;
//   console.log("Connected to database");
// });

// // Define the search endpoint
// app.get('/api/search', (req, res) => {
//   const search = req.query.search;      // Get search term
//   const location = req.query.location;  // Get location term

//   const query = `
//     SELECT * FROM products 
//     WHERE product_name LIKE ? AND location LIKE ?
//   `;

//   db.query(query, [`%${search}%`, `%${location}%`], (error, results) => {
//     if (error) return res.status(500).send("Error retrieving results");

//     res.json(results);
//   });
// });



// app.get('/suggest-locations', (req, res) => {
//   const searchQuery = req.query.q; // Get the search query from the request
//   const sqlQuery = `SELECT DISTINCT location FROM products WHERE location LIKE ? LIMIT 10`;

//   // Execute the query with a wildcard to match partial entries
//   db.query(sqlQuery, [`%${searchQuery}%`], (error, results) => {
//       if (error) {
//           console.error(error);
//           return res.status(500).json({ error: 'Error fetching locations' });
//       }
//       // Extract location names from results and send back as JSON
//       const locations = results.map(result => result.location);
//       res.json(locations);
//   });
// });

// // This function will handle the form submission
// function handleSearch(event) {
//   event.preventDefault(); // Prevent default form submission

//   // Get the values of search-query and location inputs
//   const searchQuery = document.getElementById("search-query").value;
//   const locationQuery = document.getElementById("location-input").value;

//   // Create a URL-encoded query string to send to the backend
//   const queryString = `search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`;

//   // Send a fetch request to the backend API endpoint
//   fetch(`/api/search?${queryString}`)
//     .then(response => response.json())
//     .then(data => {
//       // Process and display results (this part depends on your UI)
//       console.log(data); // Log the results for now
//       // You could add code here to update the page with results
//     })
//     .catch(error => {
//       console.error("Error fetching search results:", error);
//     });
// }


// app.get('/suggest-locations', (req, res) => {
//   const searchTerm = req.query.q;  // 'q' is the query parameter, i.e., what the user types in

//   const query = `SELECT DISTINCT location FROM products WHERE location LIKE ? LIMIT 10`;
//   db.query(query, [`${searchTerm}%`], (error, results) => {
//       if (error) {
//           console.error('Error fetching suggestions:', error);
//           return res.status(500).send('Error fetching suggestions');
//       }

//       const locations = results.map(row => row.location);
//       res.json(locations);
//   });
// });

  
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.listen(4000, () => {
  console.log('notification sent on port 4000');
});