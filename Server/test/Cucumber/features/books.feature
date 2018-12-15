Feature: Books

Scenario: View all books
    When I ask to see the list of all books
    Then I should be shown all of the books


Scenario: Get a page from a book
    Given I know what book I want to see
    And I know what page I want to see
    Then when I ask to see the page from a book
    Then I should be shown the page from that book