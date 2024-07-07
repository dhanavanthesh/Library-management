const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.admin_id = results[0].id;
            res.redirect('/admin/books');
        } else {
            res.redirect('/admin-login');
        }
    });
});

// View and manage books route
router.get('/books', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) throw err;
        res.render('admin/books', { books: results });
    });
});

// Render form to add new book route
router.get('/books/add', (req, res) => {
    res.render('admin/addBook'); // Render the form view
});

// Add new book route
router.post('/books/add', (req, res) => {
    const { title, author, price, status, quantity } = req.body;
    db.query('INSERT INTO books (title, author, price, status, quantity) VALUES (?, ?, ?, ?, ?)', [title, author, price, status, quantity], (err) => {
        if (err) throw err;
        res.redirect('/admin/books');
    });
});

// View all borrowed books route
router.get('/books/borrow', (req, res) => {
    db.query('SELECT bb.id, b.title, m.full_name, bb.borrow_date, bb.return_date FROM borrowed_books bb JOIN books b ON bb.book_id = b.id JOIN members m ON bb.member_id = m.id', (err, results) => {
        if (err) throw err;
        res.render('admin/borrowedBooks', { borrowedBooks: results });
    });
});

// Borrow book route
router.post('/books/borrow', (req, res) => {
    const { book_id, member_id, borrow_date, return_date } = req.body;
    db.query('INSERT INTO borrowed_books (book_id, member_id, borrow_date, return_date) VALUES (?, ?, ?, ?)', [book_id, member_id, borrow_date, return_date], (err) => {
        if (err) throw err;
        
        // Decrement the quantity of the borrowed book
        db.query('UPDATE books SET quantity = quantity - 1 WHERE id = ?', [book_id], (err) => {
            if (err) throw err;
            res.redirect('/admin/books');
        });
    });
});

module.exports = router;
