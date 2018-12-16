//Sample chat messatges for use in Chat tests
var sampleChatMessage1 = {
    "user": "ShaunH",
    "message": "Sample 1"
};

var sampleChatMessage2 = {
    "user": "JohnS",
    "message": "Sample 2"
}

var sampleChatMessages = [{
    "user": "Tim",
    "message": "Message 1"
}, {
    "user": "Jim",
    "message": "Message 2"
}];



/**
 * The 'Chat' module contains all of the tests directly relating to the use of Chat. This does not test the functionality of the Chat itself, only show the UI interactions with it
 * These tests use sample data that is representative of actual chat messages. The sample data is used insted of needing multiple users each connected to the server via websockets.
 */
QUnit.module("Chat");

/**
 * Display the set of chat messages
 */
QUnit.test("Set list of Chat messages", function(assert) {
    //STORE PREVIOUS VALUES
    //Gets the current chatMessages
    var previousChatList = CollabBookReader.getChat().getChatMessages();

    //Get Angular scope for the the chat messages
    var chatMessagesCtrl = angular.element("#chatMessageArea").scope();

    //Set chat messages to our sample set
    CollabBookReader.getChat().setChatMessages(sampleChatMessages);
    //Manually call .$apply() as it normally uses $applyAsync()
    chatMessagesCtrl.$apply();

    //Check values of the Angular scope has been correctly updated
    var chatMessages = chatMessagesCtrl.chatMessages;
    assert.equal(chatMessages.length, sampleChatMessages.length, sampleChatMessages.length + " chat messages should be in the current list");
    //Check that the UI reflects the changes to the scope
    assert.equal(angular.element("#chatMessages").children("li").length, sampleChatMessages.length, sampleChatMessages.length + " chat messages should be displayed in the chat messages list");

    //RESET TO PREVIOUS VALUES
    //Set the chatMessages to previous value
    CollabBookReader.getChat().setChatMessages(previousChatList);
});

/**
 * Remove all chat messages
 */
QUnit.test("Clear list of Chat messages", function(assert) {
    //STORE PREVIOUS VALUES
    //Gets the current chatMessages
    var previousChatList = CollabBookReader.getChat().getChatMessages();

    //Get Angular scope for the the chat messages
    var chatMessagesCtrl = angular.element("#chatMessageArea").scope();

    //Set chat messages to our sample list (so we have messages to remove)
    CollabBookReader.getChat().setChatMessages(sampleChatMessages);
    //Manually call .$apply() as it normally uses $applyAsync()
    chatMessagesCtrl.$apply();

    //Remove all chat messages
    CollabBookReader.getChat().removeAllChatMessages();

    //Check values of the Angular scope has been correctly updated
    var chatMessages = chatMessagesCtrl.chatMessages;
    assert.equal(chatMessages.length, 0, "0 chat messages should be in the current list");
    //Check the the UI reflects the changes to the Angular scope
    assert.equal(angular.element("#chatMessages").children("li").length, 0, "0 chat messages should be displayed in the chat messages list");

    //RESET TO PREVIOUS VALUES
    //Set the chatMessages to previous value
    CollabBookReader.getChat().setChatMessages(previousChatList);
});

/**
 * Add a chat message to the list
 */
QUnit.test("Add chat message to list of Chat messages", function(assert) {
    //STORE PREVIOUS VALUES
    //Gets the current chatMessages
    var previousChatList = CollabBookReader.getChat().getChatMessages();

    //Get Angular scope for the the chat messages
    var chatMessagesCtrl = angular.element("#chatMessageArea").scope();

    //Clear all chat messages (so that we ensure we're starting at 0 messages)
    CollabBookReader.getChat().removeAllChatMessages();
    //Manually call .$apply() as it normally uses $applyAsync()
    chatMessagesCtrl.$apply();

    CollabBookReader.getChat().addNewChatMessage(sampleChatMessage1);
    //Manually call .$apply() as it normally uses $applyAsync()
    chatMessagesCtrl.$apply();
    //Check values of the Angular scope have been correctly updated
    var chatMessages = chatMessagesCtrl.chatMessages;
    assert.equal(chatMessages.length, 1, "1 chat messages should be in the current list");
    assert.equal(angular.element("#chatMessages").children("li").length, 1, "1 chat messages should be displayed in the chat messages list");

    CollabBookReader.getChat().addNewChatMessage(sampleChatMessage2);
    //Manually call .$apply() as it normally uses $applyAsync()
    chatMessagesCtrl.$apply();
    //Check values of the Angular scope have been correctly updated
    chatMessages = chatMessagesCtrl.chatMessages;
    assert.equal(chatMessages.length, 2, "2 chat messages should be in the current list");
    assert.equal(angular.element("#chatMessages").children("li").length, 2, "2 chat messages should be displayed in the chat messages list");

    //RESET TO PREVIOUS VALUES
    //Set the chatMessages to previous value
    CollabBookReader.getChat().setChatMessages(previousChatList);
});