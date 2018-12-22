const {
    Given,
    When,
    Then
} = require("cucumber");
var assert = require("assert");
var request = require("sync-request");

var samplePageNum = 0;

//Scenario: View all books
When("I ask to see the list of all books", function() {
    //Query the server to return all books
    var response = request("POST", "http://localhost:9001/books/getallbooks");
    var result = JSON.parse(response.getBody("utf8"));
    this.allBooksResult = result;
});

Then("I should be shown all of the books", function() {
    //Check that that the returned result contains the list of books
    assert.ok(this.allBooksResult, "The server should have sent back a response");
    assert.ok(!this.allBooksResult.err, "No error should be returned");
    assert.ok(this.allBooksResult.success, "Books should have been successfully retrieved");

    assert.ok(this.allBooksResult.result.length >= 1, "At least one book should have been retrieved");

    //Check that all of the expected keys exist - Don't worry about their values, we only care that they've been returned
    var firstBook = this.allBooksResult.result[0];
    assert.ok(firstBook._id, "The _id should be returned");
    assert.ok(firstBook.title, "The title should be returned");
    assert.ok(firstBook.pageCount, "The pageCount should be returned");
    assert.ok(firstBook.pages, "The pages should be returned");
});


//Scenario: Get a page from a book
Given("I know what book I want to see", function() {
    //Use the retrieved bookId as our book
    this.bookId = this.retrievedBookId;
});

Given("I know what page I want to see", function() {
    //Use the sample pageNum as our pageNum
    this.pageNum = samplePageNum;
});

Then("when I ask to see the page from a book", function() {
    //Query the server to the page from that book
    var response = request("POST", "http://localhost:9001/books/getpagefrombook", {
        json: {
            bookId: this.bookId,
            pageNum: this.pageNum
        }
    });
    var result = JSON.parse(response.getBody("utf8"));
    this.bookPageResult = result;
});

Then("I should be shown the page from that book", function() {
    //Check that that the returned result contains the data for the page
    assert.ok(this.bookPageResult, "The server should have sent back a response");
    assert.ok(!this.bookPageResult.err, "No error should be returned");
    assert.ok(this.bookPageResult.success, "Book page should have been successfully retrieved");

    var bookPage = this.bookPageResult.result;
    //Check that all of the expected keys exist - Don't worry about their values, we only care that they've been returned
    assert.ok(bookPage._id, "The _id should be returned");
    assert.ok(bookPage.title, "The title should be returned");
    assert.ok(bookPage.pageCount, "The pageCount should be returned");
    assert.ok(bookPage.pages, "The pages should be returned");

    assert.equal(bookPage.pages.length, 1, "1 page should have been retrieved (the page we asked for");
    var firstBookPage = bookPage.pages[0];
    assert.ok(firstBookPage.pageNum != null, "The pageNum of the page should be retrieved"); //Page num can be 0 so we need a more truthy check
    assert.ok(firstBookPage.contentType, "The contentType of the page should be retrieved");
    assert.ok(firstBookPage.data, "The data of the page should be retrieved");
    assert.ok(firstBookPage.data.data, "The data of the page data should be retrieved");
});