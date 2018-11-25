var PouchDB = require("pouchdb");
var booksdb = new PouchDB("./pouchdb/books");

var addNewBook = function (title, pageFiles, response) {
    var newBook = {
        _id: new Date().toISOString(),
        title: title,
        _attachments: {}
    };
    for (var page in pageFiles) {
        newBook._attachments[page] = {
            content_type: pageFiles[page].mimetype,
            data: pageFiles[page].buffer
        };
    }
    booksdb.put(newBook)
        .then(function (result) {
            response.send("Book added");
        })
        .catch(function (err) {
            console.log(`Error in addNewBook: ${err}`);
            response.send("Failed to add book. Please try again.");
        });
};

var getAllBooks = function (response) {
    booksdb.allDocs({
            include_docs: true
        })
        .then(function (result) {
            response.send(result);
        })
        .catch(function (err) {
            console.log(`Error in getAllBooks: ${err}`);
            response.send("Failed to get books. Please try again.");
        });
};

var getBookById = function (bookId, response) {
    booksdb.get(bookId)
        .then(function (result) {
            response.send(result);
        })
        .catch(function (err) {
            console.log(`Error in getBookById: ${err}`);
            response.send("Failed to get book. Please try again.");
        });
}

var getPageFromBook = function (bookId, pageNum, response){
    booksdb.get(bookId, {attachments: true})
    .then(function (result) {
        response.send(result._attachments[pageNum]);
    })
    .catch(function (err) {
        console.log(`Error in getPageFromBook: ${err}`);
        response.send("Failed to page from book. Please try again.");
    });
}

module.exports = {
    addNewBook: addNewBook,
    getAllBooks: getAllBooks,
    getBookById: getBookById,
    getPageFromBook: getPageFromBook
};