const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// ✅ Middleware
app.use(cors({
    origin: "*"
}));
app.use(express.json());

// ✅ MySQL Connection (ENV based)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// ✅ Check DB connection
db.connect((err) => {
    if (err) {
        console.log("❌ MySQL Connection Failed:", err);
    } else {
        console.log("✅ MySQL Connected");
    }
});

// ✅ Email Setup (ENV based)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Test route
app.get("/", (req, res) => {
    res.send("Server running ✅");
});

// ✅ Get all appointments
app.get("/appointments", (req, res) => {
    const sql = "SELECT * FROM appointments ORDER BY date, time";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error fetching appointments");
        } else {
            res.json(result);
        }
    });
});

// ✅ BOOK APPOINTMENT
app.post("/book", (req, res) => {
    const { name, phone, date, time, service, message } = req.body;

    if (!name || !phone || !date || !time) {
        return res.status(400).send("Missing required fields");
    }

    const sql = `
        INSERT INTO appointments (name, phone, date, time, service, message) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, phone, date, time, service, message], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database Error");
        }

        // 📩 Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "New Appointment",
            text: `New Appointment:
Name: ${name}
Phone: ${phone}
Date: ${date}
Time: ${time}
Service: ${service}
Message: ${message}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("❌ Email Error:", err);
            } else {
                console.log("✅ Email Sent:", info.response);
            }
        });

        res.send("Appointment Booked & Email Sent ✅");
    });
});

// ✅ JOB APPLICATION
app.post("/apply", (req, res) => {
    const { name, phone, email, position, experience } = req.body;

    if (!name || !phone || !email || !position) {
        return res.status(400).send("Missing required fields");
    }

    const sql = `
        INSERT INTO applications (name, phone, email, position, experience) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, phone, email, position, experience], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database Error");
        }

        // 📩 Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "New Job Application",
            text: `New Job Application:
Name: ${name}
Phone: ${phone}
Email: ${email}
Position: ${position}
Experience: ${experience}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("❌ Email Error:", err);
            } else {
                console.log("✅ Email Sent:", info.response);
            }
        });

        res.send("Application Submitted & Email Sent ✅");
    });
});

// ✅ DELETE APPOINTMENT
app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM appointments WHERE id = ?", [id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send("Delete Error");
        } else {
            res.send("Deleted Successfully");
        }
    });
});

// ✅ GET APPLICATIONS
app.get("/applications", (req, res) => {
    db.query("SELECT * FROM applications", (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error fetching applications");
        } else {
            res.json(result);
        }
    });
});

// ✅ DELETE APPLICATION
app.delete("/delete_application/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM applications WHERE id = ?", [id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send("Delete Error");
        } else {
            res.send("Application Deleted Successfully");
        }
    });
});

// ✅ START SERVER (IMPORTANT FIX FOR RAILWAY)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});