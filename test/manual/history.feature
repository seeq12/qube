Feature: History of Events

  Scenario: No historical Events available.
    Given that I just registered a new Qube account
    And no one has knocked on my office or has invited me yet
    And I open the configuration dropdown (gear icon on the top right)
    Then an "Notification History" headline is displayed
    And a text informs me that no one cares about me.

  Scenario: Historical Events available.
    Given that I am logged into Qube
    And at least one person has knocked on my office or invited me to their room
    And I open the configuration dropdown (gear icon on the top right)
    Then an "Notification History" headline is displayed
    And below I find a summary of the events missed (a nicely formatted time in my selected timezone and some text)

  Scenario: New Historical Events.
    Given that User A and User B are logged into Qube
    And User A knocks onto User B's office
    And then User B clicks on the gear icon
    Then the first entry in the "Notification History" informs User B that User A knocked
    And the date displayed is accurate
