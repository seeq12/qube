Feature: Office

  Scenario: Set Home Room
    When I hover over a vacant room
    Then a small “home” icon is displayed in the top right corner
    When I click on the icon
    Then my avatar is moved into the room
    And I am able to edit the room name by clicking on it
    When I double click on the lobby
    Then I enter the lobby
    When I click on the home icon in another vacant room
    Then my avatar is moved into the room
    And I am able to edit the room name by clicking on it

  Scenario: Zoom to fit
    When I resize my browser window
    Then the office resizes
    When a user moves to another office
    Then the office stays at the zoom level I selected

  Scenario: Pan and Zoom
    When I click on the zoom icon with the plus in the top toolbar
    Then the office floor plan enlarges
    When I click on the zoom icon with the minus in the top toolbar
    Then the office floor plan shrinks
    When I click and drag the mouse over the floorplan
    Then I am able to move the floor plan to the left and right
    When I use the scroll wheel on my mouse
    Then I can zoom in and out of the floorplan
    And the qube logo (floor selector) is on top of the office when they overlap
    When I click on the zoom to fit button in the top toolbar
    Then the office zooms to the right size
    When user A starts a meeting
    And user B, whose home office is on the same floor as the meeting, sets a different zoom level
    And user A stops the meeting
    Then the zoom level user B set remains the same

  Scenario: Room Hover
    When I hover over someone else’s office name
    Then the office name changes to display the owner’s name
    And I am unable to edit the other user’s room name

  Scenario: Send Home
    Given that User 2 has a home room,
    And I am logged in as User 1
    And User 1 and User 2 are both in the watercooler
    When I click on the home icon next to User 2 in the side panel
    Then User 2 is sent to their home room

  Scenario: Presence
    Given that at least two users are present on qube
    And the other user reloads qube
    Then I see the other user flicker on my map
    When the other user closes their qube browser tab (with the browser still open)
    Then I see the other user disappear on my map
    When the other user reopens qube
    And the other user reappears on my map
    When the other user closes the entire browser
    Then other user disappears from my map
