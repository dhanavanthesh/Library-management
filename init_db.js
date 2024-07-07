require('dotenv').config();
const mysql = require('mysql2');
const connection = require('./config/db');

function createDatabaseAndTables() {
  return new Promise((resolve, reject) => {
    connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`, (err) => {
      if (err) return reject(err);

      const useDatabaseQuery = `USE ${process.env.MYSQL_DATABASE}`;
      connection.query(useDatabaseQuery, (err) => {
        if (err) return reject(err);

        // const dropTables = `
        //   DROP TABLE IF EXISTS borrowed_books, authors, publishers, vendors, books, members, employees, libraries, admins;
        // `;

        
        const createAdminsTable = `
          CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
          );`;

        const createMembersTable = `
          CREATE TABLE IF NOT EXISTS members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone_number VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            sub_name VARCHAR(255),
            college_name VARCHAR(255)
          );`;

          const createBooksTable = `
          CREATE TABLE IF NOT EXISTS books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            book_id VARCHAR(255) UNIQUE NOT NULL,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255),
            price DECIMAL(10, 2),
            status VARCHAR(50),
            isbn VARCHAR(255),
            quantity INT
          );`;
        

        const createBorrowedBooksTable = `
          CREATE TABLE IF NOT EXISTS borrowed_books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            book_id INT,
            member_id INT,
            borrow_date DATETIME,
            return_date DATETIME,
            FOREIGN KEY (book_id) REFERENCES books(id),
            FOREIGN KEY (member_id) REFERENCES members(id)
          );`;

        const createTables = [
          // dropTables,
          createAdminsTable,
          createMembersTable,
          createBooksTable,
          createBorrowedBooksTable
        ];


        let promiseChain = Promise.resolve();

        createTables.forEach(query => {
          promiseChain = promiseChain.then(() => new Promise((resolve, reject) => {
            connection.query(query, (err, results) => {
              if (err) return reject(err);
              resolve(results);
            });
          }));
        });

        promiseChain
          .then(() => {
            console.log('All tables created successfully.');

            // Check if the admin user exists
            const checkAdminQuery = 'SELECT * FROM admins WHERE username = ?';
            connection.query(checkAdminQuery, ['team'], (err, results) => {
              if (err) return reject(err);

              if (results.length === 0) {
                // Insert the admin user if it doesn't exist
                const insertAdminQuery = 'INSERT INTO admins (username, password) VALUES (?, ?)';
                connection.query(insertAdminQuery, ['team', '123'], (err) => {
                  if (err) return reject(err);
                  console.log('Admin user created successfully.');
                  resolve();
                });
              } else {
                console.log('Admin user already exists.');
                resolve();
              }
            });
          })
          .catch(reject);
      });
    });
  });
}

module.exports = createDatabaseAndTables;
