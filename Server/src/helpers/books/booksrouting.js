var express = require("express");
var multer = require("multer");
var upload = multer();

module.exports = function(app) {
    //Set up router for /books
    var booksRouter = express.Router();

    //Include bookdb access
    var booksdb = require("./booksdb.js");

    booksRouter.use(function(request, response, next) {
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");

        next();
    });

    //This is purley for populating the books database
    //This isn't intended to be used as part of regular functionality
    booksRouter.post("/addnewbook", upload.any(), function(request, response) {
        var title = request.body.title; //Title of the book being added
        //TODO: CHECK THAT THESE ARE JPGS/VALID IMAGES. CAN LOOK AT MIME TYPE
        var pages = request.files; //Array of images representing the pages of the book


        //Check all required values have been supplied
        if (!title) {
            response.send({
                success: false,
                message: "You must supply a title"
            });
        } else if (!pages) {
            response.send({
                success: false,
                message: "You must supply pages - A set of images representing the pages in a book"
            });
        } else {
            //Add a new book with provided information
            booksdb.addNewBook(title, pages, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in addNewBook: ${err}`);
                    response.send("An error has occured attempting to add a new book. Please try again.")
                } else {
                    //If successful then return result to caller
                    console.log(`Book: ${result._id} added`);
                    response.send(result);
                }
            });
        }
    });

    booksRouter.post("/getallbooks", function(request, response) {
        //Get all books
        booksdb.getAllBooks(function(err, result) {
            if (err) {
                //If an error has occured then write to console and inform caller of error
                console.log(`Error in getAllBooks: ${err}`);
                response.send({
                    success: false,
                    message: "An error has occured attempting to get all books. Please try again."
                });
            } else {
                //If successful then return result to caller
                response.send({
                    success: true,
                    result: result
                });
            }
        });
    });

    booksRouter.post("/getpagefrombook", function(request, response) {
        var bookId = request.body.bookId; //ID of the book containing the page
        var pageNum = request.body.pageNum; //Number of the page within the book

        //Check all required values have been supplied
        if (!bookId) {
            response.send({
                success: false,
                message: "You must supply a bookId"
            });
        } else if (pageNum == null) {
            response.send({
                success: false,
                message: "You must supply a pageNum"
            });
        } else {
            //Get page from book
            booksdb.getPageFromBook(bookId, pageNum, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in getPageFromBook: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to get the page from that book. Please try again."
                    });
                } else if (!result) {
                    //If database access successful, but no result found with the provided information then inform user
                    response.send({
                        success: false,
                        message: "No page with that number, or book with that id found."
                    });
                } else {
                    //If successful then return result to caller
                    response.send({
                        success: true,
                        result: result
                    });
                }
            });
        }
    });

    app.use("/books", booksRouter);

    return {
        booksdb: booksdb
    }
};