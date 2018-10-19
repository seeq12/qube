Feature: Watching

  Scenario: Watch a user meeting with someone
    Given that User 1 and User 2 are meeting in User 1's home office
    Then I can see a watch (eye) icon for both User 1 and User 2
    When I watch User 1 and User 2
    Then the watch icons for User 1 and User 2 stay highlighted for me
    And I receive slack notifications indicating that I am 'next in line' for both users
    When I type /qube watching then the user names of the users I am watching are displayed
    When User 1 and User 2 end their meeting
    Then I receive slack notifications indicating that they are free immediately
    And User 1 and User 2 receive notifications that I am waiting to talk to them after two minutes
    When User 1 knocks on my door and I accept
    Then the watch icon for User 1 disappears
    When User 2 meets with User 1 again
    And they end their meeting
    And I receive a slack notification that User 2 is free

  Scenario: Watch a user who changes states
    Given that User 1 is busy or away
    Then User 2 can see a watch (eye) icon for User 1
    When User 2 watches User 1
    Then the watch icons for User 1 stays highlighted for User 2
    And User 2 receive a slack notification indicating that I am 'next in line' for User 1
    When User 3 watches User 1 as well
    Then User 3 receives a slack notification indicating that there is one other person waiting
    When User 1 sets themselves to available or Feeling social
    Then User 2 and User 3 receive notifications that User 1 is free
    And I wait 30 seconds
    Then User 1 receives a slack notification that User 2 and 3 are waiting to talk to him/her

  Scenario: Watch a user who is offline
    Given that User 1 is offline
    Then I can see a watch (eye) icon for User 1
    When I watch User 1
    Then the watch icons for User 1 stays highlighted for me
    And I receive a slack notification indicating that I am 'next in line' for User 1
    When User 1 comes online
    Then I receive a notification that User 1 is free
    And I wait 30 seconds
    Then User 1 receives a slack notification that User 1 is waiting to talk to him/her
