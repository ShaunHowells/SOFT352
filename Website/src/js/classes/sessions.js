/**
 * @classdesc Handles all of the functionality relating to the handling of 'Sessions'.
 * 
 * @class
 * @hideconstructor
 */
const Sessions = (function() { // eslint-disable-line no-unused-vars

    var currentUserId = null; //ID of the current user
    var availableSessions = []; //List of available sessions
    var currentUserSession = null; //The current session - Defaults to no session

    //Create Observers for various events caused by Sessions
    var availableSessionsObserver = new Observer();
    var currentUserSessionObserver = new Observer();

    /**
     * Returns availableSessionsObserver
     * 
     * @return {Observer} - Observer for the available session list
     * @memberof Sessions
     */
    function getAvailableSessionsObserver() {
        return availableSessionsObserver;
    }
    /**
     * Returns currentUserSessionObserver
     * 
     * @return {Observer} - Observer for the current user session
     * @memberof Sessions
     */
    function getCurrentUserSessionObserver() {
        return currentUserSessionObserver;
    }

    /**
     * Sets the current user id - Value may only be set once
     * 
     * @param {string} newUserId - ID to set currentUserID as
     * @memberof Sessions
     */
    function setCurrentUserId(newUserId) {
        if (!currentUserId) {
            currentUserId = newUserId;
        } else {
            console.error("Current User ID may only be set once");
        }
    }
    /**
     * Returns currentUserId
     * 
     * @return {string} ID of the current user
     * @memberof Sessions
     */
    function getCurrentUserId() {
        return currentUserId;
    }

    /**
     * Return availableSessions
     * 
     * @returns {Session[]} List of available sessions
     * @memberof Sessions
     */
    function getAvailableSessions() {
        return availableSessions;
    }
    /**
     * Set availableSessions, then notify availableSessionsObserver
     * 
     * @param {object[]} sessions - List of sessions
     * @memberof Sessions
     */
    function setAvailableSessions(sessions) {
        availableSessions = [];
        for (var session in sessions) {
            availableSessions.push(new Session(sessions[session]));
        }

        availableSessionsObserver.notify(filterAvailableSessions());
    }
    /**
     * Add new session to availableSessions, then notify availableSessionsObserver
     * 
     * @param {object} newSession - Session to add to availableSession
     * @memberof Sessions
     */
    function pushAvailableSession(newSession) {
        availableSessions.push(new Session(newSession));
        availableSessionsObserver.notify(filterAvailableSessions());
    }
    /**
     * Given a session id, remove the session with that id from availableSessions, then notify availableSessionsObserver
     * 
     * @param {string} sessionId - ID of the session to be removed
     * @memberof Sessions
     */
    function removeAvailableSession(sessionId) {
        if (sessionId) {
            availableSessions = availableSessions.filter(function(value, index, arr) {
                return arr[index]._id !== sessionId;
            });
            availableSessionsObserver.notify(filterAvailableSessions());
        }
    }

    /**
     * Filter availableSessions so that the currentUserSession isn't displayed as we don't want to display our current session as an available session
     * 
     * @return {Session[]} - The list of available sessions where the current user session has been filtered out
     * @memberof Sessions
     */
    function filterAvailableSessions() {
        //If currentUserSession exists then filter it out, otherwise return available sessions
        if (currentUserSession) {
            var userSession = currentUserSession;
            var filteredList = availableSessions.filter(function(value) {
                if (userSession._id == value._id)
                    return false;
                return true;
            });
            return filteredList;
        } else {
            return availableSessions;
        }
    }
    /**
     * Return currentUserSession
     * 
     * @returns {Session} - The current user session
     * @memberof Sessions
     */
    function getCurrentUserSession() {
        return currentUserSession;
    }
    /**
     * Set currentUserSession - Notfy currentUserSessionObserver and then notify availableSessionObserver
     *  
     * @param {object} session - Session to set to currentUserSession
     * @memberof Sessions
     */
    function setCurrentUserSession(session) {
        if (session) {
            currentUserSession = new Session(session);
        } else {
            currentUserSession = null;
        }
        currentUserSessionObserver.notify(currentUserSession);
        availableSessionsObserver.notify(filterAvailableSessions());
    }
    /**
     * Clears currentUserSession then notifies relevant observers
     * Current User Session display will be cleared, and the availableSessionList will be uploaded to display all availableSessions (as previously the currentUserSession would be filtered out)
     * 
     * @memberof Sessions
     */
    function removeCurrentUserSession() {
        currentUserSession = null;
        availableSessionsObserver.notify(filterAvailableSessions());
        currentUserSessionObserver.notify(currentUserSession);
    }

    /**
     * Creates a new user session, sets the currentUserSession to the newly created session, then gets the first page of the selected book to display
     * 
     * @param {string} sessionName - Name of the session to be created
     * @param {string} bookId - The id of the book to be loaded into the session
     * @param {string} username - The name of the user creating the session
     * @param {callback} callback - The callback to be executed after the session is created
     * @memberof Sessions
     */
    function createNewSession(sessionName, bookId, username, callback) {
        if (currentUserId) {
            var self = this;
            $.post("http://localhost:9000/sessions/createsession", {
                sessionName: sessionName,
                bookId: bookId,
                user: {
                    userId: currentUserId,
                    username: username
                }
            }).done(function(data) {
                if (data.success) {
                    self.setCurrentUserSession(data.result);
                    callback(data);
                } else {
                    alert("An error has occured when creating a new session. Please try again");
                    console.log(data);
                }
            });
        }
    }
    /**
     * Joins a session, then retrieves the page the session is currently reading
     * 
     * @param {string} sessionId - ID of the session to join
     * @param {string} username - Name of the user joining the session
     * @param {callback} callback - The callback to be executed after the session is joined
     * @memberof Sessions
     */
    function joinSession(sessionId, username, callback) {
        if (currentUserId && username) {
            for (var session in availableSessions) {
                if (availableSessions[session]._id == sessionId) {
                    var self = this;
                    availableSessions[session].joinSession(currentUserId, username, function(data) {
                        self.setCurrentUserSession(data.result);
                        callback(data.result);
                    });
                    break;
                }
            }
        }
    }
    /**
     * Leaves the currentUserSession
     * 
     * @param {callback} callback - The callback to be executed after the session is left
     * @memberof Sessions
     */
    function leaveCurrentSession(callback) {
        if (currentUserId && currentUserSession) {
            var self = this;
            currentUserSession.leaveSession(currentUserId, function(data) {
                self.removeCurrentUserSession();
                callback(data);
            });
        } else {
            console.error("No session to leave");
        }
    }

    /**
     * Updates the page number in current the session
     * 
     * @param {number} pageNum - The number of the page to set in the session
     * @memberof Sessions
     */
    function updateCurrentSessionBookPage(pageNum) {
        if (currentUserId && currentUserSession) {
            currentUserSession.updateBookPage(pageNum, currentUserId);
        } else {
            console.error("You aren't in a session. Please try again when you're in a session");
        }
    }

    return {
        setCurrentUserId,
        getCurrentUserId,
        getAvailableSessionsObserver,
        getCurrentUserSessionObserver,
        getAvailableSessions,
        setAvailableSessions,
        pushAvailableSession,
        removeAvailableSession,
        getCurrentUserSession,
        setCurrentUserSession,
        removeCurrentUserSession,
        createNewSession,
        joinSession,
        leaveCurrentSession,
        updateCurrentSessionBookPage
    };
})();

