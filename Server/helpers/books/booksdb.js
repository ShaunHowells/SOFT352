//Set up database connections
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/collaborativereader", {
    useNewUrlParser: true
});

var Books = mongoose.model("Books", {
    title: String,
    pages: [{
        pageNum: Number,
        contentType: String,
        data: Buffer
    }]
});

/**
 * Callback used when accessing Books from MongoDB
 * 
 * @callback booksCallback
 * @param {object} err - The error returned from MongoDB access
 * @param {object} result - The result returned from MongoDB access
 */

 /**
 * Adds a new book to the collection
 *
 * @param {string} title - The title of the book to be added
 * @param {array} pageFiles - An array of files containing the images for each page (in order)
 * @param {booksCallback} callback - A callback to run after database access.
 */
var addNewBook = function (title, pageFiles, callback) {
    var newBook = new Books({
        title: title,
        pages: []
    });
    var page = {};
    for (var page in pageFiles) {
        page = {
            pageNum: page,
            contentType: pageFiles[page].mimetype,
            data: pageFiles[page].buffer
        };
        newBook.pages.push(page);
    }
    newBook.save(callback);
};

 /**
 * Gets all of the Books from MongoDB
 *
 * @param {booksCallback} callback - A callback to run after database access.
 */
var getAllBooks = function (callback) {
    Books.find().select("-pages").exec(callback);
};

/**
 * Returns the book with a given id.
 *
 * @param {booksCallback} callback - A callback to run after database access.
 */
var getBookById = function (bookId, callback) {
    Books.findOne({
        _id: bookId
    }).select("-pages").exec(callback);
}

/**
 * Returns the a page from a book with a given id.
 *
 * @param {booksCallback} callback - A callback to run after database access.
 */
var getPageFromBook = function (bookId, pageNum, callback) {
    Books.findOne({
        "_id": bookId,
        "pages.pageNum": pageNum
    }).select( { "pages.$": 1 }).exec(callback);
}

module.exports = {
        addNewBook: addNewBook,
        getAllBooks: getAllBooks,
        getBookById: getBookById,
        getPageFromBook: getPageFromBook
};