/**
 * Routing for Books. All requests routed through BooksRouting take the form /books/*
 * @module BooksRouting
 */

var express = require("express");
var multer = require("multer");
var upload = multer();

module.exports = function(app) {

    //Set up router for /books/
    const booksRouter = express.Router();

    //Include bookdb access
    var booksdb = require("./booksdb.js");

    booksRouter.use(function(request, response, next) {
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");

        next();
    });

    //Book pages should only be JPGs
    function isPageContentJpg(pages) {
        for (var page in pages) {
            if (pages[page].mimetype !== "image/jpeg") {
                return false;
            }
        }
        return true;
    }
    /**
     * Route for adding a new book. This function is used purely as a means of populating the database.
     * This functionality isn't present in the rest of the application.
     * Any uploaded images should be in the JPG format.
     * 
     * @name POST/books/addnewbook
     * @function
     * @param {string} title - The title of the book being created
     * @param {file[]} pages - An array of files containing the JPGs used as page images
     */
    booksRouter.post("/addnewbook", upload.any(), function(request, response) {
        var title = request.body.title; //Title of the book being added
        var pages = request.files; //Array of images representing the pages of the book

        //Check all required values have been supplied
        if (!title) {
            response.send({
                success: false,
                message: "You must supply a title"
            });
        } else if (!pages || !pages.length) {
            response.send({
                success: false,
                message: "You must supply pages - A set of JPGs representing the pages in a book"
            });
        } else if (!isPageContentJpg(pages)) {
            response.send({
                success: false,
                message: "Your list of pages must use the JPG format"
            });
        } else {
            //Add a new book with provided information
            booksdb.addNewBook(title, pages, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in addNewBook: ${err}`);
                    response.send("An error has occured attempting to add a new book. Please try again.");
                } else {
                    //If successful then return result to caller
                    console.log(`Book: ${result._id} added`);
                    response.send(result);
                }
            });
        }
    });
    /**
     * Route for retrieving the list of all books.
     * Any uploaded images should be in the JPG format.
     * 
     * @name POST/books/getallbooks
     * @function
     */
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
    /**
     * Route for retrieving the data for a specific page from a book
     * 
     * @name POST/books/getpagefrombook
     * @function
     * @param {string} bookId - The ID of the book you want to retrieve the page from
     * @param {number} pageNum - The number of the page you want to retrieve. Starts at 0.
     */
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
    };
};