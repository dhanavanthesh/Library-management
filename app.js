const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();
const db = require('./config/db');
const createDatabaseAndTables = require('./init_db');

const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sessionStore = new MySQLStore({}, db);

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

// Initialize database and tables, then start the server
createDatabaseAndTables().then(() => {
    db.connect((err) => {
        if (err) throw err;
        console.log('Connected to the database');

        // Routes
        app.use('/', indexRouter);
        app.use('/books', booksRouter);
        app.use('/users', usersRouter);
        app.use('/admin', adminRouter);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
}).catch(error => {
    console.error('Failed to initialize database:', error);
});
