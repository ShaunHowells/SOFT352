/**
 * @classdesc Handles all of the functionality relating to the handling of the "Users" in the current session.
 * Users is an extension of Sessions. Users don't have any inherent functionality that they don't get from sessions.
 * They have been moved to their own class to better manage them.
 * 
 * @class
 * @hideconstructor
 */
var Users = (function() { // eslint-disable-line no-unused-vars
    var currentSessionUsers = [];

    var currentSessionUsersObserver = new Observer();

    /**
     * Returns currentSessionUsersObserver
     * 
     * @memberof Users
     * @return {Observer} - Observer for the current session users
     */
    function getCurrentSessionUsersObserver() {
        return currentSessionUsersObserver;
    }

    /**
     * Adds a user to currentSessionUsers
     * 
     * @memberof Users
     * @param {Object} user - The details of the user to add
     */
    function addUser(user) {
        currentSessionUsers.push(new User(user));

        currentSessionUsersObserver.notify(currentSessionUsers);
    }

    /**
     * Removes a user from currentSessionUsers
     * 
     * @memberof Users
     * @param {String} userId - The id of the user to remove
     */
    function removeUser(userId) {
        currentSessionUsers = currentSessionUsers.filter(function(value) {
            return value._id != userId;
        });

        currentSessionUsersObserver.notify(currentSessionUsers);
    }

    /**
     * Removes all users
     * 
     * @memberof Users
     */
    function removeAllUsers(session) {
        if (!session) {
            currentSessionUsers = [];
            currentSessionUsersObserver.notify(currentSessionUsers);
        }
    }

    /**
     * Returns currentSessionUsers
     * 
     * @memberof Users
     * @returns {User[]} - List of all current session users
     */
    function getUsers() {
        return currentSessionUsers;
    }

    /**
     * Sets the list of users
     * 
     * @memberof Users
     * @param {Object} users - Contains the data for the users
     */
    function setUsers(users) {
        currentSessionUsers = [];
        for (var user in users) {
            currentSessionUsers.push(new User(users[user]));
        }

        currentSessionUsersObserver.notify(currentSessionUsers);
    }

    return {
        getCurrentSessionUsersObserver,
        addUser,
        removeUser,
        removeAllUsers,
        getUsers,
        setUsers
    };
})();

/**
 * Handles all of the functionality related to an individual user
 * @constructor
 */
function User(userDetails) {
    /**
     * The ID of the user
     * @member {String}
     */
    this._id = userDetails._id;
    /**
     * The username of that user
     * @member {String}
     */
    this.username = userDetails.username;
}