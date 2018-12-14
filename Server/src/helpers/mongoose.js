var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/collaborativereader", {
    useNewUrlParser: true,
    useFindAndModify: false
});

//Create model for books
var Books = mongoose.model("Books", {
    title: String,
    pageCount: Number,
    pages: [{
        pageNum: Number,
        contentType: String,
        data: Buffer
    }]
});

//Create model for session
var Sessions = mongoose.model("Sessions", {
    name: String,
    owner: String,
    currentPageNum: Number,
    currentBook: {type: mongoose.Schema.Types.ObjectId,  ref: "Books"},
    users: [{
        user_id: String
    }]
});

module.exports = {
    mongoose: mongoose,
    models: {
        Books: Books,
        Sessions: Sessions
    }
}