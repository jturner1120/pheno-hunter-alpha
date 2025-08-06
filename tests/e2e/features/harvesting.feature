Feature: Plant Harvesting
  As a cannabis grower
  I want to record harvest details
  So that I can track yields and quality over time

  Background:
    Given I am logged in as a registered user
    And I have an active plant "Blue Dream #1" ready for harvest

  Scenario: Successfully harvesting a plant
    Given I am viewing the details of "Blue Dream #1"
    When I click the "Harvest Plant" button
    Then I should see the harvest modal
    And the modal should show the plant name "Blue Dream #1"
    When I enter harvest details:
      | field    | value                                    |
      | weight   | 89g dried                               |
      | potency  | 22% THC                                 |
      | notes    | Dense sticky buds with excellent aroma |
    And I confirm the harvest
    Then I should see "Plant harvested successfully"
    And the plant status should change to "Harvested"
    And the harvest data should be saved
    And I should see the harvest statistics in the plant details

  Scenario: Harvest modal validation
    Given I am viewing a plant's details
    When I click the "Harvest Plant" button
    And I try to harvest without entering required information
    Then I should see validation errors
    And the harvest should not be completed

  Scenario: Viewing harvest statistics
    Given I have harvested "Blue Dream #1" with:
      | weight  | 89g dried    |
      | potency | 22% THC      |
      | notes   | Excellent    |
    When I view the plant details
    Then I should see the harvest information displayed
    And the plant should show status "Harvested"
    And the harvest date should be recorded

  Scenario: Harvested plant cannot be cloned
    Given I have a harvested plant "Blue Dream #1"
    When I view the plant details
    Then I should not see a "Clone Plant" button
    And I should not see a "Harvest Plant" button
    But I should see the harvest statistics

  Scenario: Collection statistics update after harvest
    Given I have 3 active plants and 1 harvested plant
    When I harvest another active plant
    Then the collection statistics should show:
      | metric     | value |
      | Active     | 2     |
      | Harvested  | 2     |
    And the dashboard should reflect the updated counts
