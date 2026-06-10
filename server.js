const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Saichand@123",
    database: process.env.DB_NAME || "attendance_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4"
});

const STUDENTS_CACHE_TTL_MS = 1000;
let studentsCache = null;
let studentsCacheExpiry = 0;

function invalidateStudentsCache() {
    studentsCache = null;
    studentsCacheExpiry = 0;
}

async function getStudentsFromDb() {
    const [rows] = await db.promise().query("SELECT * FROM students ORDER BY id ASC");
    return rows;
}

async function getStudentsCached() {
    const now = Date.now();

    if (studentsCache && now < studentsCacheExpiry) {
        return studentsCache;
    }

    studentsCache = await getStudentsFromDb();
    studentsCacheExpiry = now + STUDENTS_CACHE_TTL_MS;
    return studentsCache;
}

app.post("/students", async (req, res) => {
    try {
        const { name, attendance } = req.body;

        const percentage = attendance === "Present" ? 100 : 0;

        await db.promise().query(
            "INSERT INTO students (name, attendance, attendance_percentage) VALUES (?, ?, ?)",
            [name, attendance, percentage]
        );

        invalidateStudentsCache();
        return res.status(201).json({ message: "Student added with auto percentage" });
    } catch (err) {
        return res.status(500).json({ error: "Failed to add student", details: err.message });
    }
});

app.get("/students", async (req, res) => {
    try {
        const result = await getStudentsCached();
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

db.promise().getConnection()
    .then(() => {
        console.log("MySQL Connected");
    })
    .catch((err) => {
        console.log("MySQL connection error:", err);
    });

const PORT = process.env.PORT || 3100;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
app.delete("/students/:id", async (req, res) => {
    try {
        const id = req.params.id;

        await db.promise().query("DELETE FROM students WHERE id = ?", [id]);
        invalidateStudentsCache();
        return res.json({ message: "Student deleted" });
    } catch (err) {
        return res.status(500).json({ error: "Failed to delete student", details: err.message });
    }
});

app.put("/students/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { name, attendance, attendance_percentage } = req.body;

        await db.promise().query(
            "UPDATE students SET name=?, attendance=?, attendance_percentage=? WHERE id=?",
            [name, attendance, attendance_percentage, id]
        );

        invalidateStudentsCache();
        return res.json({ message: "Student updated" });
    } catch (err) {
        return res.status(500).json({ error: "Failed to update student", details: err.message });
    }
});

app.use(express.static(path.join(__dirname, "public")));