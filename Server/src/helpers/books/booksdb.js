/**
 * Books Database Access
 * @module Booksdb
 */

//Mongoose Models
var models;

/**
 * Callback used when accessing Books from MongoDB
 * 
 * @callback booksCallback
 * @param {Object} err - The error returned from MongoDB access
 * @param {Object} result - The result returned from MongoDB access
 */

/**
 * Adds a new book to the collection
 *
 * @param {String} title - The title of the book to be added
 * @param {Object[]} pageFiles - An array of files containing the images for each page (in order)
 * @param {booksCallback} callback - A callback to run after database access.
 */
var addNewBook = function (title, pageFiles, callback) {
    var newBook = new models.Books({
        title: title,
        pages: []
    });

    //Add all of the provided pages to the book
    for (var page in pageFiles) {
        newBook.pages.push({
            pageNum: page,
            contentType: pageFiles[page].mimetype,
            data: pageFiles[page].buffer
        });
    }
    newBook.pageCount = newBook.pages.length;
    newBook.save(callback);
};

/**
 * Gets all of the Books from MongoDB
 *
 * @param {booksCallback} callback - A callback to run after database access.
 */
var getAllBooks = function (callback) {
    //Find the list of books and filter out the data for each page
    models.Books.find().select("-pages.data").exec(callback);
};

/**
 * Returns the a page from a book with a given id.
 *
 * @param {String} bookId - The ID of the book to retrieve the page from.
 * @param {Number} pageNum - The number of the page in the book to retrieve.
 * @param {booksCallback} callback - A callback to run after database access.
 */
var getPageFromBook = function (bookId, pageNum, callback) {
    //Return the title, pageCount, and selected page from the book
    models.Books.findOne({
        "_id": bookId,
        "pages.pageNum": pageNum
    }).select({
        "title": true,
        "pageCount": true,
        "pages.$": 1
    }).exec(callback);
};
/**
 * Sets available mongoose models
 *
 * @param {Object} mongooseModels Available Mongoose models
 */
var setMongooseModels = function (mongooseModels) {
    models = mongooseModels;
};

module.exports = {
    addNewBook: addNewBook,
    getAllBooks: getAllBooks,
    getPageFromBook: getPageFromBook,
    setMongooseModels: setMongooseModels
};