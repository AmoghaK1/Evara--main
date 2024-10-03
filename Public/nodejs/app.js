const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer')
const { Buffer } = require('buffer');
const bcrypt = require('bcrypt');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // Set 'true' if using https
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

app.get('/Home/home-live.html', (req,res) => {
  
});


app.post('/SELL',upload.single('image'), (req,res) => {
  let prodName = req.body.productName;
  let prodCat = req.body.productCategory;
  let price = req.body.price;
  let location = req.body.location;
  let prodDetail = req.body.productDetail;
  const imageBlob = req.file.buffer;

  let sql = `INSERT INTO products (product_name, product_category, price, product_desc, product_image, location) VALUES (?,?,?,?,?,?)`;

  let query = db.query(sql, [prodName, prodCat, price, prodDetail, imageBlob, location], (err,result) => {
    if (err) throw err;
    console.log("Product added to Database..");
    
    res.redirect('/Home/home-live.html');
  });
  
});



app.post('/register', async (req, res) => {
  const { username, email, ph_no, password } = req.body;

  try {
    // Check if the user already exists
    db.query('SELECT username FROM users WHERE username = ?', [username], async (err, results) => {
      if (results.length > 0) {
        return res.send('User already exists');
      }
      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save the new user
      db.query('INSERT INTO users (username, email, ph_no, password) VALUES (?, ?, ?, ?)', [username, email, ph_no, hashedPassword], (err, result) => {
        if (err) {
          throw err;
        }
        console.log("A user has registered..")
        res.redirect('/Home/home-live.html?status=registered');
      });
    });
  } catch (err) {
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
          req.session.userId = user.userID;
          console.log("A user has Logged in..")
          res.redirect(`/Home/home-live.html?status=loggedin&user=${user.username}`);
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
  
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});