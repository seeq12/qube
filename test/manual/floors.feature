Feature: Floors

  Scenario: One Floor
    Given that my office has only one floor
    Then I see the floor name next to the qube icon
    When I hover over the qube icon
    Then I do not see a popup
    When I click on the qube icon
    Then nothing happens

  Scenario: Elevator
    Given that my office has at least three floors
    When I hover over the qube icon
    Then I see a pop saying "Click to select floor"
    When I click on the qube icon
    Then I see an elevator level panel appear with one button for each floor
    And my current floor is highlighted and unclickable
    When I hover over a clickable floor
    Then I see the clickable floor's name appear
    And I see the current floor name next to the qube icon
    When I click on a higher floor
    Then I see an elevator animation moving up to that floor
    And the elevator animation scrolls through the names of all intermediate floors
    When I click on a lower floor
    Then I see an elevator animation moving down to that floor
    And the elevator animation scrolls through the names of all intermediate floors

  Scenario: Pinned Offices
    Given that my office has at least two floors
    And I have claimed an office
    I do not see any star icons in the upper right corner of any offices on the same floor
    When I change floors
    Then I see star icons in the upper right corner of all claimed offices on hover
    And I do not see star icons in the upper right corner of unclaimed offices or common spaces
    When I star User 2's office (User 2 can be offline or online, in the office or away)
    Then the star icon remains highlighted
    When I move back to my home floor
    Then I see User 2's office pinned in the plant row
    When User 2 starts a meeting with User 3
    Then I see my pinned office of User 2 update
    When User 2 moves to a common space
    Then I see my pinned office of User 2 update
    When User 2 goes offline
    Then I see my pinned office of User 2 update
    When User 2 claims a different office
    Then I see my pinned office of User 2 update
    When User 2 is deleted
    Then my pinned office of User 2 is removed
