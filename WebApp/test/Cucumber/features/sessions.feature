Feature: Sessions
  In order to collaborate with other users
  Users should be able to view, create, join, and leave sessions

  Scenario: Viewing all available session
    Given there are available sessions
    When I ask to see all available sessions
    Then I should be shown the available session

  Scenario: Creating a session
    When I try to create a session
    And I have supplied a name
    And I have chosen a book
    Then I should be able to create a session
    
  Scenario: Joining an available session
    Given there are available sessions to join
    When I click join a session
    Then I should be added to the session
    And given information about the session
    
  Scenario: Leaving a session
    Given I am in a session
    When I click to leave the session
    Then I should removed from the session
    