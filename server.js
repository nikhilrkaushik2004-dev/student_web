const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "studentdb"
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("DB Connected");
});

// INSERT student
app.post("/add-student", (req, res) => {
  const { name, email, course } = req.body;

  const sql = "INSERT INTO students (name, email, course) VALUES (?, ?, ?)";

  db.query(sql, [name, email, course], (err) => {
    if (err) return res.send("Error");
    res.send("Student Added");
  });
});

// GET all students
app.get("/students", (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.send("Error");
    res.json(result);
  });
});

app.listen(5000, () => console.log("Server running on 5000"));
