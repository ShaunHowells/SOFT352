Feature: Sessions
    In order to collaborate with other users
    Users should be able to view, create, join, and leave sessions

    Scenario: Viewing all available sessions - Manual
        Given there are available sessions
        When I ask to see all available sessions
        Then I should be shown the available sessions
    
    Scenario: Viewing all available sessions when first visiting
        Given that I have just arrived
        Then I should be shown all available sessions

    Scenario: Creating a session
        Given I have supplied a name for the session
        And I have chosen a book
        And I have a user id
        And I have supplied a username
        When I try to create a session
        Then my session should be created
        And I should be informed my session was created
        And I should be joined to that session

    @AdditionalUserRequired
    Scenario: Joining an available session
        Given there are available sessions to join
        And I have a user id to join the session with
        And I have supplied a username to join the session with
        When I try to join a session
        Then I should be added to the session
        And I should be informed that I was added to the session
        And given information about the session

    Scenario: Leaving a session - 1 User
        Given that I am in a session by myself
        When I try to leave the session
        Then I should removed from the session
        And I should be informed that the session has closed

    @AdditionalUserRequired
    Scenario: Leaving a session - Multiple Users
        Given that I am in a session with at least one other user
        When I try to leave that session
        Then I should be removed from that session
        And the others users in that session should be informed that I have left
        And the session should still be available

    Scenario: Change the page displayed in a session
        Given that I am in the session I want to change the page of
        And I have chosen what page I want to navigate to
        When I change the page displayed in the session
        Then I should be informed that the page displayed in the session has changed