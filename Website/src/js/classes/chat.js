/**
 * @classdesc Handles all of the functionality relating to the handling of the "Chat".
 * 
 * @class
 * @hideconstructor
 */
var Chat = (function() { // eslint-disable-line no-unused-vars
    var chatMessages = [];

    var chatMessageObserver = new Observer();

    /**
     * Returns chatMessageObserver
     * 
     * @memberof Chat
     * @return {Observer} Observer for the chat messages
     */
    function getChatMessageObserver() {
        return chatMessageObserver;
    }

    /**
     * Adds a ChatMessage to chatMessages
     * 
     * @memberof Chat
     * @param {Object} chatMessage - The details of the message to add
     */
    function addChatMessage(chatMessage) {
        chatMessages.push(new ChatMessage(chatMessage));

        chatMessageObserver.notify(chatMessages);
    }
    /**
     * Send a message to other users in the session
     * 
     * @memberof Chat
     * @param {String} message
     */
    function sendChatMessage(sessionId, userId, message) {
        $.post("http://localhost:9000/chat/sendchatmessage", {
            sessionId: sessionId,
            userId: userId,
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
     * @returns {ChatMessages[]} List of all current chat messages
     */
    function getChatMessages() {
        return chatMessages;
    }

    /**
     * Sets the list of chat messages
     * 
     * @memberof Chat
     * @param {Object} messages Contains the data for the chat messages
     */
    function setChatMessages(messages) {
        chatMessages = [];
        for (var message in messages) {
            chatMessages.push(new ChatMessage(messages[message]));
        }

        chatMessageObserver.notify(chatMessages);
    }

    return {
        getChatMessageObserver,
        addChatMessage,
        sendChatMessage,
        removeAllChatMessages,
        getChatMessages,
        setChatMessages
    };
})();

/**
 * Handles all of the functionality related to an individual chat message
 * @constructor
 */
function ChatMessage(messageDetails) {
    /**
     * The user who sent the message
     * @member {String}
     */
    this.user = messageDetails.user;
    /**
     * The contents of the message
     * @member {String}
     */
    this.message = messageDetails.message;
    /**
     * A boolean indictating if the message is a notification or not
     * This flag is used to differentiate messages stating a user has joined the session
     * @member {Boolean}
     */
    this.notification;
    if (messageDetails.notification) {
        this.notification = true;
    } else {
        this.notification = false;
    }
}