Feature: Sessions
    In order to collaborate with other users in the same session
    Users should be able to view, create, and delete notes

    Scenario: View all notes for a session
        Given that I am in the session I want to view the notes of
        When I ask to see all of the notes for that session
        Then I should be shown the notes for that session

    Scenario: Add a new note to a session
        Given that I am in the session I want to add a note to
        And I have chosen a page number to add my note to
        And I have chosen what my note will say
        Then when I try to add a note
        And my note should be created