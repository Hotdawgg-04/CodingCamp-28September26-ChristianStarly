# Implementation Plan: Expense & Budget Visualizer

## Overview

This implementation plan converts the design document into actionable coding tasks for building a client-side expense tracking web application. The application uses vanilla HTML, CSS, and JavaScript with Local Storage for persistence and a custom Canvas-based pie chart for visualization.

**Implementation Approach:**
- Mobile-first responsive design starting from 320px viewport
- Single-page application with centralized state management
- Component-based architecture with clear separation of concerns
- Progressive enhancement with graceful degradation

**Technology Stack:**
- HTML5 (semantic markup)
- CSS3 (Flexbox/Grid, CSS Custom Properties)
- Vanilla JavaScript ES6+
- Local Storage API
- HTML5 Canvas (custom pie chart)

---

## Tasks

- [x] 1. Set up project structure and configuration
  - [x] 1.1 Create project directory structure
    - Create `expense-budget-visualizer/` root directory
    - Create `css/` subdirectory for stylesheets
    - Create `js/` subdirectory for JavaScript files
    - Create `index.html` at root level
    - Create `css/styles.css` for all styling
    - Create `js/app.js` for main application logic
    - Create `README.md` with usage instructions
    - _Requirements: 7.1, 7.2_

  - [x] 1.2 Add browser compatibility check and noscript fallback
    - Implement feature detection for Local Storage and Canvas API
    - Add noscript element with browser warning message
    - Display unsupported browser message if required APIs unavailable
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Implement HTML structure and semantic markup
  - [x] 2.1 Create main HTML document structure
    - Add DOCTYPE, html, head, and body elements
    - Configure viewport meta tag for responsive design
    - Link CSS stylesheet with proper path
    - Add script tag with defer attribute
    - Set document language and character encoding
    - _Requirements: 7.1, 10.4_

  - [x] 2.2 Build balance display section
    - Create semantic container for total balance display
    - Add appropriate heading and value elements
    - Position within top 15-20% of viewport structure
    - Configure for large font display (1.5x body text)
    - _Requirements: 4.1, 4.6, 10.1_

  - [x] 2.3 Build transaction input form
    - Create form element with proper semantic structure
    - Add Item Name input field with maxlength attribute (100 chars)
    - Add Amount input field with step attribute for decimals
    - Add Category dropdown with Food, Transport, Fun options
    - Add submit button with accessible label
    - Configure proper label associations and ARIA attributes
    - _Requirements: 1.1, 1.2, 9.1, 9.2, 9.4_

  - [x] 2.4 Build transaction list container
    - Create scrollable container for transaction list
    - Add empty state message element (hidden by default)
    - Configure list container for transaction items
    - Set max-height constraint for scrolling
    - _Requirements: 2.1, 2.3, 2.5_

  - [x] 2.5 Build pie chart section
    - Create container for pie chart visualization
    - Add canvas element with appropriate dimensions
    - Create legend container with category color indicators
    - Add empty state for no transactions
    - _Requirements: 5.1, 5.6, 5.7_

