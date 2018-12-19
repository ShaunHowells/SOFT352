Feature: Chat
    In order to collaborate with other users
    Users in the same session should be able to chat with eachother via a text chat

    @AdditionalUserRequired
    Scenario: Send chat message
        Given that I am in a session with multiple users
        And I have input my chat message
        When I send a chat message
        Then the other users in the session should receive that chat message