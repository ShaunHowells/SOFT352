/**
 * Books - Handles all of the functionality relating to the handling of 'Books'
 * @constructor
 */
function Books() { // eslint-disable-line no-unused-vars

    this.bookList = []; //Stores the list of retrieved books
    this.bookListCallback = null; //The callback to be executed when the list of books is udpated

    this.updatePageCallback = null; //The callback to be executed when a new page needs to be loaded
    this.defaultPage = { //The default page to be displayed when not in a session
        src: "testimage.jpg",
        pageNum: 0
    }
    this.currentPage = this.defaultPage; //The current page being displayed - Default value is set to default page

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

    /**
     * getBookPage - Gets the page data for a page in a book
     */
    this.getBookPage = function (bookId, pageNum) {
        if (bookId && pageNum != null) {
            var self = this;
            $.post("http://localhost:9000/books/getpagefrombook", {
                bookId: bookId,
                pageNum: pageNum
            }).done(function (data) {
                if (data.success) {
                    self.updateDisplayedPage(data.result);
                } else {
                    alert("An error has occured retrieving the page data. Please try again");
                    console.log(data);
                }
            });
        }
    };
    /**
     * updateDisplayedPage - Checks that the page data is correct, then calls the setPageCallback
     */
    this.updateDisplayedPage = function (data) {
        if (data.pages && data.pages.length == 1) {
            this.currentPage = {
                src: "data:" + data.pages[0].contentType + ";base64," + util_encode(data.pages[0].data.data),
                pageNum: data.pages[0].pageNum
            }
            this.callUpdatePageCallback();
        } else {
            console.error("Page data is not in the expected format");
        }
    };
    /**
     * setUpdatePageCallback - Sets this.updatePageCallback. After setting this.updatePageCallback the callback is called
     */
    this.setUpdatePageCallback = function (callback) {
        this.updatePageCallback = callback;
        this.callUpdatePageCallback();
    };
    /**
     * callUpdatePageCallback -  Checks that this.updatePageCallback is set then calls it
     */
    this.callUpdatePageCallback = function () {
        if (this.updatePageCallback) {
            this.updatePageCallback(this.currentPage);
        }
    };
    /**
     * setCurrentPage - Sets this.currentPage. Used when the page needs to be set to a local image (using a filename rather than a buffer)
     */
    this.setCurrentPage = function (newPage) {
        this.currentPage = newPage;

        this.callUpdatePageCallback();
    };
    /**
     * getCurrentPage - Returns this.currentPage
     */
    this.getCurrentPage = function () {
        return this.currentPage;
    };
    /*
     * resetPage - Resets the currentPage to the default page
     */
    this.resetPage = function () {
        this.setCurrentPage(this.defaultPage);
    }
}