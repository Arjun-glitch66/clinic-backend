const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Arjun_2006",
    database: "clinic_db"
});

// ✅ Email setup (IMPORTANT: put your app password)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "arjunanand206@gmail.com",
        pass: "bmua mbzy ukbm ttco"   
    }
});

// ✅ Test route
app.get("/", (req, res) => {
    res.send("Server running ✅");
});

// ✅ Get all appointments (admin)
app.get("/appointments", (req, res) => {
    db.query("SELECT * FROM appointments ORDER BY date, time", (err, result) => {
        if (err) res.send("Error");
        else res.json(result);
    });
});

// ✅ BOOK APPOINTMENT
app.post("/book", (req, res) => {
    const { name, phone, date, time, service, message } = req.body;

    const sql = "INSERT INTO appointments (name, phone, date, time, service, message) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(sql, [name, phone, date, time, service, message], (err) => {
        if (err) return res.send("Database Error");

        // 📩 Send Email
        const mailOptions = {
            from: "arjunanand206@gmail.com",
            to: "arjunanand206@gmail.com",
            subject: "New Appointment",
            text: `New Appointment:
Name: ${name}
Phone: ${phone}
Date: ${date}
Time: ${time}
Service: ${service}
Message: ${message}`
        };

        transporter.sendMail(mailOptions);

        res.send("Appointment Booked & Email Sent ✅");
    });
});

// ✅ JOB APPLICATION
app.post("/apply", (req, res) => {
    const { name, phone, email, position, experience } = req.body;

    const sql = "INSERT INTO applications (name, phone, email, position, experience) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [name, phone, email, position, experience], (err) => {
        if (err) return res.send("Database Error");

        // 📩 Send Email
        const mailOptions = {
            from: "arjunanand206@gmail.com",
            to: "arjunanand206@gmail.com",
            subject: "New Job Application",
            text: `New Job Application:
Name: ${name}
Phone: ${phone}
Email: ${email}
Position: ${position}
Experience: ${experience}`
        };

        transporter.sendMail(mailOptions);

        res.send("Application Submitted & Email Sent ✅");
    });
});

// ✅ DELETE
app.delete("/delete/:id", (req, res) => {
    db.query("DELETE FROM appointments WHERE id = ?", [req.params.id], () => {
        res.send("Deleted Successfully");
    });
});

// ✅ START SERVER
app.listen(5000, () => {
    console.log("Server running on port 5000 🚀");
    console.log("JS LOADED");
});

app.get("/applications", (req, res) => {
    db.query("SELECT * FROM applications", (err, result) => {
        if (err) res.send("Error");
        else res.json(result);
    });
});

app.delete("/delete_application/:id", (req, res) => {
    db.query("DELETE FROM applications WHERE id = ?", [req.params.id], () => {
        res.send("Application Deleted Successfully");
    });
});