- [x] 3. Implement CSS styling and responsive design
  - [x] 3.1 Define CSS custom properties and base styles
    - Define color palette variables (primary, category colors, UI colors)
    - Define typography scale variables (16px base, 20px headings)
    - Define spacing and layout variables
    - Set up CSS reset/normalize base styles
    - Configure body defaults (font, background, color)
    - _Requirements: 7.1, 10.2, 10.3_

  - [x] 3.2 Style balance display component
    - Apply large font sizing (minimum 24px)
    - Center align and position in top 15-20% of viewport
    - Style for visual prominence
    - Ensure proper contrast ratio (WCAG AA)
    - _Requirements: 4.1, 10.1_

  - [x] 3.3 Style transaction form component
    - Style form layout with flexbox
    - Style input fields with proper sizing (44x44px min tap targets)
    - Style dropdown selector
    - Style submit button with hover/active states
    - Add focus indicators for accessibility
    - Style error message display areas
    - _Requirements: 1.1, 7.4, 9.1, 9.2_

  - [x] 3.4 Style transaction list component
    - Set max-height and overflow for scrolling
    - Style transaction item cards
    - Style delete button with adequate tap target
    - Style empty state message
    - Configure list item layout (name, amount, category, delete)
    - _Requirements: 2.1, 2.2, 2.3, 3.1_

  - [x] 3.5 Style pie chart component
    - Style canvas container
    - Style legend with category labels and color indicators
    - Configure colors matching category definitions
    - Style empty chart state
    - _Requirements: 5.1, 5.6, 10.3_

  - [x] 3.6 Implement responsive layout breakpoints
    - Implement mobile-first base styles (320px-768px)
    - Add media query for tablet/desktop (768px+)
    - Configure single-column layout for mobile
    - Configure multi-column grid layout for desktop
    - Test responsive behavior at key breakpoints
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 4. Implement core JavaScript modules and state management
  - [x] 4.1 Implement application state manager
    - Create AppState object structure (transactions, totalBalance, categoryTotals)
    - Implement getState() function
    - Implement setState() function with partial updates
    - Implement subscribe/unsubscribe pattern for UI updates
    - Add initialization state tracking
    - _Requirements: 4.2, 4.5, 4.6_

  - [x] 4.2 Implement UUID generation utility
    - Create generateId() function with UUID v4 format
    - Ensure unique identifier generation
    - _Requirements: 6.1_

  - [x] 4.3 Implement currency and date formatting utilities
    - Create formatCurrency() function (Indonesian Rupiah format)
    - Create formatDate() function for ISO 8601 timestamps
    - Create roundToTwoDecimals() function using round half-up method
    - _Requirements: 4.1, 9.3_

- [x] 5. Implement validation service
  - [x] 5.1 Implement item name validation
    - Validate minimum length (1 character after trim)
    - Validate maximum length (100 characters)
    - Return validation result with error messages
    - Implement trim transformation
    - _Requirements: 1.1, 1.4, 9.2_

  - [x] 5.2 Implement amount validation
    - Validate positive numeric value (greater than 0)
    - Validate maximum value (9,999,999.99)
    - Validate decimal places (maximum 2)
    - Implement round half-up transformation
    - Return validation result with error messages
    - _Requirements: 1.1, 1.6, 9.1, 9.3_

  - [x] 5.3 Implement category validation
    - Validate against enum values (Food, Transport, Fun)
    - Return validation result with error messages
    - _Requirements: 1.2, 9.4_

  - [x] 5.4 Implement transaction form validation
    - Create validateTransaction() combining all field validations
    - Return comprehensive validation result
    - Handle multiple field errors
    - _Requirements: 1.4, 1.6_

- [x] 6. Implement Local Storage service
  - [x] 6.1 Implement storage availability check
    - Create isStorageAvailable() function
    - Test localStorage read/write capability
    - Handle exceptions gracefully
    - _Requirements: 6.5_

  - [x] 6.2 Implement transaction persistence operations
    - Create saveToStorage() function with error handling
    - Create loadFromStorage() function with JSON parsing
    - Create deleteFromStorage() function
    - Create clearStorage() function
    - Handle storage full scenario
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 6.3 Implement data corruption handling
    - Validate JSON structure on load
    - Validate transaction schema on load
    - Discard corrupted entries, preserve valid ones
    - Log corruption errors to console
    - _Requirements: 6.6_

