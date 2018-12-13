/**
 * Sessions - Handles all of the functionality relating to the handling of 'Sessions'
 */
const Sessions = (function () { // eslint-disable-line no-unused-vars

    var currentUserId = null; //ID of the current user
    var availableSessions = []; //List of available sessions
    var availableSessionsCallback = null; //The callback to be executed when availableSessions is updated
    var currentUserSession = null; //The current session - Defaults to no session
    var currentUserSessionCallback = null; //The callback to be executed when the currentUserSession is updated

    /**
     * getAvailableSessions - Return availableSessions
     * @returns {Session[]}
     */
    function getAvailableSessions() {
        return availableSessions;
    };
    /**
     * setAvailableSessions - Set availableSessions, then call availableSessionCallback
     * @param {Object[]} sessions - List of sessions
     */
    function setAvailableSessions(sessions) {
        availableSessions = [];
        for (var session in sessions) {
            availableSessions.push(new Session(sessions[session]));
        }

        callAvailableSessionsCallback();
    };
    /**
     * pushAvailableSession - Add new session to availableSessions, then call availableSessionCallback
     * @param {Object} newSession - Session to add to availableSession
     */
    function pushAvailableSession(newSession) {
        availableSessions.push(new Session(newSession));
        callAvailableSessionsCallback();
    };
    /**
     * removeAvailableSession - Given a session id, remove the session with that id from availableSessions, then call availableSessionCallback
     * @param {String} sessionId - Id of the session to be removed
     */
    function removeAvailableSession(sessionId) {
        if (sessionId) {
            availableSessions = availableSessions.filter(function (value, index, arr) {
                return arr[index]._id !== sessionId;
            });
            callAvailableSessionsCallback();
        }
    };
    /**
     * setAvailableSessionsCallback - Set availableSessionsCallback, then call availableSessionCallback
     * @param {Function} callback - Callback to set availableSessionsCallback as
     */
    function setAvailableSessionsCallback(callback) {
        availableSessionsCallback = callback;
        callAvailableSessionsCallback();
    };
    /**
     * callAvailableSessionsCallback - Check that availableSessionsCallback exists then calls it 
     */
    function callAvailableSessionsCallback() {
        if (availableSessionsCallback) {
            availableSessionsCallback(filterAvailableSessions());
        }
    };

    /**
     * filterAvailableSessions - Filter availableSessions so that the currentUserSession isn't displayed as we don't want to display our current session as an available session#
     * @return {Session[]}
     */
    function filterAvailableSessions() {
        //If currentUserSession exists then filter it out, otherwise return available sessions
        if (currentUserSession) {
            var userSession = currentUserSession;
            var filteredList = availableSessions.filter(function (value) {
                if (userSession._id == value._id)
                    return false;
                return true;
            });
            return filteredList;
        } else {
            return availableSessions;
        }
    };
    /**
     * getCurrentUserSession - Return currentUserSession
     * @returns {Session}
     */
    function getCurrentUserSession() {
        return currentUserSession;
    };
    /**
     * setCurrentUserSession - Set currentUserSession, then call currentUserSessionCallback and availableSessionCallback
     * availableSessionCallback is called so that filterAvailableSessions can remove the new user session from the list of available sessions
     * @param {Object} session - Session to set currentUserSession as
     */
    function setCurrentUserSession(session) {
        if (session) {
            currentUserSession = new Session(session);
        } else {
            currentUserSession = null;
        }
        callCurrentUserSessionCallback();
        callAvailableSessionsCallback();
    };
    /**
     * removeCurrentUserSession - Clears currentUserSession then called both availableSessionCallback and currentUserSessionCallback
     * Current User Session display will be cleared, and the availableSessionList will be uploaded to display all availableSessions (as previously the currentUserSession would be filtered out)
     */
    function removeCurrentUserSession() {
        currentUserSession = null;
        callAvailableSessionsCallback();
        callCurrentUserSessionCallback();

        //Reset page to default page
        CollabBookReader.getBooks().resetPage();
    };
    /**
     * setCurrentUserSessionCallback - Sets currentUserSessionCallback then calls currentUserSessionCallback
     * @param {Function} callback - Callback to set currentUserSessionCallback as
     */
    function setCurrentUserSessionCallback(callback) {
        currentUserSessionCallback = callback;
        callCurrentUserSessionCallback();
    };
    /**
     * callCurrentUserSessionCallback - Check that currentUserSessionCallback exists then calls it 
     */
    function callCurrentUserSessionCallback() {
        if (currentUserSessionCallback) {
            currentUserSessionCallback(currentUserSession);
        }
    };
    /**
     * createNewSession - Creates a new user session, sets the currentUserSession to the newly created session, then gets the first page of the selected book to display
     * @param {String} sessionName - Name of the session to be created
     * @param {String} bookId - The id of the book to be loaded into the session
     * @param {Function} callback - The callback to be executed after the session is created
     */
    function createNewSession(sessionName, bookId, callback) {
        if (currentUserId) {
            var self = this;
            $.post("http://localhost:9000/sessions/createsession", {
                sessionName: sessionName,
                bookId: bookId,
                userId: currentUserId
            }).done(function (data) {
                if (data.success) {
                    self.setCurrentUserSession(data.result);
                    CollabBookReader.getBooks().getBookPage(data.result.currentBook.book_id, data.result.currentBook.pageNum);
                    callback(data);
                } else {
                    alert("An error has occured when creating a new session. Please try again");
                    console.log(data);
                }
            });
        }
    };
    /**
     * joinSession - Joins a session, then retrieves the page the session is currently reading
     * @param {String} sessionId - ID of the session to join
     * @param {Function} callback - The callback to be executed after the session is joined
     */
    function joinSession(sessionId, callback) {
        if (currentUserId) {
            for (var session in availableSessions) {
                if (ts.availableSessions[session]._id == sessionId) {
                    var self = this;
                    availableSessions[session].joinSession(currentUserId, function (data) {
                        self.setCurrentUserSession(data);
                        CollabBookReader.getBooks().getBookPage(data.currentBook.book_id, data.currentBook.pageNum);
                        callback(data);
                    });
                    break;
                }
            }
        }
    };
    /**
     * leaveCurrentSession - Leaves the currentUserSession
     * @param {Function} callback - The callback to be executed after the session is left
     */
    function leaveCurrentSession(callback) {
        if (currentUserId && currentUserSession) {
            var self = this;
            currentUserSession.leaveSession(currentUserId, function (data) {
                self.removeCurrentUserSession();
                callback(data);
            });
        } else {
            console.error("No session to leave");
        }
    };

    return {
        getAvailableSessions: getAvailableSessions,
        setAvailableSessions: setAvailableSessions,
        pushAvailableSession: pushAvailableSession,
        removeAvailableSession: removeAvailableSession,
        setAvailableSessionsCallback: setAvailableSessionsCallback,
        callAvailableSessionsCallback: callAvailableSessionsCallback,
        filterAvailableSessions: filterAvailableSessions,
        getCurrentUserSession: getCurrentUserSession,
        setCurrentUserSession: setCurrentUserSession,
        removeCurrentUserSession: removeCurrentUserSession,
        setCurrentUserSessionCallback: setCurrentUserSessionCallback,
        callCurrentUserSessionCallback: callCurrentUserSessionCallback,
        createNewSession: createNewSession,
        joinSession: joinSession,
        leaveCurrentSession: leaveCurrentSession
    };
})();

/**
 * Session - Handles all of the functionality related to an individual session
 * @constructor
 */
function Session(sessionDetails) {
    this._id = sessionDetails._id;
    this.name = sessionDetails.name;
    this.owner = sessionDetails.owner;
    this.users = sessionDetails.users;
    this.currentBook = sessionDetails.currentBook;


    this.joinSession = function (userID, callback) {
        $.post("http://localhost:9000/sessions/joinsession", {
            sessionId: this._id,
            userId: userID
        }).done(function (data) {
            if (data.success) {
                callback(data);
            } else {
                alert("An error has occured when joining a session. Please try again");
                console.log(data);
            }
        });
    }

    /**
     * leaveSessions - Leaves the current session
     * 
     * @param {String} userId - ID of the user to leaving the session
     * @param {Function} callback - The callback to be executed when the session is left
     */
    this.leaveSession = function (userId, callback) {
        $.post("http://localhost:9000/sessions/leavesession", {
            sessionId: this._id,
            userId: userId
        }).done(function (data) {
            if (data.success) {
                callback(data.result);
            } else {
                alert("An error has occured when leaving a session. Please try again");
                console.log(data);
            }
        });
    }
}