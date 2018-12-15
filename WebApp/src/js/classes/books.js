/**
 * @classdesc Handles all of the functionality relating to the handling of multiple 'Books'.
 * 
 * @class
 * @hideconstructor
 */
const Books = (function () { // eslint-disable-line no-unused-vars
    var currentUserId; //ID of the current user
    var bookList = []; //Stores the list of retrieved books
    const defaultBookPage = {
        _id: null,
        title: null,
        pageCount: null,
        currentPage: {
            src: "testimage.jpg",
            pageNum: 0
        }
    };

    var currentBookPage = new BookPage(defaultBookPage);

    var bookListObserver = new Observer();
    var updatePageBookObserver = new Observer();

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
     * Returns updatePageBookObserver
     * 
     * @memberof Books
     * @return {Observer} Observer for updating the current page and book
     */
    function getUpdatePageBookObserver() {
        return updatePageBookObserver;
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
     * Returns the currentBookPage
     * 
     * @returns {BookPage} Current book page
     */
    function getCurrentBookPage() {
        return currentBookPage;
    }

    /**
     * Sets the current book/page, then notifies the updatePageBookObserver
     * 
     * @param {Object} data - Data of the book + page
     */
    function setCurrentBookPage(data) {
        if (data && Object.keys(data).length) {
            currentBookPage = new BookPage({
                _id: data._id,
                title: data.title,
                pageCount: data.pageCount,
                currentPage: data.currentPage
            });
            updatePageBookObserver.notify(currentBookPage);
        } else {
            resetCurrentBookPage();
        }
    };

    /**
     * Retrieves a new page from the current book
     * 
     * @param {Integer} pageNum - Number of the page (starts from 0)
     * @memberof Books
     */
    function retrieveNewPageFromBook(bookId, pageNum, callback) {
        if (bookId != null && pageNum != null) {
            for (var book in bookList) {
                if (bookList[book]._id == bookId) {
                    bookList[book].getPageData(pageNum, function (data) {
                        callback(data);
                    });
                }
            }
        }
    };

    /**
     * Resets the currentBookPage to the defaultBookPagePage
     * 
     * @memberof Books
     */
    function resetCurrentBookPage() {
        setCurrentBookPage(defaultBookPage);
    }

    function setCurrentBookPageFromServer(pageNum) {
        retrieveNewPageFromBook(currentBookPage._id, pageNum, function (data) {
            var bookDetails = {
                _id: currentBookPage._id,
                title: currentBookPage.title,
                pageCount: data.pageCount,
                currentPage: {
                    contentType: data.pages[0].contentType,
                    imageData: data.pages[0].data.data,
                    pageNum: data.pages[0].pageNum
                }
            };
            setCurrentBookPage(bookDetails);
        });
    }

    /**
     * Given a session, find the details of the book/page and retrieve the page from the book.
     * 
     * @param {Session} Session to retrieve book details from
     * @memberof Books
     */
    function getSessionBookPage(session) {
        if (session) {
            retrieveNewPageFromBook(session.currentBook._id, session.currentPageNum, function (data) {
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
        getBookListObserver: getBookListObserver,
        getUpdatePageBookObserver: getUpdatePageBookObserver,
        setCurrentUserId: setCurrentUserId,
        getCurrentUserId: getCurrentUserId,
        retrieveBookList: retrieveBookList,
        setBookList: setBookList,
        getBookList: getBookList,
        getCurrentBookPage: getCurrentBookPage,
        setCurrentBookPage: setCurrentBookPage,
        retrieveNewPageFromBook: retrieveNewPageFromBook,
        resetCurrentBookPage: resetCurrentBookPage,
        getSessionBookPage: getSessionBookPage,
        setCurrentBookPageFromServer: setCurrentBookPageFromServer
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
     * @member {String}
     */
    this.title = bookDetails.title;
    /**
     * The id of the book
     * 
     * @member {String}
     */
    this._id = bookDetails._id;

    /**
     * The number of pages in the book
     */
    this.pageCount = bookDetails.pageCount

    /**
     * Retrieves the data of a given page of the book
     * 
     * @param {Integer} pageNum - The number of the page you want to retrieve
     * @param {Function} callback - The function to execute after the page is successfully retrieved
     */
    this.getPageData = function (pageNum, callback) {
        if (pageNum >= 0 || pageNum < this.pageCount) {
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
        } else {
            console.error("This books does not have page number " + pageNum);
        }
    }
}

function BookPage(bookPageDetails) {
    this._id = bookPageDetails._id;

    this.title = bookPageDetails.title;

    this.pageCount = bookPageDetails.pageCount;

    this.currentPage = new Page(bookPageDetails.currentPage);
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
    } else if (pageDetails.imageData) {
        this.src = "data:" + pageDetails.contentType + ";base64," + util_encode(pageDetails.imageData);
    }
}