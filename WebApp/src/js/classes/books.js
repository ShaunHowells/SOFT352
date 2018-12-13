/**
 * Books - Handles all of the functionality relating to the handling of multiple 'Books'
 */
const Books = (function () { // eslint-disable-line no-unused-vars

    var bookList = []; //Stores the list of retrieved books
    var bookListCallback = null; //The callback to be executed when the list of books is udpated

    var updatePageCallback = null; //The callback to be executed when a new page needs to be loaded
    const defaultPage = { //The default page to be displayed when not in a session
        src: "testimage.jpg",
        pageNum: 0
    };
    var currentPage = new Page(defaultPage); //The current page being displayed - Default value is set to default page

    /**
     * retrieveBookList - Sends a request to the server to retrieve the list of all books
     * NOTE: This retrieves basic information about each book to avoid the amount
     * of bandwidth required to transfer all of the images stored in each 'Book'
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
     * setBookList - Sends a request to the server to retrieve the list of all books
     * NOTE: This retrieves basic information about each book to avoid the amount
     * of bandwidth required to transfer all of the images stored in each 'Book'
     * 
     * @param {Object[]} books - An array of objects containing the basic information about a set of books 
     */
    function setBookList(books) {
        bookList = [];

        for (var book in books) {
            bookList.push(new Book(books[book]));
        }
        callBookListCallback();
    };

    /**
     * getBookList - Returns the bookList
     * 
     * @returns {Book[]}
     */
    function getBookList() {
        return bookList;
    };

    /**
     * setBookListCallback - Sets bookListCallback - After setting bookListCallback the callback is called
     * 
     * @param {Function} callback - The callback to set bookListCallback to
     */
    function setBookListCallback(callback) {
        bookListCallback = callback;
        callBookListCallback();
    };

    /**
     * callBookListCallback - Checks that bookListCallback is set then calls it
     */
    function callBookListCallback() {
        if (bookListCallback) {
            bookListCallback(bookList);
        }
    };

    /**
     * getBookPage - Gets the page data for a page in a book
     * @param {String} bookId - ID of the book containing the page
     * @param {Integer} pageNum - Number of the page (starts from 0)
     */
    function getBookPage(bookId, pageNum) {
        if (bookId && pageNum != null) {
            var self = this;
            for (var book in bookList) {
                if (bookList[book]._id == bookId) {
                    bookList[book].getPageData(pageNum, function (data) {
                        self.updateDisplayedPage(data);
                    });
                    break;
                }
            }
        }
    };
    /**
     * updateDisplayedPage - Checks that the page data is correct, then calls the setPageCallback
     * @param {Object} data - Data of the book + page
     */
    function updateDisplayedPage(data) {
        if (data.pages && data.pages.length == 1) {
            currentPage = new Page(data.pages[0]);

            callUpdatePageCallback();
        } else {
            console.error("Page data is not in the expected format");
        }
    };
    /**
     * setUpdatePageCallback - Sets updatePageCallback. After setting updatePageCallback the callback is called
     * @param {Function} callback - The callback to set updatePageCallback to
     */
    function setUpdatePageCallback(callback) {
        updatePageCallback = callback;
        callUpdatePageCallback();
    };
    /**
     * callUpdatePageCallback -  Checks that updatePageCallback is set then calls it
     */
    function callUpdatePageCallback() {
        if (updatePageCallback) {
            updatePageCallback(currentPage);
        }
    };
    /**
     * setCurrentPage - Sets currentPage. Used when the page needs to be set to a local image (using a filename rather than a buffer)
     * @param {Object} newPage - Details of the page to set as the current page
     */
    function setCurrentPage(newPage) {
        currentPage = new Page(newPage);

        callUpdatePageCallback();
    };
    /**
     * getCurrentPage - Returns currentPage
     * @returns {Page}
     */
    function getCurrentPage() {
        return currentPage;
    };
    /*
     * resetPage - Resets the currentPage to the default page
     */
    function resetPage() {
        setCurrentPage(defaultPage);
    }

    return {
        retrieveBookList: retrieveBookList,
        setBookList: setBookList,
        getBookList: getBookList,
        setBookListCallback: setBookListCallback,
        callBookListCallback: callBookListCallback,
        getBookPage: getBookPage,
        updateDisplayedPage: updateDisplayedPage,
        setUpdatePageCallback,
        setUpdatePageCallback,
        callUpdatePageCallback: callUpdatePageCallback,
        setCurrentPage: setCurrentPage,
        getCurrentPage: getCurrentPage,
        resetPage: resetPage
    };
})();

/**
 * Book - Handles all of the functionality related to an individual book
 * @constructor
 */
function Book(bookDetails) {
    this.title = bookDetails.title; //Title of the book
    this._id = bookDetails._id; //_id of the book

    /**
     * getPageData - Retrieves the data of a given page of the book
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
 * Page - Handles all of the functionality related to an individual page
 * @constructor
 */
function Page(pageDetails) {
    //Page src can come in two formats
    //Name of local files or the image data
    if(pageDetails.src){
        this.src = pageDetails.src;
    } else if(pageDetails.data.data){
        this.src = "data:" + pageDetails.contentType + ";base64," + util_encode(pageDetails.data.data);
    }

    this.pageNum = pageDetails.pageNum; //Number of the page
}