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
    //Set availableSessionsCallback - Used to update angular model for displaying sessions
    //If this.availableSessions is already populated at this point then call the callback immediately
    this.setAvailableSessionsCallback = function (callback) {
        this.availableSessionsCallback = callback;
        this.callAvailableSessionsCallback();
    };
    //Calls the availableSessionsCallback
    //Moved to a function to remove the number of times I have to check if it exists before calling it
    this.callAvailableSessionsCallback = function () {
        if (this.availableSessionsCallback) {
            this.availableSessionsCallback(this.availableSessions);
        }
    };

    this.getCurrentUserSessions = function () {
        return this.currentUserSessions;
    };
    this.setCurrentUserSessions = function (sessions) {
        this.currentUserSessions = sessions.slice();
        this.callCurrentUserSessionsCallback();
    };
    this.setCurrentUserSessionsCallback = function (callback) {
        this.currentUserSessionsCallback = callback;
        this.callCurrentUserSessionsCallback();
    };
    this.pushCurrentUserSession = function (newSession) {
        this.currentUserSessions.push(newSession);
        this.callCurrentUserSessionsCallback();
    }
    this.callCurrentUserSessionsCallback = function () {
        if (this.currentUserSessionsCallback) {
            this.currentUserSessionsCallback(this.currentUserSessions);
        }
    }

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
                    alert("An error has occured. Please try again");
                    console.log(data);
                }
            })
        }
    };
}