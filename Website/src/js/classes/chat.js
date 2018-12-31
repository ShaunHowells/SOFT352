/**
 * @classdesc Handles all of the functionality relating to the handling of the "Chat".
 * 
 * @class
 * @hideconstructor
 */
var Chat = (function() { // eslint-disable-line no-unused-vars
    var chatMessages = [];
    var currentUserId;

    var chatMessageObserver = new Observer();

    /**
     * Returns chatMessageObserver
     * 
     * @memberof Chat
     * @return {Observer} - Observer for the chat messages
     */
    function getChatMessageObserver() {
        return chatMessageObserver;
    }

    /**
     * Adds a ChatMessage to chatMessages
     * 
     * @memberof Chat
     * @param {object} chatMessage - The details of the message to add
     */
    function addChatMessage(chatMessage) {
        chatMessages.push(new ChatMessage(chatMessage));

        chatMessageObserver.notify(chatMessages);
    }
    /**
     * Send a message to other users in the session
     * 
     * @memberof Chat
     * @param {string} message - The ID the message is being sent in
     * @param {string} userId - The ID of the user sending the message
     * @param {string} message - The message to send
     */
    function sendChatMessage(sessionId, message) {
        $.post("http://localhost:9000/chat/sendchatmessage", {
            sessionId: sessionId,
            userId: currentUserId,
            message: message
        }).done(function(data) {
            if (!data.success) {
                alert("An error has occured sending this message. Please try again");
                console.log(data);
            }
        });
    }

    /**
     * Removes all chat messages
     * 
     * @memberof Chat
     * @param {object} session - If session is empty then clear the list of chat messages
     */
    function removeAllChatMessages(session) {
        if (!session) {
            chatMessages = [];
            chatMessageObserver.notify(chatMessages);
        }
    }

    /**
     * Returns chatMessages
     * 
     * @memberof Chat
     * @returns {ChatMessages[]} - List of all current chat messages
     */
    function getChatMessages() {
        return chatMessages;
    }

    /**
     * Sets the list of chat messages
     * 
     * @memberof Chat
     * @param {object} messages - Contains the data for the chat messages
     */
    function setChatMessages(messages) {
        chatMessages = [];
        for (var message in messages) {
            chatMessages.push(new ChatMessage(messages[message]));
        }

        chatMessageObserver.notify(chatMessages);
    }

    /**
     * Sets the current user id - Value may only be set once
     * 
     * @param {string} newUserId - ID to set currentUserID as
     * @memberof Chat
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
     * @return {string} - The current User ID
     * @memberof Chat
     */
    function getCurrentUserId() {
        return currentUserId;
    }

    return {
        getChatMessageObserver,
        addChatMessage,
        sendChatMessage,
        removeAllChatMessages,
        getChatMessages,
        setChatMessages,
        setCurrentUserId,
        getCurrentUserId
    };
})();

/**
 * Handles all of the functionality related to an individual chat message
 * @constructor
 */
function ChatMessage(messageDetails) {
    /**
     * The user who sent the message
     * @member {string}
     */
    this.user = messageDetails.user;
    /**
     * The contents of the message
     * @member {string}
     */
    this.message = messageDetails.message;
    /**
     * A boolean indictating if the message is a notification or not
     * This flag is used to differentiate messages stating a user has joined the session
     * @member {boolean}
     */
    this.notification;
    if (messageDetails.notification) {
        this.notification = true;
    } else {
        this.notification = false;
    }
}