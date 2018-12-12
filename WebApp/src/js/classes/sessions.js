/**
 * Sessions - Handles all of the functionality relating to the handling of 'Sessions'
 * @constructor
 */
function Sessions() { // eslint-disable-line no-unused-vars

    this.currentUserId = null; //Id of the current user
    this.availableSessions = []; //List of available sessions
    this.availableSessionsCallback = null; //The callback to be executed when availableSessions is updated
    this.currentUserSession = {}; //The current session - Defaults to no session
    this.currentUserSessionCallback = null; //The callback to be executed when the currentUserSession is updated

    /**
     * getAvailableSessions - Return this.availableSessions
     */
    this.getAvailableSessions = function () {
        return this.availableSessions;
    };
    /**
     * setAvailableSessions - Set this.availableSessions, then call this.availableSessionCallback
     * @param {Object[]} sessions - List of sessions
     */
    this.setAvailableSessions = function (sessions) {
        this.availableSessions = sessions.slice();
        this.callAvailableSessionsCallback();
    };
    /**
     * pushAvailableSession - Add new session to this.availableSessions, then call this.availableSessionCallback
     * @param {Object} newSession - Session to add to this.availableSession
     */
    this.pushAvailableSession = function (newSession) {
        this.availableSessions.push(newSession);
        this.callAvailableSessionsCallback();
    };
    /**
     * removeAvailableSession - Given a session id, remove the session with that id from this.availableSessions, then call this.availableSessionCallback
     * @param {String} sessionId - Id of the session to be removed
     */
    this.removeAvailableSession = function (sessionId) {
        if (sessionId) {
            this.availableSessions = this.availableSessions.filter(function (value, index, arr) {
                return arr[index]._id !== sessionId;
            });
            this.callAvailableSessionsCallback();
        }
    };
    /**
     * setAvailableSessionsCallback - Set this.availableSessionsCallback, then call this.availableSessionCallback
     * @param {Function} callback - Callback to set this.availableSessionsCallback as
     */
    this.setAvailableSessionsCallback = function (callback) {
        this.availableSessionsCallback = callback;
        this.callAvailableSessionsCallback();
    };
    /**
     * callAvailableSessionsCallback - Check that this.availableSessionsCallback exists then calls it 
     */
    this.callAvailableSessionsCallback = function () {
        if (this.availableSessionsCallback) {
            this.availableSessionsCallback(this.filterAvailableSessions());
        }
    };

    /**
     * filterAvailableSessions - Filter this.availableSessions so that the currentUserSession isn't displayed as we don't want to display our current session as an available session
     */
    this.filterAvailableSessions = function () {
        var self = this;
        var filteredList = self.availableSessions.filter(function (value) {
            if (self.currentUserSession._id == value._id)
                return false;
            return true;
        });
        return filteredList;
    };
    /**
     * getCurrentUserSession - Return this.currentUserSession
     */
    this.getCurrentUserSession = function () {
        return this.currentUserSession;
    };
    /**
     * setCurrentUserSession - Set this.currentUserSession, then call this.currentUserSessionCallback and this.availableSessionCallback
     * this.availableSessionCallback is called so that this.filterAvailableSessions can remove the new user session from the list of available sessions
     * @param {Object} session - Session to set this.currentUserSession as
     */
    this.setCurrentUserSession = function (session) {
        this.currentUserSession = session;
        this.callCurrentUserSessionCallback();
        this.callAvailableSessionsCallback();
    };
    /**
     * removeCurrentUserSession - Clears this.currentUserSession then called both this.availableSessionCallback and this.currentUserSessionCallback
     * Current User Session display will be cleared, and the availableSessionList will be uploaded to display all availableSessions (as previously the currentUserSession would be filtered out)
     */
    this.removeCurrentUserSession = function () {
        this.currentUserSession = {};
        this.callAvailableSessionsCallback();
        this.callCurrentUserSessionCallback();
        
        //Reset page to default page
        CollabBookReader.getBooks().resetPage();
    };
    /**
     * setCurrentUserSessionCallback - Sets this.currentUserSessionCallback then calls this.currentUserSessionCallback
     * @param {Function} callback - Callback to set this.currentUserSessionCallback as
     */
    this.setCurrentUserSessionCallback = function (callback) {
        this.currentUserSessionCallback = callback;
        this.callCurrentUserSessionCallback();
    };
    /**
     * callCurrentUserSessionCallback - Check that this.currentUserSessionCallback exists then calls it 
     */
    this.callCurrentUserSessionCallback = function () {
        if (this.currentUserSessionCallback) {
            this.currentUserSessionCallback(this.currentUserSession);
        }
    };
    /**
     * createNewSession - Creates a new user session, sets the currentUserSession to the newly created session, then gets the first page of the selected book to display
     * @param {String} sessionName - Name of the session to be created
     * @param {String} bookId - The id of the book to be loaded into the session
     * @param {Function} callback - The callback to be executed after the session is created
     */
    this.createNewSession = function (sessionName, bookId, callback) {
        if (this.currentUserId) {
            var self = this;
            $.post("http://localhost:9000/sessions/createsession", {
                sessionName: sessionName,
                bookId: bookId,
                userId: this.currentUserId
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
    this.joinSession = function (sessionId, callback) {
        if (this.currentUserId) {
            var self = this;
            $.post("http://localhost:9000/sessions/joinsession", {
                sessionId: sessionId,
                userId: this.currentUserId
            }).done(function (data) {
                if (data.success) {
                    self.setCurrentUserSession(data.result);
                    CollabBookReader.getBooks().getBookPage(data.result.currentBook.book_id, data.result.currentBook.pageNum);
                    callback(data);
                } else {
                    alert("An error has occured when joining a session. Please try again");
                    console.log(data);
                }
            });
        }
    };
    /**
     * leaveSession - Joins a session, then retrieves the page the session is currently reading
     * @param {String} sessionId - ID of the session to leave
     * @param {Function} callback - The callback to be executed after the session is left
     */
    this.leaveSession = function (sessionId, callback) {
        if (this.currentUserId) {
            var self = this;
            $.post("http://localhost:9000/sessions/leavesession", {
                sessionId: sessionId,
                userId: this.currentUserId
            }).done(function (data) {
                if (data.success) {
                    self.removeCurrentUserSession();
                    callback(data);
                } else {
                    alert("An error has occured when leaving a session. Please try again");
                    console.log(data);
                }
            });
        }
    };
}