Feature: Plant Management
  As a cannabis grower
  I want to manage my plant collection
  So that I can track their growth and harvest data

  Background:
    Given I am logged in as a registered user
    And I am on the dashboard

  Scenario: Adding a new plant from seed
    When I click "Add Plant" on the dashboard
    Then I should see the plant creation form
    When I fill in the plant details:
      | field       | value           |
      | name        | Blue Dream #1   |
      | strain      | Blue Dream      |
      | origin      | Seed            |
      | datePlanted | 2025-08-01      |
    And I upload a plant image
    And I submit the plant form
    Then I should see "Plant added successfully"
    And I should be redirected to the plants list
    And I should see "Blue Dream #1" in my plant collection

  Scenario: Viewing plant collection
    Given I have plants in my collection
    When I navigate to "View Plants"
    Then I should see a table of my plants
    And each plant should display:
      | field      |
      | name       |
      | strain     |
      | origin     |
      | generation |
      | status     |
    And I should see plant statistics:
      | metric        |
      | Active plants |
      | Harvested     |
      | Clones made   |

  Scenario: Viewing plant details
    Given I have a plant named "Blue Dream #1" in my collection
    When I click "View" for "Blue Dream #1"
    Then I should see the plant detail page
    And I should see the plant's information
    And I should see the grow diary section
    And I should see "Clone Plant" and "Harvest Plant" buttons

  Scenario: Editing plant diary
    Given I am viewing the details of "Blue Dream #1"
    When I click in the diary text area
    And I add a new diary entry: "Day 30: Plant is growing well, switched to bloom nutrients"
    And I save the diary changes
    Then I should see the new diary entry
    And the diary should be saved to localStorage

  Scenario: Plant collection with no plants
    Given I have no plants in my collection
    When I navigate to "View Plants"
    Then I should see "No plants yet!"
    And I should see a "Get started by adding your first plant" message
    And I should see an "Add Plant" button
