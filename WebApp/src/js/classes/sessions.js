function Sessions(user) {
    this.availableSessions = null;
    this.currentUserSessions = null;
    this.user = user;
    this.availableSessionCallback = null;

    //Return availableSessions array
    this.getAvailableSessions = function () {
        return this.availableSessions;
    };
    //Set availableSessions array
    //If availableSessionCallback is defined then call it with array
    this.setAvailableSessions = function (sessions) {
        this.availableSessions = sessions;
        this.callAvailableSessionCallback();
    };
    this.pushAvailableSession = function (newSession) {
        if (this.availableSessions) {
            this.availableSessions.push(newSession);
            this.callAvailableSessionCallback();
        }
    }
    //Set availableSessionsCallback - Used to update angular model for displaying sessions
    //If this.availableSessions is already populated at this point then call the callback immediately
    this.setAvailableSessionsCallback = function (callback) {
        this.availableSessionCallback = callback;
        this.callAvailableSessionCallback();
    };
    //Calls the availableSessionCallback
    //Moved to a function to remove the number of times I have to check if it exists before calling it
    this.callAvailableSessionCallback = function () {
        if (this.availableSessions && this.availableSessionCallback) {
            this.availableSessionCallback(this.availableSessions);
        }
    }
}