- [x] 7. Implement transaction service layer
  - [x] 7.1 Implement add transaction functionality
    - Generate unique ID for new transaction
    - Create timestamp (ISO 8601 format)
    - Add to state transactions array
    - Recalculate total balance
    - Recalculate category totals
    - Persist to Local Storage
    - Notify subscribers of state change
    - Return new transaction object
    - _Requirements: 1.3, 4.3, 5.3, 6.1_

  - [x] 7.2 Implement delete transaction functionality
    - Remove transaction by ID from state
    - Recalculate total balance
    - Recalculate category totals
    - Persist changes to Local Storage
    - Notify subscribers of state change
    - Return success boolean
    - _Requirements: 3.4, 3.5, 4.4, 5.4, 6.2_

  - [x] 7.3 Implement get all transactions functionality
    - Return transactions array sorted by date (newest first)
    - Handle empty state
    - _Requirements: 2.1, 6.3_

  - [x] 7.4 Implement calculation functions
    - Create calculateTotalBalance() function
    - Create calculateCategoryTotals() function
    - Ensure accurate summation
    - _Requirements: 4.2, 5.2_

- [x] 8. Implement UI render functions
  - [x] 8.1 Implement balance display render function
    - Create renderBalance() function
    - Format currency display
    - Handle zero balance display
    - Update within 100ms of state change
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 8.2 Implement transaction list render function
    - Create renderTransactionList() function
    - Render each transaction item with name, amount, category, delete button
    - Handle empty state display
    - Enable scroll behavior
    - Update within 1 second of state change
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 8.3 Implement transaction item rendering
    - Create transaction item HTML structure
    - Display item name (max 100 chars)
    - Display formatted amount
    - Display category with color indicator
    - Add delete button with click handler
    - _Requirements: 2.2, 3.1_

  - [x] 8.4 Implement error message rendering
    - Create renderError() function
    - Display validation errors near relevant fields
    - Style error messages appropriately
    - Clear errors on valid submission
    - _Requirements: 1.4, 1.6, 9.1, 9.2_

