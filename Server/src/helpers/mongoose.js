/**
 * Mongoose Connection and Model creation
 * @module helpers/Mongoose
 */


module.exports = function(testMode) {
    /**
     * Mongoose connection object.
     * The connection is made either mongodb://localhost/collaborativereader or mongodb://localhost/collaborativereadertest.
     * This is dependant on whether the server was starting in test mode or not.
     */
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

    /**
     * The model representing Books stored in MongoDB.
     *
     * @property {String} title The title of the book
     * @property {Number} pageCount The number of pages in the book
     * @property {Object[]} pages The set of pages making up the contents of the book
     * @property {Number} pages.pageNum The number of this page in the book (starts at 0)
     * @property {String} pages.contentType The MIME type of the image making up the page
     * @property {Buffer} pages.data The image data for this book page
     */
    var Books = mongoose.model("Books", {
        title: String,
        pageCount: Number,
        pages: [{
            pageNum: Number,
            contentType: String,
            data: Buffer
        }]
    });

    /**
     * The model representing Sessions stored in MongoDB.
     *
     * @property {String} name The name of the session
     * @property {String} owner The name of the user who originally created the session
     * @property {Number} currentPageNum The current page of the book being read in the session
     * @property {Object} currentBook The book currently being read in the session
     * @property {Object[]} users The list of users currently in this session
     * @property {String} users.user_id The unique id of the user generated when the WebSocket connection is generated
     * @property {String} users.username The display name of the user
     * @property {Object[]} notes The list of notes for this session
     * @property {String} notes.user The name of the user who created the note
     * @property {String} notes.note The contents of the note
     * @property {Number} notes.pageNum The page number this note related to (starts at 0)
     */
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