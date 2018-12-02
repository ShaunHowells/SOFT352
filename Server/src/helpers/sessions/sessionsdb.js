    //Set up database connections
    var mongoose = require("mongoose");
    mongoose.connect("mongodb://localhost/collaborativereader", {
        useNewUrlParser: true
    });

    //Variable to store webSockets
    var webSockets;

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
    function getAllSessions(callback) {
        Sessions.find().exec(callback);
    };

    /**
     * Returns the session with a given id.
     *
     * @param {string} sessionId - The id of the session you want to retrieve.
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function getSessionById(sessionId, callback) {
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
    function joinSession(sessionId, userId, callback) {
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
    function createSession(sessionName, userId, bookId, callback) {
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

        newSession.save(function (err, result) {
            callback(err, result);

            //Only notify users if new session creation was successful
            if (!err && webSockets) {
                webSockets.notifyAllConnectedUsers({
                    type: "newsessioncreated",
                    success: true,
                    result: result
                });
            }
        });
    }


    /**
     * Gets all of the Sessions from MongoDB for a given user
     *
     * @param {String} userId - The id of the user to retrieve all sessions of
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function getUserSessions(userId, callback) {
        Sessions.find({
            "users.userId": userId
        }).exec(callback);
    };


    function setWebSockets(test) {
        webSockets = test;
    }
    module.exports = {
        getAllSessions: getAllSessions,
        getSessionById: getSessionById,
        joinSession: joinSession,
        createSession: createSession,
        setWebSockets: setWebSockets
    };