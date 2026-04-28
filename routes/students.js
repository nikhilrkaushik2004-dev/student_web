const express = require("express");
const router = express.Router();
const db = require("../db");

// -------- VALIDATION --------
function validateStudent(body) {
  const {
    studentId,
    name,
    className,
    address,
    contactNo,
    percentage,
  } = body;

  const errors = {};

  if (!studentId || !studentId.trim())
    errors.studentId = "Student ID is required";

  if (!name || !name.trim())
    errors.name = "Name is required";
  else if (!/^[A-Za-z ]+$/.test(name))
    errors.name = "Name must contain only letters";

  if (!className || !className.trim())
    errors.className = "Class is required";

  if (!address || !address.trim())
    errors.address = "Address is required";

  if (!contactNo || !contactNo.trim())
    errors.contactNo = "Contact is required";
  else if (!/^[0-9]{10}$/.test(contactNo))
    errors.contactNo = "Contact must be 10 digits";

  if (percentage === undefined || percentage === "")
    errors.percentage = "Percentage is required";
  else if (isNaN(percentage) || percentage < 0 || percentage > 100)
    errors.percentage = "Percentage must be 0–100";

  return errors;
}

// -------- CREATE --------
router.post("/", async (req, res) => {
  try {
    const errors = validateStudent(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const {
      studentId,
      name,
      className,
      address,
      contactNo,
      percentage,
    } = req.body;

    const sql = `
      INSERT INTO students
      (student_id, name, class_name, address, contact_no, percentage)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      studentId,
      name,
      className,
      address,
      contactNo,
      percentage,
    ]);

    res.status(201).json({
      message: "Student created",
      id: result.insertId,
    });
  } catch (err) {
    // duplicate student_id (if unique)
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Student ID already exists",
      });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------- READ (with filters) --------
// GET /api/students?name=ravi&className=MCA
router.get("/", async (req, res) => {
  try {
    const { name, className } = req.query;

    let sql = "SELECT * FROM students WHERE 1=1";
    const params = [];

    if (name) {
      sql += " AND name LIKE ?";
      params.push(`%${name}%`);
    }

    if (className) {
      sql += " AND class_name LIKE ?";
      params.push(`%${className}%`);
    }

    sql += " ORDER BY id DESC";

    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------- OPTIONAL: GET BY ID --------
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM students WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------- OPTIONAL: UPDATE --------
router.put("/:id", async (req, res) => {
  try {
    const errors = validateStudent(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const {
      studentId,
      name,
      className,
      address,
      contactNo,
      percentage,
    } = req.body;

    const sql = `
      UPDATE students
      SET student_id=?, name=?, class_name=?, address=?, contact_no=?, percentage=?
      WHERE id=?
    `;

    const [result] = await db.execute(sql, [
      studentId,
      name,
      className,
      address,
      contactNo,
      percentage,
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Student ID already exists",
      });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------- OPTIONAL: DELETE --------
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM students WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;