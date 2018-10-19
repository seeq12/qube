Feature: Meetings

  Background:
    Given that qube is running
    And at least three users with slack and zoom accounts have signed in on separate machines
    And two users have set a home office

  Scenario: Start meeting in common space
    Given that at least two users move to a common space or conference room
    Then the users are displayed in the order they have entered the common space or conference room
    Then no zoom meeting opens for anyone
    And a ‘start meeting’ link appears in the top navbar
    And I click on ‘start meeting’
    Then a zoom meeting starts with me as host
    And a zoom meeting opens for everyone else
    And a new user enter the same common space
    Then the meeting opens for the new user
    When I end the meeting in zoom for everyone
    Then Everyone returns back home  (or a common space if I have not set a home office)

  Scenario: Invite another user
    Given that a user invites me to his or her room
    Then I receive a Desktop notification indicating that the other user has invited you to his or her room
    When I click the notification
    Then I enter the other user’s office
    And a zoom meeting starts with the other user as host
    And a zoom meeting opens for me
    And a ‘join meeting’ and ‘end meeting’ button appear in the top navbar
    And I can copy the ‘join meeting’ link by clicking on the ‘join meeting’ button clipboard icon
    When I leave the meeting
    Then I reappear in my home office (or the water cooler if I have no home)
    Then User 1 stays in the meeting
    When I paste the zoom link into a browser
    Then I join the meeting again
    Then I reappear in the meeting room again in qube
    When the other user ends the meeting in zoom for everyone
    Then I move back to my home office (or a common space) if I have not set a home office)

  Scenario: Knock on user’s office
    Given that another user knocks on my door
    Then I receive a desktop notification indicating that the other user has knocked on my room

    When I click on the notification
    Then the other user enters my office
    And a zoom meeting starts with me as host
    And a zoom meeting opens for the other user
    And a ‘join meeting’ and end meeting’ button appear in the top navbar
    And I can copy the ‘join meeting’ link by clicking on the ‘join meeting’ button clipboard icon
    When I end the meeting in zoom
    Then the other user moves back to their home office (or a common space if I have not set a home office)

  Scenario: Knock on user’s office when meeting is ongoing
    Given that I already have another user in my room with an ongoing Zoom meeting
    And another user knocks on my door
    Then I grant entrance to my room
    Then the other user enters my room
    And a Zoom meeting opens up for the other user
  Scenario: Invite another user when meeting is ongoing
    Given that a user already has another user in his or her room with an ongoing meeting
    And I invite User 3
    Then User 2 receives a notification that User 3 has been invited
    Then I accept the invitation
    Then I enter the other user’s room
    And a Zoom meeting opens up for me

  Scenario: Call user
    Given that I am logged in as User 1
    And User 2 is also logged in
    And User 3 has closed their browser
    And User 3 has the zoom app installed on their phone
    When I start a meeting in my office
    Then a “join meeting” button and an “end meeting” button replace the “start meeting” button”
    And next to User 3 there is a ”call” icon displayed
    When I click on the call icon
    Then User 3 receives a Slack notification
    And the notification contains a text link
    When User 3 clicks on the link for their phone
    Then the zoom app opens
    And they joined the meeting

  Scenario: Accept knock after 2 minute delay
    Given that a user knocks on my door
    And I wait five minutes
    Then I grant entrance to my room
    Then I see a desktop notification that “It’s been awhile” since the knock occurred
    Then qube invites the other user to my room for me

  Scenario: Accept invite after 2 minute delay
    Given that a user invites me to his or her room
    And I wait 2 minutes
    Then I accept the invitation
    Then I see a desktop notification that “It’s been awhile” since the invite occurred
    Then qube knocks on other user’s room for me

  Scenario: Accept invite to common space after 2 minute delay
    Given that a user starts a meeting and invites me to a common room
    And I wait 2 minutes
    Then I accept the invitation
    Then I enter the room and a meeting starts for me

  Scenario: Scheduled Meeting
    Given that I schedule a meeting in Zoom
    And you start the scheduled meeting
    Then your qube status should be the name of your meeting’
    And your state should be set to busy
    And your back_by time should be set to the now + the duration of the meeting
    And I send a join link to another qube user
    And that user clicks the link
    Then they get transported to my office
    When I end the meeting
    Then my state, status, and back_by are cleared
    When I set my state to busy and add a status
    And I schedule a meeting in Zoom
    And you start the scheduled meeting
    Then your qube status should be appended with the name of your meeting and a duration
    And your state should still be set to busy
    And your back_by time should not be set
    When I end the meeting
    Then my state, status, and back_by are back to before

  Scenario: Accept invite after user has left the room
    Given that a user invites me to his or her office
    And the other user leaves for a different room
    Then I accept the invite
    Then I see a desktop notification that the user has already moved on

  Scenario: Accept knock after requester has gone offline
    Given that a user knocks on my door
    And that user goes offline
    Then I grant entrance to my room
    Then I see a desktop notification that the requester has gone offline

  Scenario: Accept invite after requester has gone offline
    Given that a user invites me to his or her office
    And the other user goes offline
    Then I accept the invite
    Then I see a desktop notification that the requester has gone offline

  Scenario: Guest User
    Given that User 1 has started a zoom meeting
    And User 2 is not a qube user and does not have an affiliated Zoom account
    Then User 1 sends User 2 a Zoom link
    And User 2 joins the Zoom meeting
    Then User 2 appears in qube as a guest user
    And User 2's avatar is crowned in both the side panel and map

  Scenario: Teleportation
    Given that User 1 and User 2 are in a meeting
    And User 3 joins the meeting
    Then everyone gets moved to a conference room
    And a notification is displayed informing everyone of the move
