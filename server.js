const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");

const app = express();

// ✅ CORS (secure)
app.use(cors({
    origin: [
        "https://movementclinic.com",
        "https://movement-clinic.vercel.app"
    ]
}));

app.use(express.json());

// ✅ MySQL Pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false }
});

// ✅ Check DB
db.getConnection((err, connection) => {
    if (err) console.log("❌ DB Error:", err);
    else {
        console.log("✅ DB Connected");
        connection.release();
    }
});

// ✅ TEST
app.get("/", (req, res) => {
    res.send("Server running ✅");
});

// =========================
// 📥 GET APPOINTMENTS
// =========================
app.get("/appointments", (req, res) => {
    db.query("SELECT * FROM appointments ORDER BY date, time", (err, result) => {
        if (err) return res.status(500).send("Error fetching");
        res.json(result);
    });
});

// =========================
// 📅 BOOK APPOINTMENT
// =========================
app.post("/book", (req, res) => {
    const { name, phone, email, date, time, service, message } = req.body;

    if (!name?.trim() || !phone?.trim() || !date || !time) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    if (phone.length < 10) {
        return res.status(400).json({ success: false, message: "Invalid phone" });
    }

    const sql = `
        INSERT INTO appointments 
        (name, phone, email, date, time, service, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, phone, email, date, time, service, message], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false });
        }

        // 📧 Email
        axios.post("https://api.brevo.com/v3/smtp/email", {
            sender: { name: "Movement Clinic", email: "arjunanand206@gmail.com" },
            to: [{ email: "arjunanand206@gmail.com" }],
            subject: "New Appointment",
            textContent: `New Appointment:
Name: ${name}
Phone: ${phone}
Email: ${email}
Date: ${date}
Time: ${time}
Service: ${service}
Message: ${message}`
        }, {
            headers: {
                "api-key": process.env.EMAIL_PASS.replace(/\s+/g, ''),
                "Content-Type": "application/json"
            }
        }).catch(err => console.log("Email Error:", err.message));

        res.json({ success: true, message: "Appointment booked ✅" });
    });
});

// =========================
// 🧑‍⚕️ APPLY JOB
// =========================
app.post("/apply", (req, res) => {
    const { name, phone, email, position, experience, qualification, message } = req.body;

    if (!name?.trim() || !phone?.trim() || !email?.trim() || !position) {
        return res.status(400).json({ success: false });
    }

    const sql = `
        INSERT INTO applications 
        (name, phone, email, position, experience, qualification, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, phone, email, position, experience, qualification, message], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false });
        }

        // 📧 Email
        axios.post("https://api.brevo.com/v3/smtp/email", {
            sender: { name: "Movement Clinic", email: "arjunanand206@gmail.com" },
            to: [{ email: "arjunanand206@gmail.com" }],
            subject: "New Job Application",
            textContent: `New Job Application:
Name: ${name}
Phone: ${phone}
Email: ${email}
Position: ${position}
Experience: ${experience}
Qualification: ${qualification}
Message: ${message}`
        }, {
            headers: {
                "api-key": process.env.EMAIL_PASS.replace(/\s+/g, ''),
                "Content-Type": "application/json"
            }
        }).catch(err => console.log("Email Error:", err.message));

        res.json({ success: true, message: "Application submitted ✅" });
    });
});

// =========================
// ❌ DELETE APPOINTMENT (PROTECTED)
// =========================
app.delete("/delete/:id", (req, res) => {
    const key = req.headers["x-admin-key"];

    if (key !== "admin123") {
        return res.status(403).send("Unauthorized");
    }

    db.query("DELETE FROM appointments WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).send("Delete Error");
        res.send("Deleted");
    });
});

// =========================
// 📄 GET APPLICATIONS
// =========================
app.get("/applications", (req, res) => {
    db.query("SELECT * FROM applications ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).send("Error fetching");
        res.json(result);
    });
});

// =========================
// ❌ DELETE APPLICATION (PROTECTED)
// =========================
app.delete("/delete_application/:id", (req, res) => {
    const key = req.headers["x-admin-key"];

    if (key !== "admin123") {
        return res.status(403).send("Unauthorized");
    }

    db.query("DELETE FROM applications WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).send("Delete Error");
        res.send("Deleted");
    });
});

// =========================
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});