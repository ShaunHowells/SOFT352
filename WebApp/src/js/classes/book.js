function Books() {
    this.bookList = [];
    this.bookListCallback = null;

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
    }

    this.setBookList = function (books) {
        this.bookList = books;
        this.callBookListCallback();
    }
    this.getBookList = function () {
        return this.bookList;
    }
    //Set bookListCallback - Used to update angular model for displaying books
    this.setBookListCallback = function (callback) {
        this.bookListCallback = callback;
        this.callBookListCallback();
    };
    //Calls the availableSessionsCallback
    //Moved to a function to remove the number of times I have to check if it exists before calling it
    this.callBookListCallback = function () {
        if (this.bookListCallback) {
            this.bookListCallback(this.bookList);
        }
    }
}