const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Saichand@123",
    database: process.env.DB_NAME || "attendance_db"
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/students", (req, res) => {
    const { name, attendance } = req.body;

    // Auto calculate percentage
    let percentage = 0;

    if (attendance === "Present") {
        percentage = 100;
    } else {
        percentage = 0;
    }

    db.query(
        "INSERT INTO students (name, attendance, attendance_percentage) VALUES (?, ?, ?)",
        [name, attendance, percentage],
        (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to add student", details: err.message });
            }
            return res.status(201).json({ message: "Student added with auto percentage" });
        }
    );
});

app.get("/students", (req, res) => {
    db.query("SELECT * FROM students", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(result);
    });
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("MySQL Connected");
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
app.delete("/students/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM students WHERE id = ?", [id], (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to delete student", details: err.message });
        }
        return res.json({ message: "Student deleted" });
    });
});
app.put("/students/:id", (req, res) => {
    const id = req.params.id;
    const { name, attendance, attendance_percentage } = req.body;

    db.query(
        "UPDATE students SET name=?, attendance=?, attendance_percentage=? WHERE id=?",
        [name, attendance, attendance_percentage, id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to update student", details: err.message });
            }
            return res.json({ message: "Student updated" });
        }
    );
});