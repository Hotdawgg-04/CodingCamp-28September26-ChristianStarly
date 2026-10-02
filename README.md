# CodingCamp-28September26-ChristianStarly
Mini project Coding Camp RevoU Full Stack Developer  
Developer: **Christian Starly**

# Expense & Budget Visualizer

A mobile-friendly web application for tracking daily expenses. Built with vanilla HTML, CSS, and JavaScript with Local Storage for data persistence and a custom Canvas-based pie chart for spending visualization.

---

## 🌐 Live Demo Deployment

Aplikasi **Expense & Budget Visualizer** dapat diakses secara langsung melalui tautan GitHub Pages berikut:

👉 **[Live Demo: Expense & Budget Visualizer](https://hotdawgg-04.github.io/CodingCamp-28September26-ChristianStarly/expense-budget-visualizer/)**  
Direct URL: `https://hotdawgg-04.github.io/CodingCamp-28September26-ChristianStarly/expense-budget-visualizer/`

> **📌 Catatan untuk Instruktur / Evaluator Coding Camp:**  
> Seluruh source code aplikasi web berada di dalam subfolder `expense-budget-visualizer/` sesuai dengan struktur direktori resmi penugasan Coding Camp. Oleh karena itu, aplikasi web aktif dan dapat dibuka langsung melalui tautan dengan subfolder di atas:  
> `https://hotdawgg-04.github.io/CodingCamp-28September26-ChristianStarly/expense-budget-visualizer/`

---

## Features

- **Transaction Management**: Add and delete expense transactions with validation and confirmation
- **Category Tracking**: Organize expenses by Food, Transport, Fun, or unlimited custom categories
- **Visual Analytics**: Dynamic Canvas pie chart showing spending distribution by category
- **Balance & Budget Overview**: Real-time total balance display and monthly budget tracking with visual status alerts (Safe, Warning, Exceeded)
- **Period Filter & Monthly Summary**: Filter spending by specific calendar months or view all-time analytics
- **Flexible Sorting**: Sort transactions by Date (Newest/Oldest), Amount (High to Low/Low to High), or Category (A to Z)
- **Dark/Light Mode**: Instant theme switcher with system preference detection and persistence
- **Custom Categories**: Create user-defined categories with customized color picker and deterministic contrast styling
- **Data Persistence**: All transactions, budgets, custom categories, and theme preferences stored securely in Local Storage
- **Responsive Design**: Mobile-first architecture that seamlessly adapts from 320px smartphones to wide desktop monitors

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
3. Select a category or click **+ New Category** to create a custom category
4. Click the "Add Transaction" button

### Managing Custom Categories

1. Click **+ New Category** next to the category label
2. Enter your category name (1-30 characters) and choose a color with the color picker
3. Click **Save**; the new category will immediately appear in the dropdown, legend, and pie chart

### Setting a Spending Budget Limit

1. Enter your target monthly budget in the budget form (e.g. `1000000`)
2. Click **Set Budget**
3. Watch the progress bar and status badge:
   - **Safe (< 80%)**: Green badge
   - **Warning (80% - 100%)**: Orange badge
   - **Exceeded (> 100%)**: Pulsing red alert with border highlight
4. Click **Remove** anytime to clear the budget limit

### Period Filtering & Sorting

- **Filter by Month**: Use the Period dropdown to select a specific month or "All Time"
- **Sort Transactions**: Reorder transactions by Date (Newest/Oldest), Amount (High/Low), or Category (A-Z)

### Dark/Light Mode Switcher

- Click the theme button in the top right header to switch between light and dark modes instantly

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
