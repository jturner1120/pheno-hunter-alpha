Feature: Plant Cloning
  As a cannabis grower
  I want to clone my best performing plants
  So that I can preserve superior genetics

  Background:
    Given I am logged in as a registered user
    And I have a mother plant "OG Kush Mother" in my collection
    And the mother plant is in generation 1

  Scenario: Successfully cloning a plant
    Given I am viewing the details of "OG Kush Mother"
    When I click the "Clone Plant" button
    Then I should see the clone modal
    And the clone form should show:
      | field        | value           |
      | parentName   | OG Kush Mother  |
      | strain       | OG Kush         |
      | generation   | 2               |
    When I enter the clone name "OG Kush Clone #1"
    And I upload a photo of the clone
    And I confirm the clone creation
    Then I should see "Clone created successfully"
    And I should be redirected to the clone's detail page
    And the clone should have:
      | field        | value           |
      | name         | OG Kush Clone #1|
      | strain       | OG Kush         |
      | origin       | Clone           |
      | generation   | 2               |
      | status       | Active          |

  Scenario: Clone inherits correct genetics
    Given I clone "OG Kush Mother" as "OG Kush Clone #1"
    When I view the clone details
    Then the clone should inherit:
      | field           | value           |
      | strain          | OG Kush         |
      | originalMotherId| <mother's ID>   |
    And the generation should be incremented to 2
    And the datePlanted should be today's date

  Scenario: Cloning a clone (second generation)
    Given I have a clone "OG Kush Clone #1" in generation 2
    When I clone "OG Kush Clone #1" as "OG Kush Clone #2"
    Then the new clone should be in generation 3
    And it should still reference the original mother plant
    And the strain should remain "OG Kush"

  Scenario: Clone modal validation
    Given I am viewing a plant's details
    When I click the "Clone Plant" button
    And I try to create a clone without entering a name
    Then I should see a validation error
    And the clone should not be created

  Scenario: Viewing clone family tree
    Given I have a mother plant with multiple clones
    When I view any plant in the family
    Then I should see the plant's generation
    And I should see a reference to the original mother (if applicable)
