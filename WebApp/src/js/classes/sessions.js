function Sessions() {
    this.currentUserId = null;
    this.availableSessions = [];
    this.availableSessionsCallback = null;
    this.currentUserSessions = [];
    this.currentUserSessionsCallback = null;

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
    }
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
        var filteredList = self.availableSessions.filter(function(value){
            for(var session in self.currentUserSessions){
                if(self.currentUserSessions[session]._id == value._id){
                    return false;
                }
            }
            return true;
        });
        return filteredList;
    };

    this.getCurrentUserSessions = function () {
        return this.currentUserSessions;
    };
    this.setCurrentUserSessions = function (sessions) {
        this.currentUserSessions = sessions.slice();
        this.callCurrentUserSessionsCallback();
    };
    this.pushCurrentUserSession = function (newSession) {
        this.currentUserSessions.push(newSession);
        this.callCurrentUserSessionsCallback();
        this.callAvailableSessionsCallback();
    };
    //Given a session id, remove the session with that id from currentUserSessions
    this.removeCurrentUserSession = function (sessionId) {
        if (sessionId) {
            this.currentUserSessions = this.currentUserSessions.filter(function (value) {
                return value._id !== sessionId;
            });;
            this.callAvailableSessionsCallback();
            this.callCurrentUserSessionsCallback();
        }
    };
    this.setCurrentUserSessionsCallback = function (callback) {
        this.currentUserSessionsCallback = callback;
        this.callCurrentUserSessionsCallback();
    };
    this.callCurrentUserSessionsCallback = function () {
        if (this.currentUserSessionsCallback) {
            this.currentUserSessionsCallback(this.currentUserSessions);
        }
    }

    this.createNewSession = function (sessionName, bookId, callback) {
        if (this.currentUserId) {
            var self = this;
            $.post("http://localhost:9000/sessions/createsession", {
                sessionName: sessionName,
                bookId: bookId,
                userId: this.currentUserId
            }).done(function (data) {
                if (data.success) {
                    self.pushCurrentUserSession(data.result);
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
                    self.pushCurrentUserSession(data.result);
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
                    self.removeCurrentUserSession(data.result._id);
                    callback(data);
                } else {
                    alert("An error has occured when leaving a session. Please try again");
                    console.log(data);
                }
            });
        }
    }
}