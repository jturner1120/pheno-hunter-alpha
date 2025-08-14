# PhenoHunter Application Manual
## Comprehensive User Interface and Feature Documentation

### Version: Phase 8 - Advanced Analytics & Reporting
### Document Purpose: Cucumber Test Planning & Selenium QA Implementation
### Last Updated: August 2025

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Authentication System](#authentication-system)
3. [Dashboard](#dashboard)
4. [Plant Management](#plant-management)
5. [Analytics Dashboard](#analytics-dashboard)
6. [Report Generator](#report-generator)
7. [Predictive Analytics](#predictive-analytics)
8. [Session Security](#session-security)
9. [Navigation & Routing](#navigation--routing)
10. [Data Models & Validation](#data-models--validation)
11. [Error Handling](#error-handling)
12. [Testing Scenarios](#testing-scenarios)

---

## Application Overview

### Purpose
PhenoHunter is a comprehensive plant cultivation management system that enables users to track, analyze, and optimize their plant growing operations through data-driven insights, predictive analytics, and automated reporting.

### Core Value Propositions
- **Plant Lifecycle Tracking**: Complete cultivation journey from seed to harvest
- **Data-Driven Insights**: Advanced analytics and performance metrics
- **Predictive Intelligence**: AI-powered growth, harvest, and yield predictions
- **Professional Reporting**: Export-ready PDF and CSV reports
- **Multi-User Security**: Robust authentication and session management

### Technology Stack
- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Analytics**: Machine Learning regression models
- **Reporting**: React-PDF, Chart.js, D3.js
- **Testing**: Vitest, React Testing Library

---

## Authentication System

### Login Screen (`/login`)

#### Purpose
Secure user authentication and application entry point.

#### Interface Elements
| Element | Type | Purpose | Data Expected | Validation |
|---------|------|---------|---------------|------------|
| Email Field | Input (email) | User identification | Valid email format | Required, email format |
| Password Field | Input (password) | User authentication | 6+ characters | Required, min length |
| Login Button | Button | Form submission | - | Enabled when form valid |
| "Don't have an account?" Link | Link | Navigate to signup | - | Routing to `/signup` |

#### User Workflows
1. **Successful Login**: Email + password → Dashboard redirect
2. **Failed Login**: Error message display → Form reset
3. **New User**: Link to signup page
4. **Validation Errors**: Real-time field validation with error messages

#### Data Flow
```
Input: { email: string, password: string }
Process: Firebase Authentication
Output: { user: UserObject, redirect: '/dashboard' } | { error: string }
```

#### Test Scenarios
- Valid credentials → successful login
- Invalid email format → validation error
- Wrong password → authentication error
- Empty fields → required field errors
- Network failure → connection error handling

### Signup Screen (`/signup`)

#### Purpose
New user account creation and initial onboarding.

#### Interface Elements
| Element | Type | Purpose | Data Expected | Validation |
|---------|------|---------|---------------|------------|
| Name Field | Input (text) | User display name | 2-50 characters | Required, length |
| Email Field | Input (email) | Account identifier | Valid email format | Required, email, unique |
| Password Field | Input (password) | Account security | 6+ characters | Required, min length |
| Confirm Password | Input (password) | Password verification | Match password | Required, match |
| Create Account Button | Button | Form submission | - | Enabled when valid |
| "Already have an account?" Link | Link | Navigate to login | - | Routing to `/login` |

#### User Workflows
1. **Account Creation**: Fill form → email verification → auto-login → dashboard
2. **Validation Errors**: Real-time field validation
3. **Existing User**: Link to login page

---

## Dashboard

### Main Dashboard (`/dashboard`)

#### Purpose
Central hub providing overview of cultivation operations, quick access to key features, and high-level metrics.

#### Interface Layout
```
[Header: Logo | User Menu | Logout]
[Welcome Section: User greeting | Quick stats]
[Navigation Grid: 6 primary feature cards]
[Recent Activity: Latest plant updates]
[Quick Actions: Add plant | View reports]
```

#### Navigation Cards
| Card | Purpose | Destination | Data Displayed |
|------|---------|-------------|----------------|
| View Plants | Plant inventory management | `/plants` | Plant count, status overview |
| Analytics | Data insights dashboard | `/analytics` | Recent trends, key metrics |
| Reports | Document generation | `/reports` | Available report types |
| AI Predictions | Predictive analytics | `/predictions` | Model status, recent predictions |
| Add Plant | New plant creation | Plant form modal | Quick entry form |

#### Header Components
| Element | Purpose | Functionality |
|---------|---------|---------------|
| Logo | Brand identity | Home navigation |
| User Display | Current user indicator | Shows logged-in user name |
| User Menu | Account options | Profile, settings, logout |
| Logout Button | Session termination | Secure logout with confirmation |

#### Data Sources
- Plant count and status from Firestore
- Recent activity from plant timeline events
- User information from authentication context
- Quick stats calculated from plant metrics

#### User Workflows
1. **Overview Review**: Login → dashboard scan → identify priorities
2. **Feature Navigation**: Select card → feature access
3. **Quick Actions**: Add plant, view recent activity
4. **Account Management**: User menu → logout/settings

---

## Plant Management

### Plants List Screen (`/plants`)

#### Purpose
Comprehensive plant inventory management with filtering, search, and bulk operations.

#### Interface Layout
```
[Header: Back to Dashboard | Search Bar | View Toggle]
[Filters: Status | Strain | Stage | Date Range]
[Bulk Actions Bar: Select All | Bulk Operations]
[Content Area: Table View | Card View | Mobile View]
[Pagination: Load More | Page Controls]
[Stats Footer: Total plants | Filtered count | Selection count]
```

#### Search and Filter Interface
| Element | Type | Purpose | Data Expected |
|---------|------|---------|---------------|
| Search Bar | Input (text) | Name/strain search | Any text string |
| Status Filter | Dropdown | Filter by plant status | active, inactive, harvested |
| Strain Filter | Dropdown | Filter by strain type | Strain names from database |
| Stage Filter | Dropdown | Filter by growth stage | vegetative, flowering, harvest |
| Date Range | Date picker | Filter by creation date | Start and end dates |

#### Plant Display Views

##### Table View
| Column | Data Type | Purpose | Sortable |
|--------|-----------|---------|----------|
| Selection | Checkbox | Bulk operation selection | No |
| Image | Thumbnail | Visual identification | No |
| Name | Text | Plant identifier | Yes |
| Strain | Text | Genetic information | Yes |
| Stage | Badge | Current growth phase | Yes |
| Age | Number | Days since creation | Yes |
| Last Update | Date | Most recent activity | Yes |
| Status | Badge | Active/inactive state | Yes |
| Actions | Buttons | Individual operations | No |

##### Card View
```
[Plant Image] [Plant Name]
[Strain Type] [Growth Stage]
[Age: X days] [Status Badge]
[Quick Actions: Edit | View | Delete]
```

#### Bulk Operations
| Operation | Purpose | Confirmation Required | Undo Available |
|-----------|---------|----------------------|----------------|
| Delete Selected | Remove multiple plants | Yes, with count | No |
| Change Stage | Update growth phase | Yes | Yes |
| Export Data | Download plant data | No | N/A |
| Archive | Move to inactive | Yes | Yes |

### Individual Plant View (`/plants/:id`)

#### Purpose
Detailed plant information, measurement tracking, and lifecycle management.

#### Interface Sections

##### Plant Information Panel
| Field | Type | Editable | Purpose |
|-------|------|----------|---------|
| Plant Name | Text | Yes | Identification |
| Strain | Dropdown | Yes | Genetic classification |
| Growth Stage | Dropdown | Yes | Current phase |
| Created Date | Date | No | Tracking start |
| Last Updated | Date | No | Recent activity |
| Status | Toggle | Yes | Active/inactive |

##### Measurements Tracking
| Metric | Type | Unit | Frequency | Purpose |
|--------|------|------|-----------|---------|
| Height | Number | cm/inches | Weekly | Growth tracking |
| Width | Number | cm/inches | Weekly | Size monitoring |
| Node Count | Integer | count | Weekly | Development stage |
| Health Score | Range 1-10 | score | Daily | Condition assessment |

##### Timeline Events
| Event Type | Data Required | Purpose |
|------------|---------------|---------|
| Stage Change | New stage, date, notes | Lifecycle tracking |
| Measurement | Metric values, date | Growth monitoring |
| Harvest | Weight, date, quality notes | Yield recording |
| Problem | Issue type, severity, resolution | Problem tracking |
| General Note | Text, date, photos | Documentation |

#### Data Validation
- Plant names: 1-100 characters, no special characters
- Measurements: Positive numbers only
- Dates: Cannot be future dates
- Notes: 0-1000 characters
- Images: Max 5MB, JPG/PNG only

---

## Analytics Dashboard

### Analytics Overview (`/analytics`)

#### Purpose
Comprehensive data visualization and insights for cultivation optimization.

#### Interface Layout
```
[Header: Back to Dashboard | Export Options | Date Range]
[Filters: Time Period | Plant Selection | Metric Types]
[Summary Cards: Key Performance Indicators]
[Charts Section: Growth | Performance | Timeline]
[Insights Panel: Trends | Recommendations | Alerts]
```

#### Summary Cards
| Card | Metric | Calculation | Purpose |
|------|--------|-------------|---------|
| Total Plants | Count | Active plants | Inventory overview |
| Average Growth Rate | Rate/week | Height/width changes | Performance indicator |
| Harvest Success Rate | Percentage | Completed/total harvests | Success tracking |
| Total Yield | Weight | Sum of harvest weights | Productivity metric |

#### Chart Components

##### Growth Chart
- **Type**: Line chart
- **X-Axis**: Time (days/weeks)
- **Y-Axis**: Measurement values (height/width)
- **Data**: Plant measurements over time
- **Interactions**: Hover details, zoom, pan

##### Strain Performance Chart
- **Type**: Bar chart
- **X-Axis**: Strain names
- **Y-Axis**: Performance metrics (yield, growth rate)
- **Data**: Aggregated strain statistics
- **Interactions**: Click for strain details

##### Activity Timeline Chart
- **Type**: Area chart
- **X-Axis**: Time periods
- **Y-Axis**: Activity volume
- **Data**: Plant activities and events
- **Interactions**: Time range selection

#### Filter Controls
| Filter | Type | Options | Purpose |
|--------|------|---------|---------|
| Time Range | Dropdown | 7d, 30d, 90d, 1y, custom | Data period selection |
| Plant Selection | Multi-select | All plants by name | Specific plant analysis |
| Metric Types | Checkboxes | Height, width, yield, health | Chart data selection |

#### Data States
1. **Loading**: Skeleton placeholders during data fetch
2. **No Data**: Empty state with guidance message
3. **Error**: Error display with retry option
4. **Success**: Full analytics dashboard with data

---

## Report Generator

### Report Generation Screen (`/reports`)

#### Purpose
Professional report creation with customizable templates and export options.

#### Interface Layout
```
[Header: Back to Dashboard | Help]
[Report Type Selection: Template cards]
[Configuration Panel: Parameters | Filters | Options]
[Preview Section: Report preview | Page navigation]
[Export Options: PDF | CSV | Print]
[Report History: Previously generated reports]
```

#### Report Types
| Type | Purpose | Data Sources | Output Format |
|------|---------|--------------|---------------|
| Plant Summary | Individual plant overview | Plant data, measurements, timeline | PDF |
| Strain Analysis | Strain performance comparison | Multiple plants by strain | PDF/CSV |
| Growth Report | Development tracking | Measurements over time | PDF |
| Harvest Summary | Yield and quality analysis | Harvest data, calculations | PDF/CSV |
| Custom Report | User-defined parameters | Configurable data selection | PDF/CSV |

#### Configuration Options
| Option | Type | Purpose | Default |
|--------|------|---------|---------|
| Date Range | Date picker | Report period | Last 30 days |
| Plant Selection | Multi-select | Included plants | All active |
| Sections | Checkboxes | Report components | All selected |
| Chart Types | Dropdown | Visualization style | Auto-select |
| Export Format | Radio | Output type | PDF |

#### Report Sections
1. **Executive Summary**: Key metrics and highlights
2. **Plant Overview**: Basic information and status
3. **Growth Analysis**: Measurement trends and patterns
4. **Performance Metrics**: Calculations and comparisons
5. **Timeline**: Chronological activity view
6. **Recommendations**: Data-driven suggestions

---

## Predictive Analytics

### Predictions Dashboard (`/predictions`)

#### Purpose
AI-powered forecasting for growth patterns, harvest timing, and yield estimation.

#### Interface Layout
```
[Header: Back to Dashboard | Model Status | Refresh]
[Model Performance: Accuracy metrics | Training status]
[Prediction Cards: Growth | Harvest | Yield | Recommendations]
[Plant Selection: Individual plant predictions]
[Configuration: Prediction parameters | Model settings]
```

#### Prediction Types

##### Growth Prediction
- **Purpose**: Forecast future plant height and width
- **Input Data**: Historical measurements, plant age, strain data
- **Output**: Predicted growth curve with confidence intervals
- **Time Horizon**: 1-12 weeks ahead
- **Accuracy Metrics**: R² score, mean absolute error

##### Harvest Estimator
- **Purpose**: Predict optimal harvest timing
- **Input Data**: Growth stage, measurements, strain characteristics
- **Output**: Estimated harvest date with probability ranges
- **Factors**: Flowering duration, trichome development, strain genetics
- **Confidence Level**: Percentage probability

##### Yield Forecaster
- **Purpose**: Estimate final harvest weight
- **Input Data**: Current measurements, growth rate, strain yields
- **Output**: Predicted yield weight with variance range
- **Methodology**: Multiple regression analysis
- **Historical Basis**: Past harvest data for similar plants

#### Model Performance Interface
| Metric | Display | Purpose |
|--------|---------|---------|
| Model Accuracy | Percentage | Overall prediction reliability |
| Training Data Points | Count | Data volume for training |
| Last Updated | Timestamp | Model freshness |
| Prediction Confidence | Range | Uncertainty estimation |

#### Plant Selection Interface
- **Plant List**: Dropdown of available plants
- **Filter Options**: By strain, stage, age
- **Bulk Predictions**: Multiple plant analysis
- **Comparison Mode**: Side-by-side predictions

#### Recommendation Engine
| Category | Purpose | Data Sources |
|----------|---------|--------------|
| Optimization | Growth improvement suggestions | Performance patterns |
| Timing | Action timing recommendations | Lifecycle analysis |
| Resource | Nutrient and care suggestions | Plant health data |
| Risk | Problem prevention alerts | Historical issues |

---

## Session Security

### Session Management System

#### Purpose
Automated security enforcement to prevent unauthorized access and ensure session integrity.

#### Security Features

##### Inactivity Timeout
- **Duration**: 30 minutes of no user interaction
- **Detection**: Mouse, keyboard, touch, scroll events
- **Warning**: 5-minute advance notification
- **Behavior**: Automatic logout if no response

##### Session Duration Limit
- **Maximum**: 8 hours regardless of activity
- **Purpose**: Prevent indefinite sessions
- **Warning**: 5-minute notification before forced logout
- **Override**: Not available for security

##### Browser Close Detection
- **Mechanism**: Session storage instead of local storage
- **Behavior**: Immediate session termination on browser close
- **Persistence**: No session data survives browser restart
- **Security**: Prevents shared device access

#### Session Warning Modal
```
[Warning Icon] Your session will expire in 4:32
[Message] For security, you'll be automatically logged out due to inactivity.
[Actions: Stay Logged In] [Log Out Now]
```

##### Interface Elements
| Element | Purpose | Action |
|---------|---------|---------|
| Countdown Timer | Show remaining time | Real-time update |
| Warning Message | Explain logout reason | User education |
| Stay Logged In | Extend session | Reset all timers |
| Log Out Now | Immediate logout | Secure session end |

#### Activity Detection
- **Mouse Movement**: Cursor position changes
- **Keyboard Input**: Any key press
- **Touch Events**: Mobile interaction
- **Scroll Actions**: Page navigation
- **Click Events**: Button/link activation

---

## Navigation & Routing

### URL Structure
```
/ → Redirect to /login (if unauthenticated) or /dashboard (if authenticated)
/login → Authentication screen
/signup → Account creation
/dashboard → Main application hub
/plants → Plant inventory management
/plants/:id → Individual plant details
/analytics → Data insights dashboard
/reports → Report generation system
/predictions → AI forecasting interface
```

### Route Protection
| Route | Authentication Required | Redirect If Unauthenticated |
|-------|------------------------|----------------------------|
| `/` | No | `/login` |
| `/login` | No | `/dashboard` (if authenticated) |
| `/signup` | No | `/dashboard` (if authenticated) |
| `/dashboard` | Yes | `/login` |
| `/plants` | Yes | `/login` |
| `/plants/:id` | Yes | `/login` |
| `/analytics` | Yes | `/login` |
| `/reports` | Yes | `/login` |
| `/predictions` | Yes | `/login` |

### Navigation Components

#### Global Header
- **Logo**: Returns to dashboard
- **User Menu**: Profile options and logout
- **Breadcrumbs**: Current location indicator
- **Back Buttons**: Context-sensitive return navigation

#### Footer Navigation
- **Quick Links**: Frequently accessed features
- **Help Resources**: Documentation and support
- **Legal Links**: Privacy policy, terms of service

---

## Data Models & Validation

### User Data Model
```javascript
{
  id: string,          // Firebase Auth UID
  email: string,       // User email address
  name: string,        // Display name
  createdAt: timestamp,// Account creation
  lastLogin: timestamp,// Recent access
  preferences: {       // User settings
    theme: string,
    notifications: boolean,
    language: string
  }
}
```

### Plant Data Model
```javascript
{
  id: string,          // Unique plant identifier
  userId: string,      // Owner reference
  name: string,        // Plant name (1-100 chars)
  strain: string,      // Genetic strain
  stage: string,       // Growth phase
  status: string,      // active|inactive|harvested
  createdAt: timestamp,// Plant creation date
  updatedAt: timestamp,// Last modification
  measurements: [      // Growth tracking
    {
      date: timestamp,
      height: number,
      width: number,
      nodes: number,
      health: number
    }
  ],
  timeline: [          // Activity events
    {
      date: timestamp,
      type: string,
      data: object,
      notes: string
    }
  ],
  harvest: {           // Final yield data
    date: timestamp,
    weight: number,
    quality: string,
    notes: string
  }
}
```

### Validation Rules

#### Plant Name
- **Required**: Yes
- **Length**: 1-100 characters
- **Pattern**: Alphanumeric and spaces only
- **Uniqueness**: Per user account

#### Measurements
- **Height/Width**: Positive numbers, max 999.9
- **Node Count**: Integer, 0-999
- **Health Score**: Integer, 1-10
- **Date**: Not future dates

#### Timeline Events
- **Type**: Predefined enumeration
- **Date**: Valid timestamp
- **Notes**: 0-1000 characters
- **Data**: Type-specific validation

---

## Error Handling

### Error Categories

#### Validation Errors
- **Field-level**: Real-time input validation
- **Form-level**: Cross-field validation
- **Display**: Inline error messages
- **Recovery**: User correction guidance

#### Network Errors
- **Connection**: Internet connectivity issues
- **Timeout**: Request duration exceeded
- **Server**: Backend service unavailable
- **Recovery**: Retry mechanisms with exponential backoff

#### Authentication Errors
- **Invalid Credentials**: Wrong email/password
- **Session Expired**: Timeout or security logout
- **Permission Denied**: Insufficient access rights
- **Recovery**: Redirect to login with context

#### Data Errors
- **Not Found**: Requested resource missing
- **Conflict**: Data integrity violations
- **Quota Exceeded**: Storage or rate limits
- **Recovery**: Graceful degradation with user notification

### Error Display Patterns

#### Toast Notifications
```
[Icon] Error message text
[Action: Dismiss] [Action: Retry]
Duration: 5 seconds auto-dismiss
```

#### Inline Validation
```
Input Field
[Error Icon] Specific error message
```

#### Modal Dialogs
```
[Error Icon] Error Title
Detailed error description
[Primary Action] [Secondary Action]
```

#### Page-Level Errors
```
[Large Error Icon]
Something went wrong
Error description and suggested actions
[Retry Button] [Go Back Button]
```

---

## Testing Scenarios

### Cucumber Test Categories

#### Authentication Testing
```gherkin
Feature: User Authentication
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to the dashboard
    
  Scenario: Invalid credentials
    Given I am on the login page
    When I enter invalid credentials
    Then I should see an error message
```

#### Plant Management Testing
```gherkin
Feature: Plant Management
  Scenario: Create new plant
    Given I am logged in
    When I navigate to plants page
    And I click add new plant
    And I fill the plant form
    Then I should see the plant in the list
```

#### Analytics Testing
```gherkin
Feature: Analytics Dashboard
  Scenario: View analytics with data
    Given I have plants with measurement data
    When I navigate to analytics page
    Then I should see charts and metrics
    
  Scenario: View analytics without data
    Given I have no plant data
    When I navigate to analytics page
    Then I should see no data message
```

### Selenium Test Selectors

#### Data Test IDs
- `[data-testid="login-form"]`
- `[data-testid="plant-card-{id}"]`
- `[data-testid="analytics-chart"]`
- `[data-testid="report-generator"]`
- `[data-testid="session-warning"]`

#### CSS Selectors
- `.plant-list-container`
- `.analytics-summary-card`
- `.navigation-card`
- `.bulk-action-bar`
- `.session-warning-modal`

#### Form Elements
- `input[name="email"]`
- `input[name="password"]`
- `select[name="plant-strain"]`
- `textarea[name="notes"]`
- `button[type="submit"]`

### Performance Testing Scenarios
- **Page Load Times**: Under 3 seconds initial load
- **Data Fetching**: Under 2 seconds for plant lists
- **Chart Rendering**: Under 1 second for analytics
- **Export Generation**: Under 10 seconds for reports
- **Mobile Responsiveness**: All features functional on mobile

### Security Testing Scenarios
- **Session Timeout**: Verify 30-minute inactivity logout
- **Browser Close**: Verify session termination
- **Route Protection**: Verify authentication requirements
- **Data Isolation**: Verify user data separation
- **Input Validation**: Verify XSS protection

### Accessibility Testing
- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Reader**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Logical tab order
- **Error Announcements**: Screen reader error notification

---

## Conclusion

This manual provides comprehensive documentation of all PhenoHunter features, interfaces, and workflows. It serves as the definitive reference for:

- **Test Planning**: Complete feature coverage for Cucumber scenarios
- **QA Automation**: Detailed selectors and workflows for Selenium
- **User Training**: Interface understanding and feature utilization
- **Development**: Consistent implementation and maintenance

The application provides a full-featured plant cultivation management platform with enterprise-grade security, comprehensive analytics, and professional reporting capabilities.
