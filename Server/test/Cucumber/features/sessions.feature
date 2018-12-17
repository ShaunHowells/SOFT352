Feature: Sessions
  In order to collaborate with other users
  Users should be able to view, create, join, and leave sessions

  Scenario: Viewing all available sessions
    Given there are available sessions
    When I ask to see all available sessions
    Then I should be shown the available sessions

  Scenario: Creating a session
    Given I have supplied a name for the session
    And I have chosen a book
    And I have a user id
    And I have supplied a username
    When I try to create a session
    Then my session should be created
    And I should be joined to that session

  @AdditionalUserRequired
  Scenario: Joining an available session
    Given there are available sessions to join
    And I have a user id to join the session with
    And I have supplied a username to join the session with
    When I try to join a session
    Then I should be added to the session
    And given information about the session

  Scenario: Leaving a session
    Given that I am in a session
    When I try to leave the session
    Then I should removed from the session
