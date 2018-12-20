module.exports = function(testMode) {
    var mongoose = require("mongoose");
    if (testMode) {
        mongoose.connect("mongodb://localhost/collaborativereadertest", {
            useNewUrlParser: true,
            useFindAndModify: false
        });
    } else {
        mongoose.connect("mongodb://localhost/collaborativereader", {
            useNewUrlParser: true,
            useFindAndModify: false
        });
    }

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
        currentBook: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Books"
        },
        users: [{
            user_id: String,
            username: String
        }],
        notes: [{
            user: String,
            note: String,
            pageNum: Number
        }]
    });

    return {
        mongoose: mongoose,
        models: {
            Books: Books,
            Sessions: Sessions
        }
    };
};