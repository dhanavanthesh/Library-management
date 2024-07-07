const express = require('express');
const router = express.Router();
const db = require('../config/db');

// View all available books
router.get('/', (req, res) => {
    db.query('SELECT * FROM books WHERE quantity > 0', (err, results) => {
        if (err) throw err;
        res.render('books', { books: results });
    });
});

// Render form to borrow a book
router.get('/borrow/:book_id', (req, res) => {
    const book_id = req.params.book_id;
    
    // Generate current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    
    res.render('borrowForm', { book_id, currentDate });
});

// Borrow a book
router.post('/borrow/:book_id', (req, res) => {
    const book_id = req.params.book_id;
    const member_id = req.session.member_id; // Assuming you have session management
    const { borrow_date, return_date } = req.body;

    // Check if the member has already borrowed this book
    db.query('SELECT * FROM borrowed_books WHERE book_id = ? AND member_id = ?', [book_id, member_id], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            // Book already borrowed by this member
            res.redirect(`/books`);
        } else {
            // Proceed to borrow the book
            db.query('UPDATE books SET quantity = quantity - 1 WHERE id = ?', [book_id], (err) => {
                if (err) throw err;

                db.query('INSERT INTO borrowed_books (book_id, member_id, borrow_date, return_date) VALUES (?, ?, ?, ?)', [book_id, member_id, borrow_date, return_date], (err) => {
                    if (err) throw err;
                    res.redirect(`/books`);
                });
            });
        }
    });
});


// View borrowed books
router.get('/borrowed', (req, res) => {
    const member_id = req.session.member_id;

    db.query('SELECT b.*, bb.borrow_date, bb.return_date FROM books b JOIN borrowed_books bb ON b.id = bb.book_id WHERE bb.member_id = ?', [member_id], (err, results) => {
        if (err) throw err;
        res.render('borrowedBooks', { books: results });
    });
});

module.exports = router;


