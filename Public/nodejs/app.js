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
  password: 'Amogha123', // Replace with your MySQL password
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

// server.js
app.get('/api/bill-details', (req, res) => {
  const productId = req.query.productId;

  // Fetch the seller's name
  db.query('SELECT username FROM sellers WHERE productID = ?', [productId], (err, sellerResult) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching seller data' });
    }

    const sellerName = sellerResult[0].username;

    // Fetch the product name and price
    db.query('SELECT name, price FROM products WHERE id = ?', [productId], (err, productResult) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching product data' });
      }

      const { name, price } = productResult[0];

      // Prepare the bill details response
      const billDetails = {
        from: sellerName,
        to: 'Buyer Name', // Assuming the buyer's name is stored elsewhere
        product: name,
        price: price,
        totalAmount: price
      };

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
      allowedFormats: ['jpeg', 'png', 'jpg']
  }
});

// Initialize Multer
const upload = multer({ storage });
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






app.use(express.json());
app.post('/search', (req, res) => {
  const { location, query } = req.body;

  // Example: search logic to retrieve items based on location and query
  if (location && query) {
    // Assuming you have a database query function
    searchItems(location, query).then((results) => {
      res.status(200).json(results);
    }).catch((err) => {
      res.status(500).json({ error: 'Error searching items' });
    });
  } else {
    res.status(400).json({ error: 'Location and search query are required' });
  }
});

// Function to search items from database
async function searchItems(location, query) {
  // Write your SQL or database query logic here
  // Example (assuming SQL):
  // const sql = `SELECT * FROM items WHERE location = ? AND product_name LIKE ?`;
  // const results = await db.query(sql, [location, `%${query}%`]);
  // return results;

  // Example mock data:
  return [
    { id: 1, name: 'Calculator', price: 10, location: 'Location 1' },
    { id: 2, name: 'Notebook', price: 5, location: 'Location 2' }
  ];
}


  
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.listen(4000, () => {
  console.log('notification sent on port 4000');
});