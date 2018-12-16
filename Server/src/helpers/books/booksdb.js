//Mongoose Models
var models;

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
    var newBook = new models.Books({
        title: title,
        pages: []
    });

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
    models.Books.find().select("-pages.data").exec(callback);
};

/**
 * Returns the book with a given id.
 *
 * @param {booksCallback} callback - A callback to run after database access.
 */
var getBookById = function (bookId, callback) {
    models.Books.findOne({
        _id: bookId
    }).select("-pages.data").exec(callback);
}

/**
 * Returns the a page from a book with a given id.
 *
 * @param {booksCallback} callback - A callback to run after database access.
 */
var getPageFromBook = function (bookId, pageNum, callback) {
    models.Books.findOne({
        "_id": bookId,
        "pages.pageNum": pageNum
    }).select({
        "title": true,
        "pageCount": true,
        "pages.$": 1
    }).exec(callback);
}
/**
 * Sets available mongoose models
 *
 * @param {object} mongooseModels Available Mongoose models
 */
var setMongooseModels = function (mongooseModels) {
    models = mongooseModels;
}

module.exports = {
    addNewBook: addNewBook,
    getAllBooks: getAllBooks,
    getBookById: getBookById,
    getPageFromBook: getPageFromBook,
    setMongooseModels: setMongooseModels
};