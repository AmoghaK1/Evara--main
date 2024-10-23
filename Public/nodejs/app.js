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
  password: 'kavya22311220@', // Replace with your MySQL password
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
  if (req.session.userID) {
    console.log(`User ID from session: ${req.session.userID}`);
    console.log(`Logged in as user: ${req.session.userID}`);
  } else {
    console.log('No user has logged in');
  }
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

  // Cloudinary will automatically store the image and return the URL in req.file.path
  const imageUrl = req.file.path; // This is the URL of the uploaded image

  // Insert the product details along with the image URL into the database
  let sql = `INSERT INTO products (product_name, product_category, price, product_desc, product_image, location) VALUES (?,?,?,?,?,?)`;

  db.query(sql, [prodName, prodCat, price, prodDetail, imageUrl, location], (err, result) => {
    if (err) throw err;
    console.log("Product added to Database with Cloudinary image URL.");
    
    // Redirect to the homepage or confirmation page after the product is added
    res.redirect('/Home/home-live.html');
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



// app.post('/register',upload.single('imagepfp'), async (req, res) => {
//   const { username, email, ph_no, password} = req.body;
//   const imagepfp = req.file.path;
//   try {
//     // Check if the user already exists
//     db.query('SELECT username FROM users WHERE username = ?', [username], async (err, results) => {
//       if (results.length > 0) {
//         return res.send('User already exists');
//       }
//       // Hash the password before saving it
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Save the new user
//       db.query('INSERT INTO users (username, email, ph_no, password, profile_picture) VALUES (?, ?, ?, ?,?)', [username, email, ph_no, hashedPassword,imagepfp], (err, result) => {
//         if (err) {
//           throw err;
//         }
//         console.log("A user has registered..")
//         req.session.save(err => {
//           if (err) {
//             console.error('Error saving session:', err);
//           }
//           res.redirect(`/Home/home-live.html?status=registered`);
//         });
//       });
//     });
//   } catch (err) {
//     res.status(500).send('Server error');
//   }
// });
app.post('/register', upload.single('imagepfp'), async (req, res) => {
  try {
    console.log(req.file);  // Log the file to verify it's received
    const { username, email, ph_no, password } = req.body;

    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const imagepfp = req.file.path;  // Cloudinary should return the file URL here
    console.log(imagepfp);

    // Check if the user already exists
    db.query('SELECT username FROM users WHERE username = ?', [username], async (err, results) => {
      if (results.length > 0) {
        return res.send('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Save the new user with the profile picture URL from Cloudinary
      db.query('INSERT INTO users (username, email, ph_no, password, profile_picture) VALUES (?, ?, ?, ?, ?)', [username, email, ph_no, hashedPassword, imagepfp], (err, result) => {
        if (err) throw err;
        console.log('User registered with profile picture.');

        req.session.save(err => {
          if (err) {
            console.error('Error saving session:', err);
          }
          res.redirect('/Home/home-live.html?status=registered');
        });
      });
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send('Server error');
  }
});



app.post('/login', (req, res) => {
  const { identifier, password } = req.body;  // 'identifier' can be email, username, or phone number

  // Search for user by email, username, or phone number
  db.query(
    'SELECT * FROM users WHERE email = ? OR username = ? OR ph_no = ?',
    [identifier, identifier, identifier],
    async (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const user = results[0];

        // Compare password
        const match = await bcrypt.compare(password, user.password);

        if (match) {
          // Store userId in session
          
          req.session.userID = user.userID;
          console.log(`User ${user.userID} has Logged in..`)
          req.session.save(err => {
            if (err) {
              console.error('Error saving session:', err);
            }
            res.redirect(`/Home/home-live.html?status=loggedin&user=${user.username}`);
          });
        } else {
          res.send('Invalid email/username/phone number or password');
        }
      } else {
        res.send('No user found with that identifier');
      }
    }
  );
});


app.get('/session', (req, res) => {
  console.log(req.session.userID);
  if (req.session.userID) {
    // Fetch user data to get the profile picture (assuming you store profile picture URL in the database)
    db.query('SELECT profile_picture FROM users WHERE userID = ?', [req.session.userID], (err, results) => {
      if (err) throw err;
      
      if (results.length > 0) {
        res.json({
          loggedIn: true,
          profilePicture: results[0].profile_picture || '/default-pfp.png' // Provide default profile picture if none exists
          
        });
        
      }
    });
  } else {
    res.json({ loggedIn: false });
    console.log("No one logged in...")
  }
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

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
      console.log('user disconnected');
  });
});



server.listen(4000, () => {
  console.log('listening on *:4000');
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