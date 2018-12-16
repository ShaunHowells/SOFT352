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
    function addNewChatMessage(chatMessage) {
        chatMessages.push(new ChatMessage(chatMessage));

        chatMessageObserver.notify(chatMessages);
    }
    /**
     * Send a message to other users in the session
     * 
     * @memberof Chat
     * @param {String} message
     */
    function sendChatMessage(message) {
        $.post("http://localhost:9000/chat/sendchatmessage", {
            sessionId: Sessions.getCurrentUserSession()._id,
            userId: Sessions.getCurrentUserId(),
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
    function removeAllChatMessages() {
        chatMessages = [];
        chatMessageObserver.notify(chatMessages);
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
     * @param {Object} messages Contains the data for for the chat messages
     */
    function setChatMessages(messages) {
        chatMessages = [];
        for (var message in messages) {
            chatMessages.push(new ChatMessage(messages[message]));
        }

        chatMessageObserver.notify(chatMessages);
    }

    return {
        getChatMessageObserver: getChatMessageObserver,
        addNewChatMessage: addNewChatMessage,
        sendChatMessage: sendChatMessage,
        removeAllChatMessages: removeAllChatMessages,
        getChatMessages: getChatMessages,
        setChatMessages: setChatMessages
    };
})();

/**
 * Handles all of the functionality related to an individual chat message
 * @constructor
 */
function ChatMessage(messageDetails) {
    /**
     * The user who sent the message
     * @member {Integer}
     */
    this.user = messageDetails.user;
    /**
     * The contents of the message
     * @member {Integer}
     */
    this.message = messageDetails.message;

    if(messageDetails.notification){
        this.notification = true;
    } else {
        this.notification = false;
    }
}