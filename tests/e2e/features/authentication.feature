Feature: User Authentication
  As a cannabis grower
  I want to create an account and login
  So that I can track my plants securely

  Background:
    Given the Pheno Hunter application is running
    And I am on the homepage

  Scenario: Successful user registration
    Given I visit the signup page
    When I enter valid registration details:
      | field            | value                |
      | username         | testgrower           |
      | email           | test@phenohunter.com |
      | password        | growpass123          |
      | confirmPassword | growpass123          |
    And I submit the registration form
    Then I should see a success message
    And I should be redirected to the dashboard
    And I should see "Welcome, testgrower!" in the header

  Scenario: Password validation during registration
    Given I visit the signup page
    When I enter a password shorter than 6 characters
    And I submit the registration form
    Then I should see "Password must be at least 6 characters long"
    And I should remain on the signup page

  Scenario: Password confirmation mismatch
    Given I visit the signup page
    When I enter different passwords in password and confirm password fields
    And I submit the registration form
    Then I should see "Passwords do not match"
    And I should remain on the signup page

  Scenario: Successful login
    Given I have a registered account with:
      | username | testgrower      |
      | password | growpass123     |
    When I visit the login page
    And I enter my login credentials
    And I submit the login form
    Then I should be redirected to the dashboard
    And I should see the Billy Bong mascot
    And I should see my plant statistics

  Scenario: Login with invalid credentials
    Given I visit the login page
    When I enter invalid login credentials
    And I submit the login form
    Then I should see an error message
    And I should remain on the login page

  Scenario: Automatic redirect when already logged in
    Given I am already logged in
    When I visit the login page
    Then I should be automatically redirected to the dashboard