/**
 * Session - Handles all of the functionality related to an individual session
 * @constructor
 */
function Session(sessionDetails) {
    /**
     * The ID of the session
     * @member {string}
     */
    this._id = sessionDetails._id;
    /**
     * The name of the session
     * @member {string}
     */
    this.name = sessionDetails.name;
    /**
     * The user who originally created the session
     * @member {string}
     */
    this.owner = sessionDetails.owner;
    /**
     * The current page of the book being read
     * @member {string}
     */
    this.currentPageNum = sessionDetails.currentPageNum;
    /**
     * The details of the current book being read
     * @member {string}
     */
    this.currentBook = sessionDetails.currentBook;

    this.test = sessionDetails.test ? sessionDetails.test : false; // Used to identify sessions used for unit tests

    /**
     * Joins the supplied user to the session
     * 
     * @param {string} userId - ID of the user to joining the session
     * @param {string} username - Name of the user joining the session
     * @param {callback} callback - The callback to be executed when the session is joined
     */
    this.joinSession = function(userId, username, callback) {
        $.post("http://localhost:9000/sessions/joinsession", {
            sessionId: this._id,
            user: {
                userId: userId,
                username: username
            }
        }).done(function(data) {
            if (data.success) {
                if (callback)
                    callback(data);
            } else {
                alert("An error has occured when joining a session. Please try again");
                console.log(data);
            }
        });
    };

    /**
     * Leaves the current session
     * 
     * @param {string} userId - ID of the user to leaving the session
     * @param {callback} callback - The callback to be executed when the session is left
     */
    this.leaveSession = function(userId, callback) {
        $.post("http://localhost:9000/sessions/leavesession", {
            sessionId: this._id,
            userId: userId
        }).done(function(data) {
            if (data.success) {
                if (callback)
                    callback(data.result);
            } else {
                alert("An error has occured when leaving a session. Please try again");
                console.log(data);
            }
        });
    };

    /**
     * Updates the page number in current the session
     * 
     * @param {number} pageNum - The number of the page to set in the session
     * @param {string} userId - The ID of the user updating the bookPage
     * @param {callback} callback - The function to be executed after the bookPage is updated
     * @memberof Sessions
     */
    this.updateBookPage = function(pageNum, userId, callback) {
        $.post("http://localhost:9000/sessions/updatecurrentpage", {
            sessionId: this._id,
            pageNum: pageNum,
            userId: userId
        }, function(data) {
            if (data.success) {
                if (callback)
                    callback(data);
            } else {
                console.error("An error has occured trying to update the current session page");
            }
        });
    };
}