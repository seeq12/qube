Feature: Side Panel

  Scenario: User List display
    Given that I am logged in as User 1
    And User 2 is also logged in
    And User 3 has closed their browser
    When I check the users list in the side panel
    Then the first thing that is displayed is the room name of the room that User 1 is currently in
    And User 2 is listed under “Everyone”
    And User 2’s avatar is shown in color
    And on the right side of User 2 there is an “invite” icon
    And User 3 is listed last
    And User 3’s avatar is shown in gray
    And there is no icon to invite User 3

  Scenario: Sort
    Given that I am logged in as User 1
    And User 2 is also present in my office
    When I open qube the initial sort in the side panel is 'Default'
    And I see users grouped by Everyone, Guests, and Offline
    When I change the sort to 'by Room'
    Then I see users grouped by rooms in alphabetical order
    And offices without users are not listed
    And offline users are not listed
    And no office or user is listed more than once
    When I change the sort to 'by Department'
    Then I see users grouped by department (including users without departments)
    And offline users and guest users are not listed
    When I have only one floor
    Then I do not see an option to sort users by Floor
    When my office has more than one floor
    When I sort users 'by Floor'
    Then I see users grouped by floor
    And offline users are not listed

  Scenario: Search
    When I start searching for a user using the first few characters in the side panel
    Then I see all matches for my search results
    And my Sort option (departments, rooms, default, floor) headers remain present
    When I start searching for a user using the middle characters in the side panel
    Then I see all matches for my search results
    And my Sort option (departments, rooms, default, floor) headers remain present

  Scenario: Spotlight
    When I hover over a user on the same floor as me in the left side panel
    Then the avatar of that person is spotlit
    And the avatar bounces up and then
    When I stop hovering
    Then the spotlight is removed
    And the avatar stops to bounce
    When I hover over a user on a different floor than me in the left side panel
    Then nothing happens

  Scenario: Invite all
    Given that I am User 1 and User 2 is available and User 3 is busy
    And I am in the Cafeteria or the Auditorium
    And I click on the "Invite All" icon next to Everyone
    Then User 2 gets a notification to join User 1 in the Auditorium/Cafeteria
    When User 2 clicks the notification
    Then User 2 joins the meeting

  Scenario: Invite department
    Given that I am User 1 and User 2 is in my department and User 3 is not
    And I am in the Cafeteria or the Auditorium (?)
    And I sort by Department in the side panel
    And I click on the "Invite All" icon next to my Department
    Then only User 2 gets a notification to join User 1 in the Auditorium/Cafeteria
    When User 2 clicks the notification
    Then User 2 joins the meeting
