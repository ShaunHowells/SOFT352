/**
 * @classdesc Handles all of the functionality relating to the handling of multiple 'Books'.
 * 
 * @class
 * @hideconstructor
 */
const Books = (function () { // eslint-disable-line no-unused-vars
    var currentUserId; //ID of the current user
    var bookList = []; //Stores the list of retrieved books
    const defaultPage = { //The default page to be displayed when not in a session
        src: "testimage.jpg",
        pageNum: 0
    };
    var currentPage = new Page(defaultPage); //The current page being displayed - Default value is set to default page

    var bookListObserver = new Observer();
    var updatePageObserver = new Observer();

    /**
     * Returns bookListObserver
     * 
     * @memberof Books
     * @return {Observer} Observer for the bookList
     */
    function getBookListObserver() {
        return bookListObserver;
    }
    /**
     * Returns updatePageObserver
     * 
     * @memberof Books
     * @return {Observer} Observer for updating the current page
     */
    function getUpdatePageObserver() {
        return updatePageObserver;
    }


    /**
     * Sets the current user id - Value may only be set once
     * 
     * @param {String} newUserId - ID to set currentUserID as
     * @memberof Books
     */
    function setCurrentUserId(newUserId) {
        if (!currentUserId) {
            currentUserId = newUserId;
        } else {
            console.error("Current User Id may only be set once");
        }
    }
    /**
     * Returns currentUserId
     * 
     * @return {String} The current User ID
     * @memberof Books
     */
    function getCurrentUserId() {
        return currentUserId;
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
     * Sends a request to the server to retrieve the list of all books
     * NOTE: This retrieves basic information about each book to avoid the amount
     * of bandwidth required to transfer all of the images stored in each 'Book'
     * 
     * @param {Object[]} books - An array of objects containing the basic information about a set of books 
     * @memberof Books
     */
    function setBookList(books) {
        bookList = [];

        for (var book in books) {
            bookList.push(new Book(books[book]));
        }
        bookListObserver.notify(bookList);
    };

    /**
     * Returns the bookList
     * 
     * @returns {Book[]} The current list of books
     * @memberof Books
     */
    function getBookList() {
        return bookList;
    };

    /**
     * Gets the page data for a page in a book
     * 
     * @param {String} bookId - ID of the book containing the page
     * @param {Integer} pageNum - Number of the page (starts from 0)
     * @memberof Books
     */
    function getBookPage(bookId, pageNum) {
        if (bookId && pageNum != null) {
            for (var book in bookList) {
                if (bookList[book]._id == bookId) {
                    bookList[book].getPageData(pageNum, function (data) {
                        updateDisplayedPage(data);
                    });
                    break;
                }
            }
        }
    };
    /**
     * Checks that the page data is correct, then notifies the updatePageObserver
     * 
     * @param {Object} data - Data of the book + page
     */
    function updateDisplayedPage(data) {
        if (data.pages && data.pages.length == 1) {
            currentPage = new Page(data.pages[0]);

            updatePageObserver.notify(currentPage);
        } else {
            console.error("Page data is not in the expected format");
        }
    };

    /**
     * Sets currentPage. Used when the page needs to be set to a local image (using a filename rather than a buffer)
     * 
     * @param {Object} newPage - Details of the page to set as the current page
     * @memberof Books
     */
    function setCurrentPage(newPage) {
        currentPage = new Page(newPage);

        updatePageObserver.notify(currentPage);
    };
    /**
     * Returns currentPage
     * 
     * @returns {Page} The currently displayed page
     * @memberof Books
     */
    function getCurrentPage() {
        return currentPage;
    };
    /**
     * Resets the currentPage to the default page
     * 
     * @memberof Books
     */
    function resetPage() {
        setCurrentPage(defaultPage);
    }

    /**
     * Given a session, find the details of the book/page and retrieve the page from the book.
     * 
     * @param {Session} Session to retrieve book details from
     * @memberof Books
     */
    function

    function getSessionBookPage(session) {
        if (session) {
            getBookPage(session.currentBook.book_id, session.currentBook.pageNum);
        } else {
            resetPage();
        }
    }


    return {
        getBookListObserver: getBookListObserver,
        getUpdatePageObserver: getUpdatePageObserver,
        setCurrentUserId: setCurrentUserId,
        getCurrentUserId: getCurrentUserId,
        retrieveBookList: retrieveBookList,
        setBookList: setBookList,
        getBookList: getBookList,
        getBookPage: getBookPage,
        updateDisplayedPage: updateDisplayedPage,
        setCurrentPage: setCurrentPage,
        getCurrentPage: getCurrentPage,
        resetPage: resetPage,
        getSessionBookPage: getSessionBookPage
    };
})();

/**
 * Handles all of the functionality related to an individual book
 * @constructor
 */
function Book(bookDetails) {
    /**
     * The title of the book
     * @member {String}
     */
    this.title = bookDetails.title;
    /**
     * The id of the book
     * @member {String}
     */
    this._id = bookDetails._id;

    /**
     * Retrieves the data of a given page of the book
     * 
     * @param {Integer} pageNum - The number of the page you want to retrieve
     * @param {Function} callback - The function to execute after the page is successfully retrieved
     */
    this.getPageData = function (pageNum, callback) {
        var self = this;
        $.post("http://localhost:9000/books/getpagefrombook", {
            bookId: this._id,
            pageNum: pageNum
        }).done(function (data) {
            if (data.success) {
                callback(data.result);
            } else {
                alert("An error has occured retrieving the page data. Please try again");
                console.log(data);
            }
        });
    }
}
/**
 * Handles all of the functionality related to an individual page
 * @constructor
 */
function Page(pageDetails) {
    /**
     * The number of the page - Starts from 0
     * @member {Integer}
     */
    this.pageNum = pageDetails.pageNum;
    /**
     * The source of the page image
     * @member {String}
     */
    this.src = null;

    //Page src can come in two formats
    //Name of local files or the image data
    if (pageDetails.src) {
        this.src = pageDetails.src;
    } else if (pageDetails.data.data) {
        this.src = "data:" + pageDetails.contentType + ";base64," + util_encode(pageDetails.data.data);
    }


}