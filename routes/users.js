const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Register new member
router.post('/register', (req, res) => {
    const { phone_number, password, full_name, sub_name, college_name } = req.body;
    db.query('INSERT INTO members (phone_number, password, full_name, sub_name, college_name) VALUES (?, ?, ?, ?, ?)', [phone_number, password, full_name, sub_name, college_name], (err) => {
        if (err) throw err;
        res.redirect('/login');
    });
});

// Member login
router.post('/login', (req, res) => {
    const { phone_number, password } = req.body;
    db.query('SELECT * FROM members WHERE phone_number = ? AND password = ?', [phone_number, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.member_id = results[0].id;
            res.redirect('/books');
        } else {
            res.redirect('/login');
        }
    });
});

module.exports = router;
