Feature: Slack

  Scenario: Get Qube Help
    Given I type /qube help
    Then I expect an ephemeral message to only me
    And it displays a list of 4 commands

  Scenario: Update your qube status
    Given that I type /qube emergency ice cream break in a channel other than my own
    And press enter
    Then I receive a response in my personal channel
    And I see a message that my status has been updated
    And it provides me options to update my state
    And when I update my status to BRB or Away
    Then a new dropdown with suggested BB times
    When I set a BB time
    And press the "looks good button"
    Then it updates my status in qube
    And it updates my status in slack (including timezone)
    When I update my BB time to a time that is not a 15 minute interval
    And I update my status again in Slack
    Then the non-rounded time I set in qube is selected in slack
    When I click cancel it removes the entire message

  Scenario: Slack enforcement
    Given that Slack is closed (fully closed)
    And I open qube
    And I wait for 2 eternally long minutes
    Then the sad turtle appears
    And informs me that qube is more fun with Slack
    And I see two buttons
    When I click on Open
    Then it opens Slack

  Scenario: Slack from within Qube
    Given that I click on the Slack icon next to a user in the side panel
    Then a slack channel for DM appears

  Scenario: Slack from within Qube to offline user
    Given that user 1 is offline in Slack and User 2 is online
    And User 2 click on the Slack icon next user 1 in the side panel
    Then the user 1 receives a qube notification prompting them to start Slack
    When user 1 clicks on the notification
    Then Slack opens

  Scenario: Slack from office with 2 people
    Given that there are 2 users in the same office
    And one of them clicks on the Slack icon next to the room name
    Then a DM slack channel with the user opens

  Scenario: Slack from office with 3 people
    Given that there are 3 users in the same office
    And one of them clicks on the Slack icon next to the room name
    Then a slack channel with the users opens
