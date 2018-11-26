//Set up database connections
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/collaborativereader", {
    useNewUrlParser: true
});

//Create model for session
var Sessions = mongoose.model("Sessions", {
    name: String,
    owner: String,
    currentBook: {
        bookDetails: {
            bookId: Number,
            bookName: String
        },
        pageNum: Number,
        notes: [{
            pageNum: Number,
            note: String
        }]
    },
    users: [{
        userId: String
    }]
});

/**
 * Callback used when accessing Sessions from MongoDB
 * 
 * @callback sessionsCallback
 * @param {object} err - The error returned from MongoDB access
 * @param {object} result - The result returned from MongoDB access
 */

 /**
 * Gets all of the Sessions from MongoDB
 *
 * @param {sessionsCallback} callback - A callback to run after database access.
 */
var getAllSessions = function (callback) {
    Sessions.find().exec(callback);
};
 /**
 * Returns the session with a given id.
 *
 * @param {string} sessionId - The id of the session you want to retrieve.
 * @param {sessionsCallback} callback - A callback to run after database access.
 */
var getSessionById = function (sessionId, callback) {
    Sessions.findOne({
        _id: sessionId
    }).exec(callback);
};

 /**
 * Join a session
 *
 * @param {string} sessionId - The id of the session to be joined
 * @param {string} userId - The id of the user that is attempting to join the session
 * @param {sessionsCallback} callback - A callback to run after database access.
 */
var joinSession = function (sessionId, userId, callback) {
    Sessions.findOneAndUpdate({
        _id: sessionId
    }, {
        "$push": {
            "users": {
                userId: userId
            }
        }
    }, callback);
};

 /**
 * Creates a new session
 *
 * @param {string} sessionName - The user input name of the new session
 * @param {string} userId - The id of the user that is attempting to create the session. Will be set as the owner of the session
 * @param {string} bookId - The id of the book being to be viewed in the session.
 * @param {sessionsCallback} callback - A callback to run after database access.
 */
var createSession = function (sessionName, userId, bookId, callback) {
    var newSession = new Sessions({
        name: sessionName,
        owner: userId,
        currentBook: {
            bookDetails: {
                bookId: bookId,
                bookName: bookId
            },
            pageNum: 0,
            notes: []
        },
        users: [{
            userId: userId
        }]
    });

    newSession.save(callback);
}


module.exports = {
    getAllSessions: getAllSessions,
    getSessionById: getSessionById,
    joinSession: joinSession,
    createSession: createSession
};