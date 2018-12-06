function Sessions() { // eslint-disable-line no-unused-vars
    
    this.currentUserId = null;
    this.availableSessions = [];
    this.availableSessionsCallback = null;
    this.currentUserSession = {};
    this.currentUserSessionCallback = null;

    //Return availableSessions array
    this.getAvailableSessions = function () {
        return this.availableSessions;
    };
    //Set availableSessions array
    //If availableSessionsCallback is defined then call it with array
    this.setAvailableSessions = function (sessions) {
        this.availableSessions = sessions.slice();
        this.callAvailableSessionsCallback();
    };
    this.pushAvailableSession = function (newSession) {
        this.availableSessions.push(newSession);
        this.callAvailableSessionsCallback();
    };
    //Given a session id, remove the session with that id from availableSessions
    this.removeAvailableSession = function (sessionId) {
        if (sessionId) {
            this.availableSessions = this.availableSessions.filter(function (value, index, arr) {
                return arr[index]._id !== sessionId;
            });
            this.callAvailableSessionsCallback();
        }
    };
    //Set availableSessionsCallback - Used to update angular model for displaying sessions
    this.setAvailableSessionsCallback = function (callback) {
        this.availableSessionsCallback = callback;
        this.callAvailableSessionsCallback();
    };
    //Calls the availableSessionsCallback
    //Moved to a function to remove the number of times I have to check if it exists before calling it
    this.callAvailableSessionsCallback = function () {
        if (this.availableSessionsCallback) {
            this.availableSessionsCallback(this.filterAvailableSessions());
        }
    };

    this.filterAvailableSessions = function () {
        var self = this;
        var filteredList = self.availableSessions.filter(function (value) {
            if (self.currentUserSession._id == value._id)
                return false;
            return true;
        });
        return filteredList;
    };

    this.getCurrentUserSession = function () {
        return this.currentUserSession;
    };
    this.setCurrentUserSession = function (session) {
        this.currentUserSession = session;
        this.callCurrentUserSessionCallback();
        this.callAvailableSessionsCallback();
    };
    //Given a session id, remove the session with that id from currentUserSession
    this.removeCurrentUserSession = function () {
        this.currentUserSession = {};
        this.callAvailableSessionsCallback();
        this.callCurrentUserSessionCallback();
    };
    this.setCurrentUserSessionCallback = function (callback) {
        this.currentUserSessionCallback = callback;
        this.callCurrentUserSessionCallback();
    };
    this.callCurrentUserSessionCallback = function () {
        if (this.currentUserSessionCallback) {
            this.currentUserSessionCallback(this.currentUserSession);
        }
    };

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
                    callback(data);
                } else {
                    alert("An error has occured when creating a new session. Please try again");
                    console.log(data);
                }
            });
        }
    };
    this.joinSession = function (sessionId, callback) {
        if (this.currentUserId) {
            var self = this;
            $.post("http://localhost:9000/sessions/joinsession", {
                sessionId: sessionId,
                userId: this.currentUserId
            }).done(function (data) {
                if (data.success) {
                    self.setCurrentUserSession(data.result);
                    callback(data);
                } else {
                    alert("An error has occured when joining a session. Please try again");
                    console.log(data);
                }
            });
        }
    };
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