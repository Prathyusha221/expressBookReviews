const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        if(!isValid(username)){
            return res.status(404).json({message: 'Invalid Username.'});
        }
        // Check if the user does not already exist
        if (!users.some(user => user.username === username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user, Missing Username/Password."});
});

const getBooks = () => {
    return new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("Books data not found");
      }
    });
  };

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooks()
    .then((bookList) => {
      return res.status(200).json(bookList);
    })
    .catch((err) => {
      return res.status(500).json({ message: err });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then(book => {
      return res.status(200).json(book);
    })
    .catch(error => {
      return res.status(404).json({ message: error });
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const filtered_books = Object.values(books).filter(book => book.author === author);
    if (filtered_books.length > 0) {
      resolve(filtered_books);
    } else {
      reject("Book not found");
    }
  });  
  
  getBooksByAuthor
    .then(booksByAuthor => {
      return res.status(200).json(booksByAuthor);
    }).catch(error => {
      return res.status(404).json({ message: error });
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    const filtered_books = Object.values(books).filter(book => book.title === title);
    if (filtered_books.length > 0) {
      resolve(filtered_books);
    } else {
      reject("Book not found");
    }
  });  
  
  getBooksByTitle
    .then(booksByTitle => {
      return res.status(200).json(booksByTitle);
    }).catch(error => {
      return res.status(404).json({ message: error });
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(300).json(book['reviews']);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
