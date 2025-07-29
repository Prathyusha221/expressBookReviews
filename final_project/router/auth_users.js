const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return typeof username === 'string' && username.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
//   return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  let isbn=req.params.isbn;
  let review=req.query.review;
  // Check if user is logged in (username stored in session)
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please login first." });
  }

  if (!isbn) {
    return res.status(400).json({ message: "ISBN parameter is missing." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is missing." });
  }
  
  let book = books[isbn];
  if(!book){
    return res.status(404).json({ message: "Book not found." });
  }

  // Add or update review by username
  book.reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully.", reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  let isbn=req.params.isbn;
  // Check if user is logged in (username stored in session)
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please login first." });
  }

  if (!isbn) {
    return res.status(400).json({ message: "ISBN parameter is missing." });
  }
  
  let book = books[isbn];
  if(!book){
    return res.status(404).json({ message: "Book not found." });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on this book." });
  }

  // Delete the review
  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
