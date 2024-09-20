const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // Replace with your MySQL username
  password: 'Amogha123', // Replace with your MySQL password
  database: 'evaraitems'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// API to get all items
app.get('/api/items', (req, res) => {
  const query = 'SELECT id, title, LEFT(description, 20) AS short_description, price, location, status, image_url FROM items';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// API to get a specific item by ID
app.get('/api/items/:id', (req, res) => {
  console.log(`Fetching item with ID: ${req.params.id}`);  // Log the ID
  const query = 'SELECT * FROM items WHERE id = ?';
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


app.post('/SELL', (req,res) => {
  let userName = req.body.sellername;
  let number = req.body.sellernum;
  let prodName = req.body.productName;
  let prodCat = req.body.productCategory;
  let price = req.body.price;
  let location = req.body.location;
  let prodDetail = req.body.productDetail;
  let imgPath = req.body.img1;

  let sql = `INSERT INTO items (title, description, price, category, image_url, location) VALUES (?,?,?,?,?,?)`;

  let query = db.query(sql, [prodName, prodDetail, price,prodCat, imgPath, location], (err,result) => {
    if (err) throw err;
    console.log("Product added to Database..");
    
    res.redirect('/Home/home-live.html');
  });
  
});
  
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});