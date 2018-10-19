Feature: Office

  Scenario: Change user color and emotion
    When I click on the avatar in the top left corner
    Then a popover displays
    And I see 30 different emotions
    And a selection of colors
    And a input field to enter a Hex color code
    When I select an emotion
    Then the avatar immediately updates to my selection
    And the popover does not close
    When I select a color from the displayed options
    Then the color of my avatar immediately updates
    And the popover does not close
    When I enter an invalid Hex color code
    Then an error message displays that informs me to check my hex code
    When I enter a valid Hex color code
    Then the color of my avatar immediately updates
    And the popover does not close
    When I click outside the popover
    Then the popover closes

  Scenario: Update state
    When I click the state dropdown
    Then I see five states (available, feeling social, BRB, busy, and away)
    When I click on available
    Then my avatar displays with no state icon in the side menu and header
    And my avatar displays with no state icon on the map
    When I click on feeling social
    Then my avatar displays with a green paper plane icon in the side menu and header
    And my avatar displays with a green dot on the map
    When I click on BRB
    Then my avatar displays with a coffee cup icon in the side menu and header
    And my avatar displays with a orange dot on the map
    And there is a 'back by field' that is populated to the next 15 minute increment (rounding up)
    And I wait 30 seconds
    And an "I'm back" button appears
    When I click on the "I'm back button"
    Then my state resets to available and my status message is cleared
    And no BB time is displayed
    When I click on busy
    Then my avatar displays with a red no entry icon in the side menu and header
    And my avatar displays with a red dot on the map
    When I click on away
    Then my avatar displays with a yellow back arrow icon in the side menu and header
    And my avatar displays with a yellow dot on the map
    And there is a 'back by field' that is populated to the next 60 minute increment (rounding up)
    And I wait 30 seconds
    And an "I'm back button appears"

  Scenario: BB time parsing
    When I set my status to away
    Then the BB timefield automatically updates to the next 15 minutes interval an hour from now
    When I enter a new BB time in military format 1300
    Then it correctly displays 1:00 PM
    When I enter a new BB time in military time format 14:00
    Then it correctly displays 2:00PM
    When I enter a new BB time as 12:45 pm
    Then  it correctly displays 12:45 PM

  Scenario: Timezone Warning
    When I set my timezone to a timezone other than my browser's timezone
    Then the sad turtle displays
    And informs me that my timezone does not match my browser
    And I see to buttons that allow me to accept the timezone change or to ignore it
    When I click to ignore the warning
    Then the modal closes
    And my timezone is not changed
    When I reload the browser
    And I click to change my timezone
    Then the modal closes
    And my timezone is changed
    When I reload my browser
    Then the modal is no longer displayed

  Scenario: Update status message
    When I click on my status message box
    And I change my status to “testing qube”
    Then my status in slack changes to “testing qube”
    And my status icon in slack remains the same
    When I clear my status in Qube
    Then the status box says “What are you up to?”
    And my status in slack is cleared
    And my status icon in slack remains the same
    When I toggle quickly between away and busy for at least 5 times as quickly as possible
    Then nothing strange happens

  Scenario: Back By Time
    When you change your state to away or busy
    And you change your back by to a few minutes in the future
    And I receive a slack reminder notification in five minutes + the few minutes
       sort of... At about 10:35, set back by to 10:37. Expected reminder at 10:42, got it at 10:52. Functionally fine, but not what the test

  Scenario: Change Theme
    When I click on my avatar in the top left corner
    Then a popover opens
    And I see a display of emotions, a colorpicker, and a theme dropdown
    When I choose “darcula”
    Then the display changes to the dark theme
    When I reload the page
    Then the dark theme is still displayed
    When I change the Theme to “default”
    Then the theme changes back to the white and blue theme
    When I reload then the default theme is still displayed.

  Scenario: Admin Only Mode
    Given that I have at least one admin and one non-admin logged in
    When I set admin only mode to true
    Then the office is disabled for the non-admin
    And the office is fully functional for the admin
