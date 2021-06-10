require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const app = express();
const Pool = require('pg').Pool;
const port = process.env.PORT || 3000;

// HIDES CERTAIN INFORMATIONS IN THE RESPONSE HEADERS
app.use(helmet());

// CORS
const whitelist = ['http://localhost:8081', 'http://127.0.0.1:8081'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}
app.use(cors(corsOptions));

// BODY PARSER
app.use(express.json());

// CONNECTION TO DB
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// PUBLIC IMG PATH
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', async (req, res) => {
  const id = 3;
  try {
    const posts = await pool.query(
      /*sql*/`
        SELECT
        u.user_username AS user,
        u.user_profile_motto,
        u.user_profile_image,
        COUNT(p.post_id) AS posts_count
        FROM posts AS p
        JOIN users AS u ON u.user_id = p.user_id
        GROUP BY u.user_id, u.user_username, u.user_profile_motto, u.user_profile_image
        HAVING u.user_id = ${id};
      `
    );
    res.status(200).json(posts.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'it seems you hit a wrong path...' });
});


app.listen(port, () => console.log(`server started on port ${port}`));