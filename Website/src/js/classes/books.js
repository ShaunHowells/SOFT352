/**
 * @classdesc Handles all of the functionality relating to the handling of multiple 'Books'.
 * 
 * @class
 * @hideconstructor
 */
const Books = (function() { // eslint-disable-line no-unused-vars
    var bookList = []; //Stores the list of retrieved books
    const defaultBookPage = {
        _id: null,
        title: null,
        pageCount: null,
        currentPage: {
            src: "DefaultPage.png",
            pageNum: 0
        }
    };

    var currentBookPage = new BookPage(defaultBookPage);

    var bookListObserver = new Observer();
    var updateBookPageObserver = new Observer();

    /**
     * Returns bookListObserver
     * 
     * @memberof Books
     * @return {Observer} - Observer for the bookList
     */
    function getBookListObserver() {
        return bookListObserver;
    }
    /**
     * Returns updateBookPageObserver
     * 
     * @memberof Books
     * @return {Observer} - Observer for updating the current page and book
     */
    function getUpdateBookPageObserver() {
        return updateBookPageObserver;
    }

    /**
     * Sends a request to the server to retrieve the list of all books
     * NOTE: This retrieves basic information about each book to avoid the amount
     * of bandwidth required to transfer all of the images stored in each 'Book'
     * 
     * @memberof Books
     */
    function retrieveBookList() {
        var self = this;
        $.post("http://localhost:9000/books/getallbooks", {}).done(function(data) {
            if (data.success) {
                self.setBookList(data.result);
            } else {
                alert("An error has occured when retrieving book list. Please try again");
                console.log(data);
            }
        });
    }

    /**
     * Sends a request to the server to retrieve the list of all books
     * NOTE: This retrieves basic information about each book to avoid the amount
     * of bandwidth required to transfer all of the images stored in each 'Book'
     * 
     * @param {object[]} books - An array of objects containing the basic information about a set of books 
     * @memberof Books
     */
    function setBookList(books) {
        bookList = [];

        for (var book in books) {
            bookList.push(new Book(books[book]));
        }
        bookListObserver.notify(bookList);
    }

    /**
     * Returns the bookList
     * 
     * @returns {Book[]} - The current list of books
     * @memberof Books
     */
    function getBookList() {
        return bookList;
    }

    /**
     * Returns the currentBookPage
     * 
     * @returns {BookPage} - Current book page
     */
    function getCurrentBookPage() {
        return currentBookPage;
    }

    /**
     * Sets the current book/page, then notifies the updateBookPageObserver
     * 
     * @param {object} data - Data of the book + page
     */
    function setCurrentBookPage(data) {
        if (data && Object.keys(data).length) {
            currentBookPage = new BookPage({
                _id: data._id,
                title: data.title,
                pageCount: data.pageCount,
                currentPage: data.currentPage
            });
            updateBookPageObserver.notify(currentBookPage);
        } else {
            resetCurrentBookPage();
        }
    }

    /**
     * Retrieves a new page from the current book
     * 
     * @param {number} pageNum - Number of the page (starts from 0)
     * @memberof Books
     */
    function retrieveNewPageFromBook(bookId, pageNum, callback) {
        if (bookId != null && pageNum != null) {
            for (var book in bookList) {
                if (bookList[book]._id == bookId) {
                    bookList[book].getPageData(pageNum, function(data) {
                        callback(data);
                    });
                }
            }
        }
    }

    /**
     * Resets the currentBookPage to the defaultBookPagePage
     * 
     * @memberof Books
     */
    function resetCurrentBookPage() {
        setCurrentBookPage(defaultBookPage);
    }

    /**
     * Given a session, find the details of the book/page and retrieve the page from the book.
     * 
     * @param {Session} session - Session to retrieve book details from
     * @memberof Books
     */
    function getSessionBookPage(session) {
        if (session) {
            retrieveNewPageFromBook(session.currentBook._id, session.currentPageNum, function(data) {
                var bookDetails = {
                    _id: session.currentBook._id,
                    title: session.currentBook.title,
                    pageCount: data.pageCount,
                    currentPage: {
                        contentType: data.pages[0].contentType,
                        imageData: data.pages[0].data.data,
                        pageNum: data.pages[0].pageNum
                    }
                };
                setCurrentBookPage(bookDetails);
            });
        } else {
            resetCurrentBookPage();
        }
    }

    return {
        getBookListObserver,
        getUpdateBookPageObserver,
        retrieveBookList,
        setBookList,
        getBookList,
        getCurrentBookPage,
        setCurrentBookPage,
        retrieveNewPageFromBook,
        resetCurrentBookPage,
        getSessionBookPage
    };
})();

/**
 * Handles all of the functionality related to an individual book
 * @constructor
 */
function Book(bookDetails) {
    /**
     * The title of the book
     * 
     * @member {string}
     */
    this.title = bookDetails.title;
    /**
     * The id of the book
     * 
     * @member {string}
     */
    this._id = bookDetails._id;

    /**
     * The number of pages in the book
     */
    this.pageCount = bookDetails.pageCount;

    /**
     * Retrieves the data of a given page of the book
     * 
     * @param {number} pageNum - The number of the page you want to retrieve
     * @param {callback} callback - The function to execute after the page is successfully retrieved
     */
    this.getPageData = function(pageNum, callback) {
        if (pageNum >= 0 || pageNum < this.pageCount) {
            $.post("http://localhost:9000/books/getpagefrombook", {
                bookId: this._id,
                pageNum: pageNum
            }).done(function(data) {
                if (data.success) {
                    callback(data.result);
                } else {
                    alert("An error has occured retrieving the page data. Please try again");
                    console.log(data);
                }
            });
        } else {
            console.error("This books does not have page number " + pageNum);
        }
    };
}
/**
 * Handles all of the functionality related to an page in a book
 * @constructor
 */
function BookPage(bookPageDetails) {
    /**
     * The ID of the book
     * @member {number}
     */
    this._id = bookPageDetails._id;
    /**
     * The title of the book
     * @member {string}
     */
    this.title = bookPageDetails.title;
    /**
     * The number of pages in the book
     * @member {number}
     */
    this.pageCount = bookPageDetails.pageCount;
    /**
     * The current page of the book
     * @member {object}
     */
    this.currentPage = {
        /**
         * The number of the page - Starts from 0
         * @member {number}
         */
        pageNum: bookPageDetails.currentPage.pageNum,
        /**
         * The source of the page image
         * This source will either be a filename, or the image data as retrieved from the server
         * @member {string}
         */
        src: bookPageDetails.currentPage.src ? bookPageDetails.currentPage.src : bookPageDetails.currentPage.imageData ? "data:" + bookPageDetails.currentPage.contentType + ";base64," + util_encode(bookPageDetails.currentPage.imageData) : null
    };
}