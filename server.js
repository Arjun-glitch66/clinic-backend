const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ MySQL Pool (STABLE)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// ✅ Check DB connection
db.getConnection((err, connection) => {
    if (err) {
        console.log("❌ MySQL Pool Error:", err);
    } else {
        console.log("✅ MySQL Pool Connected");
        connection.release();
    }
});

// ✅ EMAIL SETUP (BREVO - FIXED)
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,   // ✅ no quotes
        pass: process.env.EMAIL_PASS
    }
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
    res.send("Server running ✅");
});

// ✅ GET APPOINTMENTS
app.get("/appointments", (req, res) => {
    db.query("SELECT * FROM appointments ORDER BY date, time", (err, result) => {
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

        // 📩 EMAIL
        const mailOptions = {
            from: "arjunanand206@gmail.com",   // ✅ VERIFIED EMAIL
            to: "arjunanand206@gmail.com",     // ✅ YOUR INBOX
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
                return res.send("Appointment Booked but Email Failed ❌");
            } else {
                console.log("✅ Email Sent:", info.response);
                res.send("Appointment Booked & Email Sent ✅");
            }
        });
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

        // 📩 EMAIL
        const mailOptions = {
            from: "arjunanand206@gmail.com",   // ✅ VERIFIED EMAIL
            to: "arjunanand206@gmail.com",     // ✅ YOUR INBOX
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
                return res.send("Application Submitted but Email Failed ❌");
            } else {
                console.log("✅ Email Sent:", info.response);
                res.send("Application Submitted & Email Sent ✅");
            }
        });
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

// ✅ START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});