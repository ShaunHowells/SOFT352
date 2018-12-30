var request = require("request");
var fs = require("fs");

var books = [{
    title: "Sample Book 1",
    pages: [
        fs.createReadStream(__dirname + "/Sample Books/Book 1/page0.jpg"),
        fs.createReadStream(__dirname + "/Sample Books/Book 1/page1.jpg"),
        fs.createReadStream(__dirname + "/Sample Books/Book 1/page2.jpg"),
        fs.createReadStream(__dirname + "/Sample Books/Book 1/page3.jpg")
    ]
}, {
    title: "Sample Book 2",
    pages: [
        fs.createReadStream(__dirname + "/Sample Books/Book 2/page0.jpg"),
        fs.createReadStream(__dirname + "/Sample Books/Book 2/page1.jpg"),
        fs.createReadStream(__dirname + "/Sample Books/Book 2/page2.jpg")
    ]
}, {
    title: "Sample Book 3",
    pages: [
        fs.createReadStream(__dirname + "/Sample Books/Book 3/page0.jpg"),
        fs.createReadStream(__dirname + "/Sample Books/Book 3/page1.jpg"),
        fs.createReadStream(__dirname + "/Sample Books/Book 3/page2.jpg"),
        fs.createReadStream(__dirname + "/Sample Books/Book 3/page3.jpg"),
        fs.createReadStream(__dirname + "/Sample Books/Book 3/page4.jpg")
    ]
}];

for (var i = 0; i < books.length; i++) {
    request.post({
        url: "http://localhost:9001/books/addnewbook",
        formData: books[i]
    });
}