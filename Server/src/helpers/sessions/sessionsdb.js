    //Set up database connections
    var mongoose = require("mongoose");
    mongoose.connect("mongodb://localhost/collaborativereader", {
        useNewUrlParser: true
    });

    //Variable to store webSockets
    var webSockets;
    //Access to booksdb to query book details
    var booksdb

    //Create model for session
    var Sessions = mongoose.model("Sessions", {
        name: String,
        owner: String,
        currentBook: {
            book_id: String,
            title: String,
            pageNum: Number
        },
        users: [{
            user_id: String
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
                    user_id: userId
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
        booksdb.getBookById(bookId, function (err, result) {
            if (err) {
                console.log(`An error has occured while retrieving the details for Book ${bookId}`);
                callback(err, result);
            } else {
                var bookTitle = result.title;
                var newSession = new Sessions({
                    name: sessionName,
                    owner: userId,
                    currentBook: {
                        book_id: bookId,
                        title: bookTitle,
                        pageNum: 0
                    },
                    users: [{
                        user_id: userId
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
            "users.user_id": userId
        }).exec(callback);
    };

    /**
     * Removes the specified user from the specified Session in MongoDB
     *
     * @param {String} sessionId - The id of the session that the user wants to leave
     * @param {String} userId - The id of the user that wants to leave the session
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function removeUserFromSession(sessionId, userId, callback) {
        var foundSession = Sessions.findOne({
            "_id": sessionId
        }).exec(function (err, result) {
            if (err) {
                callback(err, result);
            } else if (!result) {
                //If not result return
                callback(err, result);
            } else {
                //If we have more than 1 user, then remove the user
                //Otherwise delete the session (which will remove them and end the session)
                if (result.users.length > 1) {
                    Sessions.findOneAndUpdate({
                        _id: sessionId
                    }, {
                        $pull: {
                            users: {
                                user_id: userId
                            }
                        }
                    }, callback);

                } else {
                    result.remove(callback);
                    if (webSockets) {
                        webSockets.notifyAllConnectedUsers({
                            type: "sessionremoved",
                            success: true,
                            result: {
                                sessionId: sessionId
                            }
                        });
                    }
                }
            }
        });
    };


    /**
     * Remove a given user all sessions
     *
     * @param {String} userId - The id of the user to remove from all sessons
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function removeUserFromAllSessions(userId) {
        Sessions.find({
            "users.user_id": userId
        }).exec(function (err, sessions) {
            sessions.forEach(function (session) {
                if (session.users.length > 1) {
                    Sessions.findOneAndUpdate(session._id, {
                        $pull: {
                            users: {
                                user_id: userId
                            }
                        }
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`User ${userId} has been removed from Session ${result._id}`);
                        }
                    });
                } else {
                    var sessionId = session._id;
                    session.remove();
                    if (webSockets) {
                        webSockets.notifyAllConnectedUsers({
                            type: "sessionremoved",
                            success: true,
                            result: {
                                sessionId: sessionId
                            }
                        });
                    }
                }
            });
        });


    };

    /**
     * Set webSockets variable so that sessions can update websocket connections
     *
     * @param {object} newWebSockets - The value to set webSockets to
     */
    function setWebSockets(newWebSockets) {
        webSockets = newWebSockets;
    }
    /**
     * Set booksdb variable so that sessions can query book details
     *
     * @param {object} newBooksDb - The value to set booksdb to
     */
    function setBooksDb(newBooksDb) {
        booksdb = newBooksDb;
    }
    module.exports = {
        getAllSessions: getAllSessions,
        getSessionById: getSessionById,
        joinSession: joinSession,
        createSession: createSession,
        removeUserFromSession: removeUserFromSession,
        removeUserFromAllSessions: removeUserFromAllSessions,
        setWebSockets: setWebSockets,
        setBooksDb: setBooksDb
    };