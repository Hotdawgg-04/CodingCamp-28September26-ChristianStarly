# Expense & Budget Visualizer

A mobile-friendly web application for tracking daily expenses. Built with vanilla HTML, CSS, and JavaScript with Local Storage for data persistence and a custom Canvas-based pie chart for spending visualization.

## Features

- **Transaction Management**: Add and delete expense transactions
- **Category Tracking**: Organize expenses by Food, Transport, or Fun
- **Visual Analytics**: Pie chart showing spending distribution by category
- **Balance Overview**: Real-time total balance display
- **Data Persistence**: All data stored locally in your browser
- **Responsive Design**: Works on mobile (320px+) and desktop devices

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- JavaScript must be enabled

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser

No build tools or server required - it runs entirely in the browser.

## Usage

### Adding a Transaction

1. Enter the item name (1-100 characters)
2. Enter the amount (positive number with up to 2 decimal places)
3. Select a category (Food, Transport, or Fun)
4. Click the "Add" button

### Deleting a Transaction

1. Locate the transaction in the list
2. Click the delete button (X)
3. Confirm the deletion in the dialog

### Viewing Your Data

- **Total Balance**: Displayed prominently at the top of the page
- **Transaction List**: Scrollable list of all transactions (newest first)
- **Pie Chart**: Visual breakdown of spending by category

## Browser Support

- Google Chrome (latest stable)
- Mozilla Firefox (latest stable)
- Microsoft Edge (latest stable)
- Apple Safari (latest stable)

## Data Storage

All data is stored in your browser's Local Storage. Data persists between browser sessions but is limited to this browser on this device. Clearing browser data will remove all stored transactions.

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Flexbox/Grid layouts, CSS Custom Properties
- **JavaScript**: ES6+ with no external dependencies
- **Canvas API**: Custom pie chart rendering
- **Local Storage API**: Client-side data persistence

## License

This project is open source and available for educational purposes.
