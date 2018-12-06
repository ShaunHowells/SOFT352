/**
 * Books - Handles all of the functionality relating to the handling of 'Books'
 * @constructor
 */
function Books() { // eslint-disable-line no-unused-vars
    
    this.bookList = []; //Stores the list of retrieved books
    this.bookListCallback = null; //The callback to be executed when the list of books is udpated

    /**
     * retrieveBookList - Sends a request to the server to retrieve the list of all books
     * NOTE: This retrieves basic information about each book to avoid the amount
     * of bandwidth required to transfer all of the images stored in each 'Book'
     */
    this.retrieveBookList = function () {
        var self = this;
        $.post("http://localhost:9000/books/getallbooks", {}).done(function (data) {
            if (data.success) {
                self.setBookList(data.result);
            } else {
                alert("An error has occured when retrieving book list. Please try again");
                console.log(data);
            }
        });
    };

    /**
     * setBookList - Sends a request to the server to retrieve the list of all books
     * NOTE: This retrieves basic information about each book to avoid the amount
     * of bandwidth required to transfer all of the images stored in each 'Book'
     * 
     * @param {Object[]} books - An array of objects containing the basic information about a set of books 
     */
    this.setBookList = function (books) {
        this.bookList = books;
        this.callBookListCallback();
    };

    /**
     * getBookList - Returns this.bookList
     * 
     * @returns {Object[]}
     */
    this.getBookList = function () {
        return this.bookList;
    };

    /**
     * setBookListCallback - Sets this.bookListCallback - After setting this.bookListCallback the callback is called
     * 
     * @param {Function} callback - The callback to set this.bookListCallback to
     */
    this.setBookListCallback = function (callback) {
        this.bookListCallback = callback;
        this.callBookListCallback();
    };

    /**
     * callBookListCallback - Checks that this.bookListCallback is set then calls it
     */
    this.callBookListCallback = function () {
        if (this.bookListCallback) {
            this.bookListCallback(this.bookList);
        }
    };
}