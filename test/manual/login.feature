Feature: Login

  Scenario: Login Without Zoom
    Given that I have a Slack account and no Zoom account
    When I login to the qube it does not allow me to enter the office
    And I see an error message explaining that I may not have a valid Zoom account

  Scenario: Logout
    Given that I am logged into qube
    Then I can see a logout button in the upper right corner of site
    When I hover over logout I see a helper tooltip
    When I click logout I am taken back to the login screen immediately

  Scenario: Login With Self-Registration
    Given that self-registration is enabled and I have a valid Slack/Zoom account
    And the first non-test user has already been created in qube
    Then I am able to create a qube account by logging in

  Scenario: Login without Self-Registration
    Given that self-registration is disabled and I have a valid Slack/Zoom account
    And no users are in the system
    Then as the first non-test user I am able to create an account in qube
    When User 2 attempts to login with a valid Slack/Zoom account
    Then User 2 is unable to enter the office
    And an error message explaining that self registration is not enabled appears

  Scenario: Auto Logout
    Given that I am logged into Qube
    When I log into qube as the same user on another browser or machine
    Then the first browser instance is automatically logged out
