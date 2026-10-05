const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "library_db"
});

// MySQL connection шалгах
pool.getConnection()
  .then(connection => {
    console.log("MySQL-тэй амжилттай холбогдлоо");
    connection.release();
  })
  .catch(err => {
    console.error("MySQL connection error:", err.message);
  });

// GET - бүх номыг авах
app.get("/books", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        books.id,
        books.title,
        authors.name AS author
      FROM books
      JOIN authors ON books.author_id = authors.id
      ORDER BY books.id
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Номын жагсаалт авахад алдаа гарлаа"
    });
  }
});

// POST - шинэ ном нэмэх
app.post("/books", async (req, res) => {
  try {
    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: "Номын нэр болон зохиогч шаардлагатай"
      });
    }

    // Зохиогч байгаа эсэхийг шалгах
    const [authors] = await pool.query(
      "SELECT id FROM authors WHERE name = ?",
      [author]
    );

    let authorId;

    if (authors.length > 0) {
      authorId = authors[0].id;
    } else {
      const [result] = await pool.query(
        "INSERT INTO authors (name) VALUES (?)",
        [author]
      );

      authorId = result.insertId;
    }

    // Ном нэмэх
    const [result] = await pool.query(
      "INSERT INTO books (title, author_id) VALUES (?, ?)",
      [title, authorId]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      title,
      author
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Ном нэмэхэд алдаа гарлаа"
    });
  }
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});