- [x] 9. Implement pie chart renderer
  - [x] 9.1 Implement pie segment calculation
    - Create calculatePieSegments() function
    - Calculate percentage for each category
    - Handle zero division (empty state)
    - Map category colors
    - _Requirements: 5.2_

  - [x] 9.2 Implement canvas pie chart drawing
    - Create drawPieChart() function using Canvas 2D API
    - Draw segments with correct proportions
    - Use category colors (Food: #FF6B6B, Transport: #4ECDC4, Fun: #FFE66D)
    - Handle empty chart state
    - Start from top (-π/2 radians)
    - _Requirements: 5.1, 5.2, 5.7, 10.3_

  - [x] 9.3 Implement pie chart render function
    - Create renderPieChart() function
    - Clear canvas before redraw
    - Draw all category segments
    - Update within 1 second of state change
    - Handle canvas context errors
    - _Requirements: 5.1, 5.3, 5.4, 5.5_

  - [x] 9.4 Implement legend rendering
    - Render category legend with color indicators
    - Display category labels
    - Display category totals or percentages
    - Match colors to chart segments exactly
    - _Requirements: 5.6, 10.3_

- [x] 10. Implement event handlers and user interactions
  - [x] 10.1 Implement form submission handler
    - Attach submit event listener to form
    - Prevent default form submission
    - Gather form data
    - Run validation
    - Call add transaction on valid data
    - Display errors on invalid data
    - Reset form on success
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [x] 10.2 Implement delete confirmation handler
    - Attach click handlers to delete buttons (event delegation)
    - Display confirmation dialog
    - Call delete transaction on confirmation
    - Cancel deletion on user cancel
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [x] 10.3 Implement input validation handlers
    - Attach input/change listeners for real-time feedback
    - Validate on blur event
    - Display inline error messages
    - Clear errors on valid input
    - _Requirements: 9.1, 9.2, 9.4_

- [x] 11. Implement application initialization
  - [x] 11.1 Implement app initialization sequence
    - Check browser compatibility
    - Initialize state manager
    - Load transactions from Local Storage
    - Populate initial state with stored data
    - Render all UI components
    - Set up event listeners
    - Mark initialization complete
    - _Requirements: 4.5, 5.5, 6.3, 6.4_

  - [x] 11.2 Implement DOMContentLoaded bootstrap
    - Wait for DOM ready state
    - Call initialization sequence
    - Handle initialization errors gracefully
    - Log ready state to console
    - _Requirements: 8.1_

- [x] 12. Checkpoint - Verify core functionality
  - Ensure all core features work: add, delete, balance, chart, storage
  - Test all validation rules are enforced
  - Test responsive layout at key breakpoints (320px, 768px, 1024px)
  - Test Local Storage persistence (add, close browser, reopen)
  - Ask the user if questions arise.

- [x] 13. Implement error handling and edge cases
  - [x] 13.1 Implement storage error handling
    - Handle Local Storage full error (QuotaExceededError)
    - Display user-friendly error message
    - Keep data in memory when storage fails
    - _Requirements: 6.5_

  - [x] 13.2 Implement form error display
    - Show field-specific error messages
    - Highlight error fields visually
    - Clear errors on successful submission
    - Handle multiple simultaneous errors
    - _Requirements: 1.4, 1.6, 9.1, 9.2_

  - [x] 13.3 Implement input sanitization
    - Sanitize user input to prevent XSS
    - Remove HTML tags from item name
    - Use textContent instead of innerHTML
    - _Requirements: 9.2_

- [x] 14. Final checkpoint - Complete verification
  - Verify all acceptance criteria are met
  - Test in Chrome, Firefox, Edge, Safari (latest stable)
  - Verify no console errors
  - Verify mobile responsiveness on actual devices if possible
  - Test all user flows: add transaction, delete transaction, view chart, refresh persistence
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement Optional Challenges
  - [x] 15.1 Implement dark/light mode toggle
    - Create theme toggle control in header
    - Define CSS variables for dark theme
    - Implement theme switcher and storage persistence
    - Support system prefers-color-scheme
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 15.2 Implement spending budget limit and highlight
    - Add budget limit input and threshold tracking
    - Implement visual status indicators (Safe, Warning >= 80%, Exceeded > 100%)
    - Persist budget limit in Local Storage
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 15.3 Implement transaction sorting
    - Add sorting controls for Date, Amount, and Category
    - Implement dynamic sorting algorithm
    - Preserve active sort order across CRUD updates
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 15.4 Implement monthly summary view and filter
    - Add monthly filter selector and summary card
    - Group transactions by month (YYYY-MM)
    - Dynamically update balance, list, and chart for selected month
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 15.5 Implement custom categories management
    - Add custom category creation interface
    - Generate harmonious HSL colors for new categories
    - Validate category uniqueness and persist to Local Storage
    - Support custom categories in dropdown, chart, and validation
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 15.6 Final comprehensive verification of optional challenges
    - Test all 5 optional challenges end-to-end
    - Verify persistence, accessibility, and responsiveness

---

## Notes

- Tasks follow incremental development approach - each builds on previous work
- No external test setup required per project constraints
- Manual testing at checkpoints ensures quality without automated test infrastructure
- Each task references specific requirements for traceability
- Mobile-first approach means CSS starts with mobile styles, then adds desktop enhancements
- Canvas pie chart requires careful math for segment calculations
- Local Storage operations must handle all error scenarios gracefully
- Form validation provides immediate user feedback
- Optional challenges are fully integrated into single CSS and JS files maintaining architecture constraints

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 7, "tasks": ["7.1", "7.2", "7.3", "7.4"] },
    { "id": 8, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 9, "tasks": ["9.1", "9.2", "9.3", "9.4"] },
    { "id": 10, "tasks": ["10.1", "10.2", "10.3"] },
    { "id": 11, "tasks": ["11.1", "11.2"] },
    { "id": 12, "tasks": ["13.1", "13.2", "13.3"] },
    { "id": 13, "tasks": ["15.1", "15.2", "15.3", "15.4", "15.5", "15.6"] }
  ]
}
```
