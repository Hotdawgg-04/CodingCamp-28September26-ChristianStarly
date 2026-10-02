/**
 * Expense & Budget Visualizer
 * Main Application Logic
 * 
 * A mobile-friendly web application for tracking daily expenses.
 * Built with vanilla JavaScript ES6+, uses Local Storage for persistence,
 * and HTML5 Canvas for pie chart visualization.
 */

// ============================================================================
// Browser Compatibility Check
// ============================================================================

/**
 * Checks if the browser supports all required APIs for the application.
 * Tests for Local Storage availability and Canvas API support.
 * 
 * **Validates: Requirements 8.1, 8.2**
 * 
 * @returns {boolean} True if all required APIs are available, false otherwise
 */
function checkBrowserCompatibility() {
    // Test Local Storage availability
    const hasLocalStorage = (() => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    })();

    // Test Canvas API availability
    const hasCanvas = !!document.createElement('canvas').getContext;

    return hasLocalStorage && hasCanvas;
}

/**
 * Displays an unsupported browser message to the user.
 * Creates a user-friendly warning overlay if required APIs are unavailable.
 */
function showUnsupportedBrowserMessage() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'browser-warning unsupported-browser';
    warningDiv.innerHTML = `
        <h2>Browser Not Supported</h2>
        <p>This application requires the following features to function:</p>
        <ul style="text-align: left; display: inline-block; margin: 16px 0;">
            <li>Local Storage</li>
            <li>Canvas API</li>
        </ul>
        <p>Please use one of the following supported browsers:</p>
        <p><strong>Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari</strong></p>
    `;
    
    // Insert at the beginning of the body
    document.body.insertBefore(warningDiv, document.body.firstChild);
    
    // Hide any app content that might have loaded
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'none';
    }
}

// ============================================================================
// Constants & Configuration
// ============================================================================

/**
 * Storage keys for application data and optional challenges
 */
const STORAGE_KEY = 'expense_visualizer_transactions';
const THEME_STORAGE_KEY = 'expense_visualizer_theme';
const BUDGET_STORAGE_KEY = 'expense_visualizer_budget_limit';
const CUSTOM_CATEGORIES_STORAGE_KEY = 'expense_visualizer_custom_categories';

/**
 * Default transaction categories (Req 1.2, Req 15)
 * @type {readonly ['Food', 'Transport', 'Fun']}
 */
const DEFAULT_CATEGORIES = Object.freeze(['Food', 'Transport', 'Fun']);

/**
 * Default category color definitions matching pie chart and UI styles (Req 10.3)
 */
const DEFAULT_CATEGORY_COLORS = Object.freeze({
    Food: '#FF6B6B',
    Transport: '#4ECDC4',
    Fun: '#FFE66D'
});

/**
 * Dynamic registry of active categories and colors (supports Req 15: Custom Categories)
 */
let activeCategories = [...DEFAULT_CATEGORIES];
let activeCategoryColors = { ...DEFAULT_CATEGORY_COLORS };

// Backward compatibility references
const CATEGORIES = activeCategories;
const CATEGORY_COLORS = activeCategoryColors;

/**
 * Generates a deterministic, vibrant HSL color for custom categories.
 * Ensures consistent and accessible contrast across themes.
 * 
 * **Validates: Requirement 15.1, 15.4**
 * 
 * @param {string} name - Category name
 * @returns {string} HSL color string
 */
function generateDeterministicColor(name) {
    if (!name || typeof name !== 'string') return '#9b59b6';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 55%)`;
}

/**
 * Returns list of all active categories (defaults + custom).
 * 
 * @returns {Array<string>} Active category names
 */
function getAllCategories() {
    return activeCategories;
}

/**
 * Returns assigned color for a category.
 * 
 * @param {string} category - Category name
 * @returns {string} Hex or HSL color code
 */
function getCategoryColor(category) {
    return activeCategoryColors[category] || generateDeterministicColor(category);
}

// ============================================================================
// Task 4.2 & 4.3: Core Utility Functions
// ============================================================================

/**
 * Generates a unique identifier compliant with UUID v4 format.
 * Uses native crypto.randomUUID() when available, with a pseudo-random fallback.
 * 
 * **Validates: Requirement 6.1**
 * 
 * @returns {string} UUID v4 format string
 */
function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Rounds a numeric value to two decimal places using the round half-up method.
 * Handles floating-point precision using Number.EPSILON.
 * 
 * **Validates: Requirement 9.3**
 * 
 * @param {number} amount - Numeric value to round
 * @returns {number} Rounded number with at most two decimal places
 */
function roundToTwoDecimals(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 0;
    }
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a numeric amount into standard Indonesian Rupiah currency format.
 * Example: 25000 -> "Rp 25,000.00", 0 -> "Rp 0.00"
 * 
 * **Validates: Requirement 4.1**
 * 
 * @param {number} amount - Numeric amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Rp 0.00';
    }
    const rounded = roundToTwoDecimals(amount);
    const parts = rounded.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `Rp ${integerPart}.${parts[1]}`;
}

/**
 * Formats an ISO 8601 timestamp string into a readable date format.
 * Returns empty string for invalid dates.
 * 
 * @param {string} isoString - ISO 8601 formatted date string
 * @returns {string} Human-readable date string
 */
function formatDate(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return '';
    }
}

// ============================================================================
// Task 4.1: Application State Management
// Requirements: 4.2, 4.5, 4.6
// ============================================================================

/**
 * Calculates the total balance from an array of transactions.
 * 
 * **Validates: Requirement 4.2**
 * 
 * @param {Array<Object>} transactions - List of transaction objects
 * @returns {number} Sum of all transaction amounts rounded to 2 decimal places
 */
function calculateTotalBalance(transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return 0;
    }
    const total = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return roundToTwoDecimals(total);
}

/**
 * Calculates the total spending for each category.
 * 
 * **Validates: Requirement 5.2**
 * 
 * @param {Array<Object>} transactions - List of transaction objects
 * @returns {Map<string, number>} Map of category names to their total amounts
 */
function calculateCategoryTotals(transactions) {
    const totals = new Map();
    for (const cat of activeCategories) {
        totals.set(cat, 0);
    }
    
    if (Array.isArray(transactions)) {
        for (const transaction of transactions) {
            const cat = transaction.category;
            if (!totals.has(cat)) {
                totals.set(cat, 0);
            }
            const current = totals.get(cat) || 0;
            totals.set(
                cat,
                roundToTwoDecimals(current + (Number(transaction.amount) || 0))
            );
        }
    }
    
    return totals;
}

/**
 * Centralized Application State
 * @type {Object}
 */
const AppState = {
    transactions: [],
    totalBalance: 0,
    categoryTotals: new Map([
        ['Food', 0],
        ['Transport', 0],
        ['Fun', 0]
    ]),
    isInitialized: false,
    lastError: null,
    theme: 'light',
    budgetLimit: null,
    monthFilter: 'all',
    sortOption: 'date-desc',
    customCategories: []
};

/**
 * Set of active state change subscriber callbacks
 * @type {Set<Function>}
 */
const stateSubscribers = new Set();

/**
 * Retrieves a snapshot copy of the current application state.
 * 
 * @returns {Object} Clone of current AppState
 */
function getState() {
    return {
        ...AppState,
        transactions: [...AppState.transactions],
        categoryTotals: new Map(AppState.categoryTotals),
        customCategories: [...AppState.customCategories]
    };
}

/**
 * Updates application state with partial values and notifies subscribers.
 * Automatically recalculates totalBalance and categoryTotals if transactions are modified
 * and calculations are not explicitly provided.
 * 
 * **Validates: Requirements 4.2, 4.5, 4.6**
 * 
 * @param {Object} partialState - Partial state properties to update
 */
function setState(partialState) {
    if (typeof partialState !== 'object' || partialState === null) {
        return;
    }
    
    Object.assign(AppState, partialState);
    
    // Automatically recalculate total balance if transactions changed
    if (partialState.transactions && !('totalBalance' in partialState)) {
        AppState.totalBalance = calculateTotalBalance(AppState.transactions);
    }
    
    // Automatically recalculate category totals if transactions changed
    if (partialState.transactions && !('categoryTotals' in partialState)) {
        AppState.categoryTotals = calculateCategoryTotals(AppState.transactions);
    }
    
    // Notify all subscribers of state change
    const currentState = getState();
    stateSubscribers.forEach(listener => {
        try {
            listener(currentState);
        } catch (error) {
            console.error('Error executing state subscriber callback:', error);
        }
    });
}

/**
 * Subscribes a listener function to state changes.
 * Returns an unsubscribe function to remove the listener.
 * 
 * @param {Function} listener - Callback invoked with new state on changes
 * @returns {Function} Unsubscribe function
 */
function subscribe(listener) {
    if (typeof listener !== 'function') {
        return () => {};
    }
    stateSubscribers.add(listener);
    return () => {
        stateSubscribers.delete(listener);
    };
}

// ============================================================================
// Task 5: Validation Service
// Requirements: 1.1, 1.2, 1.4, 1.6, 9.1, 9.2, 9.3, 9.4
// ============================================================================

/**
 * Validates an item name input.
 * - Min length: 1 character (after trimming whitespace and stripping HTML tags)
 * - Max length: 100 characters
 * 
 * **Validates: Requirements 1.1, 1.4, 9.2**
 * 
 * @param {string} value - Raw item name string
 * @returns {{isValid: boolean, error: string|null, value: string}} Validation result
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
}

function validateItemName(value) {
    if (typeof value !== 'string') {
        return {
            isValid: false,
            error: 'Item name must be 1-100 characters',
            value: ''
        };
    }
    
    const sanitized = sanitizeInput(value);
    if (sanitized.length < 1 || sanitized.length > 100) {
        return {
            isValid: false,
            error: 'Item name must be 1-100 characters',
            value: sanitized
        };
    }
    
    return {
        isValid: true,
        error: null,
        value: sanitized
    };
}

/**
 * Validates an amount input.
 * - Must be a positive numeric value greater than 0
 * - Maximum value: 9,999,999.99
 * - Rounds to at most 2 decimal places using round half-up
 * 
 * **Validates: Requirements 1.1, 1.6, 9.1, 9.3**
 * 
 * @param {number|string} value - Raw amount input
 * @returns {{isValid: boolean, error: string|null, value: number}} Validation result
 */
function validateAmount(value) {
    if (value === null || value === undefined || value === '') {
        return {
            isValid: false,
            error: 'Amount must be greater than 0',
            value: 0
        };
    }
    
    const num = typeof value === 'number' ? value : parseFloat(value);
    
    if (isNaN(num) || num <= 0) {
        return {
            isValid: false,
            error: 'Amount must be greater than 0',
            value: 0
        };
    }
    
    if (num > 9999999.99) {
        return {
            isValid: false,
            error: 'Amount cannot exceed 9,999,999.99',
            value: num
        };
    }
    
    const rounded = roundToTwoDecimals(num);
    return {
        isValid: true,
        error: null,
        value: rounded
    };
}

/**
 * Validates a category selection.
 * - Must be one of predefined categories: Food, Transport, Fun
 * 
 * **Validates: Requirements 1.2, 9.4**
 * 
 * @param {string} value - Selected category
 * @returns {{isValid: boolean, error: string|null, value: string}} Validation result
 */
function validateCategory(value) {
    if (!value || !activeCategories.includes(value)) {
        return {
            isValid: false,
            error: 'Please select a valid category',
            value: value || ''
        };
    }
    
    return {
        isValid: true,
        error: null,
        value: value
    };
}

/**
 * Validates a custom category name.
 * - Min length: 1 character (after sanitize)
 * - Max length: 30 characters
 * - Uniqueness: Case-insensitive unique among all active categories
 * 
 * **Validates: Requirement 15.1, 15.2**
 * 
 * @param {string} value - Raw custom category name
 * @returns {{isValid: boolean, error: string|null, value: string}} Validation result
 */
function validateCustomCategoryName(value) {
    if (typeof value !== 'string') {
        return {
            isValid: false,
            error: 'Category name must be 1-30 characters',
            value: ''
        };
    }

    const sanitized = sanitizeInput(value);
    if (sanitized.length < 1 || sanitized.length > 30) {
        return {
            isValid: false,
            error: 'Category name must be 1-30 characters',
            value: sanitized
        };
    }

    const lower = sanitized.toLowerCase();
    const exists = activeCategories.some(c => c.toLowerCase() === lower);
    if (exists) {
        return {
            isValid: false,
            error: `Category "${sanitized}" already exists`,
            value: sanitized
        };
    }

    return {
        isValid: true,
        error: null,
        value: sanitized
    };
}

/**
 * Validates a budget limit input.
 * - If empty: Valid (clears limit)
 * - Number between 0.01 and 99,999,999.99
 * 
 * **Validates: Requirement 12.1**
 * 
 * @param {number|string|null} value - Raw budget input
 * @returns {{isValid: boolean, error: string|null, value: number|null}} Validation result
 */
function validateBudgetLimit(value) {
    if (value === null || value === undefined || value === '') {
        return { isValid: true, error: null, value: null };
    }

    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num) || num <= 0) {
        return {
            isValid: false,
            error: 'Budget limit must be greater than 0',
            value: 0
        };
    }

    if (num > 99999999.99) {
        return {
            isValid: false,
            error: 'Budget limit cannot exceed 99,999,999.99',
            value: num
        };
    }

    return {
        isValid: true,
        error: null,
        value: roundToTwoDecimals(num)
    };
}

/**
 * Validates a complete transaction form submission.
 * Combines field validations and collects field-specific errors.
 * 
 * **Validates: Requirements 1.4, 1.6**
 * 
 * @param {Object} data - Transaction form data { itemName, amount, category }
 * @returns {{isValid: boolean, errors: Object, errorsMap: Map<string, string>, values: Object|null}}
 */
function validateTransaction(data) {
    const errors = {};
    const errorsMap = new Map();
    
    if (!data || typeof data !== 'object') {
        const defaultMsg = 'Invalid transaction data';
        return {
            isValid: false,
            errors: { form: defaultMsg },
            errorsMap: new Map([['form', defaultMsg]]),
            values: null
        };
    }
    
    const nameResult = validateItemName(data.itemName);
    if (!nameResult.isValid) {
        errors.itemName = nameResult.error;
        errorsMap.set('itemName', nameResult.error);
    }
    
    const amountResult = validateAmount(data.amount);
    if (!amountResult.isValid) {
        errors.amount = amountResult.error;
        errorsMap.set('amount', amountResult.error);
    }
    
    const categoryResult = validateCategory(data.category);
    if (!categoryResult.isValid) {
        errors.category = categoryResult.error;
        errorsMap.set('category', categoryResult.error);
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    return {
        isValid,
        errors,
        errorsMap,
        values: isValid ? {
            itemName: nameResult.value,
            amount: amountResult.value,
            category: categoryResult.value
        } : null
    };
}

// ============================================================================
// Task 6: Local Storage Service
// Requirements: 6.1, 6.2, 6.3, 6.5, 6.6
// ============================================================================

/**
 * Storage key constants
 */
const STORAGE_VERSION_KEY = 'expense_visualizer_version';
const CURRENT_STORAGE_VERSION = '1.0';

/**
 * Checks whether the browser Local Storage API is available and writable.
 * 
 * **Validates: Requirement 6.5**
 * 
 * @returns {boolean} True if Local Storage is available, false otherwise
 */
function isStorageAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        return retrieved === testKey;
    } catch (error) {
        return false;
    }
}

/**
 * Validates a transaction object against the expected schema.
 * 
 * **Validates: Requirement 6.6**
 * 
 * @param {*} t - Potential transaction object
 * @returns {boolean} True if schema matches valid transaction
 */
function isValidTransactionSchema(t) {
    if (!t || typeof t !== 'object') return false;
    if (typeof t.id !== 'string' || t.id.trim() === '') return false;
    if (typeof t.itemName !== 'string' || t.itemName.trim().length < 1 || t.itemName.trim().length > 100) return false;
    if (typeof t.amount !== 'number' || isNaN(t.amount) || t.amount <= 0 || t.amount > 9999999.99) return false;
    if (typeof t.category !== 'string' || !CATEGORIES.includes(t.category)) return false;
    if (typeof t.createdAt !== 'string' || isNaN(new Date(t.createdAt).getTime())) return false;
    return true;
}

/**
 * Saves transactions to browser Local Storage.
 * Handles storage full (QuotaExceededError) and other exceptions gracefully.
 * 
 * **Validates: Requirements 6.1, 6.5**
 * 
 * @param {Array<Object>} transactions - Array of transaction objects
 * @returns {{success: boolean, error?: string}} Operation result
 */
function saveToStorage(transactions) {
    if (!isStorageAvailable()) {
        return {
            success: false,
            error: 'Local Storage is unavailable. Data kept in memory only.'
        };
    }
    
    try {
        if (!Array.isArray(transactions)) {
            return {
                success: false,
                error: 'Invalid data format: transactions must be an array'
            };
        }
        
        const serialized = JSON.stringify(transactions);
        localStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
        return { success: true };
    } catch (error) {
        let errorMsg = 'Unable to save data to Local Storage';
        if (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014) {
            errorMsg = 'Local Storage is full. Unable to save data.';
        }
        console.error('Storage save error:', error);
        return {
            success: false,
            error: errorMsg
        };
    }
}

/**
 * Loads transactions from Local Storage.
 * Validates JSON structure and schema, discards corrupted entries, and logs corruption.
 * 
 * **Validates: Requirements 6.3, 6.6**
 * 
 * @returns {{success: boolean, data: Array<Object>, corruptedCount?: number, error?: string}}
 */
function loadFromStorage() {
    if (!isStorageAvailable()) {
        return {
            success: false,
            data: [],
            error: 'Local Storage is unavailable'
        };
    }
    
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return { success: true, data: [] };
        }
        
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (jsonErr) {
            console.error('Data corruption detected: Invalid JSON in Local Storage', jsonErr);
            return {
                success: false,
                data: [],
                error: 'Data corruption detected: Invalid JSON in Local Storage'
            };
        }
        
        if (!Array.isArray(parsed)) {
            console.error('Data corruption detected: Data in storage is not an array', parsed);
            return {
                success: false,
                data: [],
                error: 'Data corruption detected: Root storage format must be an array'
            };
        }
        
        const validTransactions = [];
        let corruptedCount = 0;
        
        for (const item of parsed) {
            if (isValidTransactionSchema(item)) {
                validTransactions.push(item);
            } else {
                corruptedCount++;
                console.warn('Data corruption detected: Discarding corrupted transaction entry', item);
            }
        }
        
        return {
            success: true,
            data: validTransactions,
            corruptedCount
        };
    } catch (error) {
        console.error('Storage load error:', error);
        return {
            success: false,
            data: [],
            error: 'Failed to retrieve transactions from Local Storage'
        };
    }
}

/**
 * Deletes a single transaction from Local Storage by its identifier.
 * 
 * **Validates: Requirement 6.2**
 * 
 * @param {string} id - Transaction unique identifier
 * @returns {{success: boolean, error?: string}} Operation result
 */
function deleteFromStorage(id) {
    const loadResult = loadFromStorage();
    if (!loadResult.success) {
        return { success: false, error: loadResult.error };
    }
    
    const filtered = loadResult.data.filter(t => t.id !== id);
    return saveToStorage(filtered);
}

/**
 * Clears all transaction data from Local Storage.
 * 
 * @returns {{success: boolean, error?: string}} Operation result
 */
function clearStorage() {
    if (!isStorageAvailable()) {
        return { success: false, error: 'Local Storage is unavailable' };
    }
    
    try {
        localStorage.removeItem(STORAGE_KEY);
        return { success: true };
    } catch (error) {
        console.error('Storage clear error:', error);
        return { success: false, error: 'Failed to clear Local Storage' };
    }
}

// ============================================================================
// Task 7: Transaction Service Layer
// Requirements: 1.3, 2.1, 3.4, 3.5, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3
// ============================================================================

/**
 * Adds a new transaction to the application.
 * - Generates a unique UUID v4 identifier
 * - Attaches an ISO 8601 timestamp
 * - Adds transaction to state (newest first)
 * - Recalculates total balance and category totals
 * - Persists updated list to Local Storage
 * - Notifies UI subscribers via state management
 * 
 * **Validates: Requirements 1.3, 4.3, 5.3, 6.1**
 * 
 * @param {Object} data - Form data with itemName, amount, and category
 * @returns {Object} Newly created transaction object
 */
function addTransaction(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid transaction data provided to addTransaction');
    }
    
    const newTransaction = {
        id: generateId(),
        itemName: String(data.itemName || '').trim(),
        amount: roundToTwoDecimals(Number(data.amount)),
        category: data.category,
        createdAt: new Date().toISOString()
    };
    
    const currentTransactions = getState().transactions;
    const updatedTransactions = [newTransaction, ...currentTransactions];
    const totalBalance = calculateTotalBalance(updatedTransactions);
    const categoryTotals = calculateCategoryTotals(updatedTransactions);
    
    // Update state and trigger reactive subscriber notifications
    setState({
        transactions: updatedTransactions,
        totalBalance,
        categoryTotals
    });
    
    // Persist to Local Storage (Req 6.1, 6.5)
    const saveResult = saveToStorage(updatedTransactions);
    if (!saveResult.success) {
        displayStorageNotification(saveResult.error || 'Data could not be saved to Local Storage. Retained in memory.');
    } else {
        clearStorageNotification();
    }
    
    return newTransaction;
}

/**
 * Deletes a transaction by its unique identifier.
 * - Removes transaction from state
 * - Recalculates total balance and category totals
 * - Persists changes to Local Storage
 * - Notifies UI subscribers of state change
 * 
 * **Validates: Requirements 3.4, 3.5, 4.4, 5.4, 6.2**
 * 
 * @param {string} id - Unique identifier of the transaction to delete
 * @returns {boolean} True if deletion succeeded, false if transaction not found
 */
function deleteTransaction(id) {
    const currentTransactions = getState().transactions;
    const exists = currentTransactions.some(t => t.id === id);
    if (!exists) {
        return false;
    }
    
    const updatedTransactions = currentTransactions.filter(t => t.id !== id);
    const totalBalance = calculateTotalBalance(updatedTransactions);
    const categoryTotals = calculateCategoryTotals(updatedTransactions);
    
    // Update state and trigger reactive subscriber notifications
    setState({
        transactions: updatedTransactions,
        totalBalance,
        categoryTotals
    });
    
    // Persist updated list to Local Storage (Req 6.2, 6.5)
    const saveResult = saveToStorage(updatedTransactions);
    if (!saveResult.success) {
        displayStorageNotification(saveResult.error || 'Data could not be updated in Local Storage. Retained in memory.');
    } else {
        clearStorageNotification();
    }
    
    return true;
}

// ============================================================================
// Task 15: Optional Challenges Feature Modules
// Requirements: 11 (Theme), 12 (Budget), 13 (Sorting), 14 (Monthly), 15 (Custom Categories)
// ============================================================================

// ----------------------------------------------------------------------------
// 15.1 Dark/Light Mode Theme Architecture (Req 11)
// ----------------------------------------------------------------------------

/**
 * Retrieves the stored theme preference or falls back to system preference.
 * 
 * **Validates: Requirement 11.3, 11.4**
 * 
 * @returns {'light'|'dark'} Active theme string
 */
function getStoredTheme() {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
            return stored;
        }
    } catch (e) {
        console.error('Error reading theme from storage:', e);
    }

    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

/**
 * Applies the specified theme to the DOM and persists in Local Storage.
 * 
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.5**
 * 
 * @param {'light'|'dark'} theme - Theme to apply
 */
function applyTheme(theme) {
    const targetTheme = (theme === 'dark') ? 'dark' : 'light';
    
    if (typeof document !== 'undefined') {
        if (document.documentElement && typeof document.documentElement.setAttribute === 'function') {
            document.documentElement.setAttribute('data-theme', targetTheme);
        }
        if (document.body && typeof document.body.setAttribute === 'function') {
            document.body.setAttribute('data-theme', targetTheme);
        }
        const themeText = document.getElementById('theme-text');
        if (themeText) {
            themeText.textContent = targetTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-pressed', targetTheme === 'dark' ? 'true' : 'false');
        }
    }

    setState({ theme: targetTheme });

    try {
        localStorage.setItem(THEME_STORAGE_KEY, targetTheme);
    } catch (e) {
        console.error('Failed to save theme to storage:', e);
    }
}

/**
 * Toggles the theme between light and dark mode.
 * 
 * **Validates: Requirement 11.2**
 * 
 * @returns {'light'|'dark'} The newly active theme
 */
function toggleTheme() {
    const currentTheme = getState().theme || getStoredTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    return newTheme;
}

/**
 * Initializes the theme on application load.
 * 
 * **Validates: Requirement 11.4**
 */
function initTheme() {
    const theme = getStoredTheme();
    applyTheme(theme);
}

// ----------------------------------------------------------------------------
// 15.2 Spending Budget Limit & Threshold Alert System (Req 12)
// ----------------------------------------------------------------------------

/**
 * Loads the stored budget limit from Local Storage.
 * 
 * **Validates: Requirement 12.2**
 * 
 * @returns {number|null} Stored budget limit or null if none set
 */
function loadBudgetLimitFromStorage() {
    try {
        const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
        if (stored !== null && stored !== '') {
            const val = parseFloat(stored);
            if (!isNaN(val) && val > 0) {
                return roundToTwoDecimals(val);
            }
        }
    } catch (e) {
        console.error('Error reading budget limit from storage:', e);
    }
    return null;
}

/**
 * Persists the budget limit to Local Storage.
 * 
 * **Validates: Requirement 12.2, 12.5**
 * 
 * @param {number|null} limit - Numeric budget limit or null to remove
 * @returns {boolean} Success status
 */
function saveBudgetLimitToStorage(limit) {
    try {
        if (limit === null || limit === undefined) {
            localStorage.removeItem(BUDGET_STORAGE_KEY);
        } else {
            localStorage.setItem(BUDGET_STORAGE_KEY, String(limit));
        }
        return true;
    } catch (e) {
        console.error('Error saving budget limit to storage:', e);
        return false;
    }
}

/**
 * Sets and validates a new budget limit.
 * 
 * **Validates: Requirements 12.1, 12.2**
 * 
 * @param {number|string} limit - Budget limit input
 * @returns {{success: boolean, error: string|null, budgetLimit: number|null}}
 */
function setBudgetLimit(limit) {
    const validation = validateBudgetLimit(limit);
    if (!validation.isValid) {
        return { success: false, error: validation.error, budgetLimit: null };
    }

    const newLimit = validation.value;
    saveBudgetLimitToStorage(newLimit);
    setState({ budgetLimit: newLimit });
    renderBudgetStatus();
    return { success: true, error: null, budgetLimit: newLimit };
}

/**
 * Clears the active budget limit.
 * 
 * **Validates: Requirement 12.5**
 */
function clearBudgetLimit() {
    saveBudgetLimitToStorage(null);
    setState({ budgetLimit: null });
    renderBudgetStatus();
    const input = document.getElementById('budget-limit-input');
    if (input) input.value = '';
}

/**
 * Renders budget threshold status indicators, progress bar, and card borders.
 * 
 * Thresholds:
 * - < 80%: Safe (green badge, normal fill)
 * - 80% to 100%: Warning (orange badge, cautionary fill)
 * - > 100%: Exceeded (pulsing red badge, exceeded fill, card border warning)
 * 
 * **Validates: Requirements 12.3, 12.4, 12.5**
 * 
 * @param {number} [totalSpending] - Current spending amount
 * @param {number|null} [budgetLimit] - Budget limit threshold
 */
function renderBudgetStatus(totalSpending, budgetLimit) {
    const state = getState();
    const spending = typeof totalSpending === 'number' ? totalSpending : state.totalBalance;
    const limit = budgetLimit !== undefined ? budgetLimit : state.budgetLimit;

    const badge = document.getElementById('budget-status-badge');
    const limitDisplay = document.getElementById('budget-limit-display');
    const usageDisplay = document.getElementById('budget-usage-display');
    const progressTrack = document.getElementById('budget-progress-track');
    const progressFill = document.getElementById('budget-progress-fill');
    const clearBtn = document.getElementById('btn-clear-budget');
    const balanceSection = (typeof document !== 'undefined' && typeof document.querySelector === 'function') 
        ? document.querySelector('.balance-section') 
        : null;

    if (!badge) return;

    if (limit === null || limit === undefined || limit <= 0) {
        badge.textContent = 'No limit set';
        badge.className = 'budget-badge budget-badge-neutral';
        if (limitDisplay) limitDisplay.textContent = 'Monthly Budget: Not set';
        if (usageDisplay) usageDisplay.textContent = '0% used';
        if (progressTrack) progressTrack.setAttribute('aria-valuenow', '0');
        if (progressFill) {
            progressFill.style.width = '0%';
            progressFill.className = 'budget-progress-fill';
        }
        if (clearBtn) clearBtn.hidden = true;
        if (balanceSection) balanceSection.classList.remove('budget-exceeded-border');
        return;
    }

    if (clearBtn) clearBtn.hidden = false;
    if (limitDisplay) limitDisplay.textContent = `Monthly Budget: ${formatCurrency(limit)}`;

    const ratio = (spending / limit) * 100;
    const clampedPercent = Math.min(Math.max(ratio, 0), 100);

    if (usageDisplay) usageDisplay.textContent = `${ratio.toFixed(1)}% used`;
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', Math.min(Math.round(ratio), 100).toString());
    if (progressFill) progressFill.style.width = `${clampedPercent}%`;

    if (ratio > 100) {
        badge.textContent = `Exceeded (+${formatCurrency(spending - limit)})`;
        badge.className = 'budget-badge budget-badge-exceeded';
        if (progressFill) progressFill.className = 'budget-progress-fill fill-exceeded';
        if (balanceSection) balanceSection.classList.add('budget-exceeded-border');
    } else if (ratio >= 80) {
        badge.textContent = 'Warning (≥80%)';
        badge.className = 'budget-badge budget-badge-warning';
        if (progressFill) progressFill.className = 'budget-progress-fill fill-warning';
        if (balanceSection) balanceSection.classList.remove('budget-exceeded-border');
    } else {
        badge.textContent = 'Safe (<80%)';
        badge.className = 'budget-badge budget-badge-safe';
        if (progressFill) progressFill.className = 'budget-progress-fill fill-safe';
        if (balanceSection) balanceSection.classList.remove('budget-exceeded-border');
    }
}

// ----------------------------------------------------------------------------
// 15.3 Transaction Sorting Pipeline (Req 13)
// ----------------------------------------------------------------------------

/**
 * Sorts an array of transactions without mutating the source list.
 * 
 * Supported Sort Options:
 * - 'date-desc': Newest first (default)
 * - 'date-asc': Oldest first
 * - 'amount-desc': Highest amount to lowest
 * - 'amount-asc': Lowest amount to highest
 * - 'category-asc': Category alphabetically A to Z
 * 
 * **Validates: Requirements 13.1, 13.2, 13.3, 13.4**
 * 
 * @param {Array<Object>} transactions - List of transactions
 * @param {string} [sortOption] - Sort key
 * @returns {Array<Object>} Sorted non-mutated transactions array
 */
function sortTransactionsList(transactions, sortOption) {
    if (!Array.isArray(transactions)) return [];
    const sorted = [...transactions];
    const option = sortOption || getState().sortOption || 'date-desc';

    switch (option) {
        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'amount-desc':
            return sorted.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
        case 'amount-asc':
            return sorted.sort((a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0));
        case 'category-asc':
            return sorted.sort((a, b) => {
                const cmp = (a.category || '').localeCompare(b.category || '');
                if (cmp !== 0) return cmp;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        case 'date-desc':
        default:
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}

// ----------------------------------------------------------------------------
// 15.4 Monthly Summary View & Period Filter (Req 14)
// ----------------------------------------------------------------------------

/**
 * Detects all distinct calendar months from transaction timestamps.
 * 
 * **Validates: Requirement 14.3**
 * 
 * @param {Array<Object>} transactions - List of transactions
 * @returns {Array<string>} Array of year-month keys (e.g. ['2026-10', '2026-09'])
 */
function getAvailableMonths(transactions) {
    const months = new Set();
    if (Array.isArray(transactions)) {
        for (const t of transactions) {
            if (t.createdAt && typeof t.createdAt === 'string' && t.createdAt.length >= 7) {
                months.add(t.createdAt.substring(0, 7));
            }
        }
    }
    return Array.from(months).sort().reverse();
}

/**
 * Formats a 'YYYY-MM' key into human-readable label (e.g. 'October 2026').
 * 
 * @param {string} yearMonth - 'YYYY-MM' or 'all'
 * @returns {string} Formatted month string
 */
function formatMonthLabel(yearMonth) {
    if (!yearMonth || yearMonth === 'all') return 'All Time';
    const [year, month] = yearMonth.split('-');
    if (!year || !month) return yearMonth;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    if (isNaN(date.getTime())) return yearMonth;
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/**
 * Updates the period filter dropdown with all recorded months.
 * 
 * **Validates: Requirements 14.1, 14.3**
 * 
 * @param {Array<Object>} [transactions] - Transactions list
 */
function updateMonthFilterDropdown(transactions) {
    const select = document.getElementById('month-filter');
    if (!select || typeof select.appendChild !== 'function') return;
    const currentVal = getState().monthFilter || 'all';
    const availableMonths = getAvailableMonths(transactions || getState().transactions);

    select.innerHTML = '<option value="all">All Time</option>';
    for (const m of availableMonths) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = formatMonthLabel(m);
        if (m === currentVal) {
            opt.selected = true;
        }
        select.appendChild(opt);
    }

    if (currentVal !== 'all' && !availableMonths.includes(currentVal)) {
        select.value = 'all';
        setState({ monthFilter: 'all' });
    }
}

/**
 * Filters transactions matching a specific year-month period.
 * 
 * **Validates: Requirement 14.2**
 * 
 * @param {Array<Object>} transactions - List of transactions
 * @param {string} monthKey - 'YYYY-MM' or 'all'
 * @returns {Array<Object>} Filtered transactions list
 */
function filterTransactionsByMonth(transactions, monthKey) {
    if (!Array.isArray(transactions)) return [];
    if (!monthKey || monthKey === 'all') return [...transactions];
    return transactions.filter(t => t.createdAt && t.createdAt.startsWith(monthKey));
}

/**
 * Returns filtered and sorted transactions according to active filter and sort preferences.
 * 
 * @param {Array<Object>} [customTransactions] - Optional transaction set
 * @param {string} [customMonth] - Optional period filter
 * @param {string} [customSort] - Optional sort key
 * @returns {Array<Object>} Filtered and sorted transactions
 */
function getFilteredAndSortedTransactions(customTransactions, customMonth, customSort) {
    const txs = customTransactions || getState().transactions;
    const month = customMonth !== undefined ? customMonth : getState().monthFilter;
    const sort = customSort !== undefined ? customSort : getState().sortOption;

    const filtered = filterTransactionsByMonth(txs, month);
    return sortTransactionsList(filtered, sort);
}

/**
 * Renders the monthly summary card and updates period badges.
 * 
 * **Validates: Requirements 14.2, 14.4**
 * 
 * @param {Array<Object>} [filteredTransactions] - Filtered transaction list
 * @param {string} [selectedMonth] - Active month key
 */
function renderMonthlySummary(filteredTransactions, selectedMonth) {
    const card = document.getElementById('monthly-summary-card');
    const periodEl = document.getElementById('monthly-summary-period');
    const amountEl = document.getElementById('monthly-summary-amount');
    const countEl = document.getElementById('monthly-summary-count');
    const chartBadge = document.getElementById('chart-period-badge');

    const month = selectedMonth !== undefined ? selectedMonth : getState().monthFilter;
    const items = filteredTransactions || filterTransactionsByMonth(getState().transactions, month);

    if (chartBadge) {
        chartBadge.textContent = formatMonthLabel(month);
    }

    if (!card) return;

    if (!month || month === 'all') {
        card.hidden = true;
        return;
    }

    card.hidden = false;
    if (periodEl) periodEl.textContent = formatMonthLabel(month);
    const monthTotal = calculateTotalBalance(items);
    if (amountEl) amountEl.textContent = formatCurrency(monthTotal);
    if (countEl) countEl.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
}

// ----------------------------------------------------------------------------
// 15.5 Custom Categories Management (Req 15)
// ----------------------------------------------------------------------------

/**
 * Loads custom categories stored in Local Storage.
 * 
 * **Validates: Requirement 15.3**
 * 
 * @returns {Array<{name: string, color: string, isCustom: boolean}>}
 */
function loadCustomCategoriesFromStorage() {
    try {
        const raw = localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(item => item && typeof item.name === 'string');
    } catch (e) {
        console.error('Failed to load custom categories:', e);
        return [];
    }
}

/**
 * Persists custom categories to Local Storage.
 * 
 * **Validates: Requirement 15.3**
 * 
 * @param {Array<Object>} categories - List of custom categories
 * @returns {boolean} Success status
 */
function saveCustomCategoriesToStorage(categories) {
    try {
        localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        return true;
    } catch (e) {
        console.error('Failed to save custom categories:', e);
        return false;
    }
}

/**
 * Populates category selection dropdown with active categories.
 * 
 * **Validates: Requirement 15.3**
 * 
 * @param {string} [selectedName] - Optional category to select
 */
function updateCategorySelectOptions(selectedName) {
    const selectEl = document.getElementById('category');
    if (!selectEl || typeof selectEl.appendChild !== 'function') return;
    const currentVal = selectedName || selectEl.value;

    selectEl.innerHTML = '<option value="">Select category</option>';
    for (const cat of activeCategories) {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        if (cat === currentVal) {
            opt.selected = true;
        }
        selectEl.appendChild(opt);
    }
}

/**
 * Initializes custom categories from storage into memory registry.
 * 
 * **Validates: Requirement 15.3, 15.5**
 */
function initCustomCategories() {
    const saved = loadCustomCategoriesFromStorage();
    for (const cat of saved) {
        if (!activeCategories.includes(cat.name)) {
            activeCategories.push(cat.name);
        }
        activeCategoryColors[cat.name] = cat.color || generateDeterministicColor(cat.name);
    }
    updateCategorySelectOptions();
    setState({ customCategories: saved });
}

/**
 * Creates and registers a new custom category.
 * 
 * **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**
 * 
 * @param {string} name - Raw category name
 * @param {string} [color] - Optional hex color
 * @returns {{success: boolean, error?: string, category?: Object}}
 */
function addCustomCategory(name, color) {
    const validation = validateCustomCategoryName(name);
    if (!validation.isValid) {
        return { success: false, error: validation.error };
    }

    const validName = validation.value;
    const validColor = (color && color.startsWith('#') && color.length >= 4) ? color : generateDeterministicColor(validName);

    const currentList = getState().customCategories || [];
    const updatedList = [...currentList, { name: validName, color: validColor, isCustom: true }];

    if (!activeCategories.includes(validName)) {
        activeCategories.push(validName);
    }
    activeCategoryColors[validName] = validColor;

    saveCustomCategoriesToStorage(updatedList);
    setState({ customCategories: updatedList });

    updateCategorySelectOptions(validName);
    renderLegend();
    return { success: true, category: { name: validName, color: validColor } };
}

/**
 * Retrieves all stored transactions, filtered and sorted according to current settings.
 * 
 * **Validates: Requirements 2.1, 6.3, 13.1, 14.2**
 * 
 * @param {string} [filterMonth] - Optional month filter (defaults to state monthFilter)
 * @param {string} [sortOption] - Optional sort key (defaults to state sortOption)
 * @returns {Array<Object>} Filtered and sorted list of transactions
 */
function getAllTransactions(filterMonth, sortOption) {
    const month = filterMonth !== undefined ? filterMonth : (getState().monthFilter || 'all');
    const sort = sortOption !== undefined ? sortOption : (getState().sortOption || 'date-desc');
    return getFilteredAndSortedTransactions(getState().transactions, month, sort);
}

// ============================================================================
// Task 8: UI Render Functions
// Requirements: 1.4, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.1, 9.2
// ============================================================================

/**
 * Renders the total balance in the balance section.
 * Updates immediately (< 100ms) with currency formatted value.
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
 * 
 * @param {number} [total] - Total amount to display (defaults to state totalBalance)
 */
function renderBalance(total) {
    const balanceElement = document.getElementById('total-balance');
    if (!balanceElement) return;
    
    const balanceValue = typeof total === 'number' ? total : getState().totalBalance;
    balanceElement.textContent = formatCurrency(balanceValue);
}

/**
 * Creates a DOM element representing a single transaction item card.
 * Uses textContent to prevent XSS vulnerabilities.
 * 
 * **Validates: Requirements 2.2, 3.1, 10.3**
 * 
 * @param {Object} transaction - Transaction data object
 * @returns {HTMLElement} DOM element for the transaction item
 */
function createTransactionItemElement(transaction) {
    const itemEl = document.createElement('div');
    itemEl.className = 'transaction-item';
    itemEl.setAttribute('role', 'listitem');
    itemEl.setAttribute('data-id', transaction.id);

    // Left container: Item name and category badge
    const infoEl = document.createElement('div');
    infoEl.className = 'transaction-info';

    const nameEl = document.createElement('span');
    nameEl.className = 'transaction-name';
    nameEl.textContent = transaction.itemName;

    const categoryEl = document.createElement('span');
    const catClass = transaction.category ? transaction.category.toLowerCase().replace(/\s+/g, '-') : '';
    categoryEl.className = `transaction-category category-badge category-${catClass} ${transaction.category || ''}`;
    categoryEl.setAttribute('data-category', transaction.category || '');
    categoryEl.textContent = transaction.category || '';

    // Apply category color for custom categories or dynamic theme contrast
    const catColor = getCategoryColor(transaction.category);
    if (catColor && !['food', 'transport', 'fun'].includes(catClass)) {
        categoryEl.style.backgroundColor = `${catColor}20`;
        categoryEl.style.borderColor = catColor;
        categoryEl.style.borderLeft = `3px solid ${catColor}`;
    }

    infoEl.appendChild(nameEl);
    infoEl.appendChild(categoryEl);

    // Right container: Formatted amount and delete button
    const metaEl = document.createElement('div');
    metaEl.className = 'transaction-meta';

    const amountEl = document.createElement('span');
    amountEl.className = 'transaction-amount';
    amountEl.textContent = formatCurrency(transaction.amount);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete transaction-delete-btn';
    deleteBtn.setAttribute('data-id', transaction.id);
    deleteBtn.setAttribute('aria-label', `Delete ${transaction.itemName} transaction`);
    deleteBtn.textContent = '✕';

    metaEl.appendChild(amountEl);
    metaEl.appendChild(deleteBtn);

    itemEl.appendChild(infoEl);
    itemEl.appendChild(metaEl);

    return itemEl;
}

/**
 * Renders the scrollable transaction list container.
 * Displays empty state message if no transactions exist.
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 * 
 * @param {Array<Object>} [transactions] - Transactions to render (defaults to getAllTransactions())
 */
function renderTransactionList(transactions) {
    const listContainer = document.getElementById('transactions-list-container');
    const emptyMessage = document.getElementById('transactions-empty-message');
    if (!listContainer) return;

    const items = Array.isArray(transactions) ? transactions : getAllTransactions();

    if (items.length === 0) {
        listContainer.innerHTML = '';
        if (emptyMessage) {
            emptyMessage.hidden = false;
        }
        return;
    }

    if (emptyMessage) {
        emptyMessage.hidden = true;
    }

    // Build DOM nodes using DocumentFragment for maximum performance
    const fragment = document.createDocumentFragment();
    for (const transaction of items) {
        fragment.appendChild(createTransactionItemElement(transaction));
    }

    listContainer.innerHTML = '';
    listContainer.appendChild(fragment);
}

/**
 * Maps field key names to their HTML input and error element IDs.
 */
const FIELD_ID_MAP = Object.freeze({
    itemName: 'item-name',
    amount: 'amount',
    category: 'category'
});

/**
 * Renders or clears an error on a specific form input field.
 * 
 * **Validates: Requirements 1.4, 1.6, 9.1, 9.2**
 * 
 * @param {string} fieldKey - Field key ('itemName', 'amount', 'category' or direct element id)
 * @param {string|null} errorMessage - Error message to display, or null/empty to clear
 */
function renderFieldError(fieldKey, errorMessage) {
    const elementId = FIELD_ID_MAP[fieldKey] || fieldKey;
    const inputEl = document.getElementById(elementId);
    const errorEl = document.getElementById(`${elementId}-error`);

    if (errorEl) {
        errorEl.textContent = errorMessage || '';
    }

    if (inputEl) {
        if (errorMessage) {
            inputEl.classList.add('has-error');
            inputEl.setAttribute('aria-invalid', 'true');
        } else {
            inputEl.classList.remove('has-error');
            inputEl.removeAttribute('aria-invalid');
        }
    }
}

/**
 * Renders multiple validation errors onto the transaction input form.
 * 
 * @param {Object|Map<string, string>} errors - Field errors object or Map
 */
function renderErrors(errors) {
    const errorEntries = errors instanceof Map 
        ? Array.from(errors.entries()) 
        : Object.entries(errors || {});

    // Clear all fields first or update dynamically
    ['itemName', 'amount', 'category'].forEach(field => {
        renderFieldError(field, null);
    });

    for (const [field, message] of errorEntries) {
        renderFieldError(field, message);
    }
}

/**
 * Clears all validation errors from the transaction form.
 */
function clearErrors() {
    ['itemName', 'amount', 'category'].forEach(field => {
        renderFieldError(field, null);
    });
}

/**
 * Displays a user-friendly notification banner when Local Storage fails or is unavailable.
 * Data is retained in application memory.
 * 
 * **Validates: Requirement 6.5**
 * 
 * @param {string} message - Error notification text to display
 */
function displayStorageNotification(message) {
    if (typeof document === 'undefined') return;
    
    let banner = document.getElementById('storage-notification');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'storage-notification';
        banner.className = 'storage-notification';
        banner.setAttribute('role', 'alert');
        
        const formSection = document.querySelector('.form-section') || document.querySelector('.app-container');
        if (formSection && formSection.parentNode) {
            formSection.parentNode.insertBefore(banner, formSection);
        }
    }
    
    banner.innerHTML = '';
    
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message || 'Local Storage is unavailable. Data kept in memory only.';
    
    const dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'btn-dismiss';
    dismissBtn.setAttribute('aria-label', 'Dismiss notification');
    dismissBtn.textContent = '✕';
    dismissBtn.onclick = () => clearStorageNotification();
    
    banner.appendChild(msgSpan);
    banner.appendChild(dismissBtn);
    banner.hidden = false;
}

/**
 * Clears the storage notification banner.
 */
function clearStorageNotification() {
    if (typeof document === 'undefined') return;
    const banner = document.getElementById('storage-notification');
    if (banner) {
        banner.hidden = true;
    }
}

/**
 * Generic renderError function matching interface in design document.
 * Handles field errors, object error maps, or general application/storage errors.
 * 
 * **Validates: Requirements 1.4, 1.6, 6.5, 9.1, 9.2**
 * 
 * @param {Object|string} error - Error object with field/message or string
 */
function renderError(error) {
    if (!error) {
        clearErrors();
        clearStorageNotification();
        return;
    }
    
    if (typeof error === 'string') {
        console.error('Application error:', error);
        displayStorageNotification(error);
        return;
    }
    
    if (error.field) {
        renderFieldError(error.field, error.message);
    } else if (error.errors) {
        renderErrors(error.errors);
    }
}

// ============================================================================
// Task 9: Pie Chart Renderer
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.3
// ============================================================================

/**
 * Calculates pie chart segments and percentages from transaction data.
 * Handles empty transactions and zero division cleanly.
 * 
 * **Validates: Requirement 5.2**
 * 
 * @param {Array<Object>} transactions - List of transaction objects
 * @returns {Array<{category: string, amount: number, percentage: number, color: string}>}
 */
function calculatePieSegments(transactions) {
    const total = calculateTotalBalance(transactions);
    if (total === 0) {
        return [];
    }

    const categoryTotals = calculateCategoryTotals(transactions);
    const segments = [];

    for (const [category, amount] of categoryTotals) {
        if (amount > 0) {
            const percentage = roundToTwoDecimals((amount / total) * 100);
            segments.push({
                category,
                amount,
                percentage,
                color: getCategoryColor(category)
            });
        }
    }

    return segments;
}

/**
 * Draws the pie chart onto the provided canvas element using Canvas 2D API.
 * Starts segment angles from the top (-π/2 radians).
 * Handles empty chart state by rendering a subtle placeholder ring.
 * 
 * **Validates: Requirements 5.1, 5.2, 5.7, 10.3**
 * 
 * @param {HTMLCanvasElement} canvas - HTML5 Canvas element
 * @param {Array<Object>} segments - Array of pie segment objects
 */
function drawPieChart(canvas, segments) {
    if (!canvas || typeof canvas.getContext !== 'function') {
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Unable to obtain 2D canvas rendering context');
        return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Empty chart state (Req 5.7)
    if (!Array.isArray(segments) || segments.length === 0) {
        ctx.beginPath();
        const isDark = (typeof document !== 'undefined' && document.documentElement && typeof document.documentElement.getAttribute === 'function') 
            ? document.documentElement.getAttribute('data-theme') === 'dark' 
            : false;
        ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
        ctx.fill();
        ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
    }

    // Start drawing from the top (-π/2 radians)
    let startAngle = -Math.PI / 2;

    for (const segment of segments) {
        const sliceAngle = (segment.percentage / 100) * 2 * Math.PI;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();

        startAngle += sliceAngle;
    }
}

/**
 * Renders the category legend with color indicators and percentages.
 * 
 * **Validates: Requirements 5.6, 10.3, 15.4**
 * 
 * @param {Map<string, number>} [categoryTotals] - Map of category totals
 * @param {number} [totalBalance] - Total balance sum
 */
function renderLegend(categoryTotals, totalBalance) {
    const legendContainer = document.getElementById('chart-legend');
    if (!legendContainer) return;

    legendContainer.innerHTML = '';
    const filteredItems = filterTransactionsByMonth(getState().transactions, getState().monthFilter);
    const total = typeof totalBalance === 'number' ? totalBalance : calculateTotalBalance(filteredItems);
    const totalsMap = categoryTotals instanceof Map ? categoryTotals : calculateCategoryTotals(filteredItems);

    activeCategories.forEach(category => {
        const catAmount = totalsMap.get(category) || 0;
        
        // Show category if total is 0 (show default categories) or if category has spending or is a default category
        if (total === 0 || catAmount > 0 || DEFAULT_CATEGORIES.includes(category)) {
            const itemEl = document.createElement('div');
            itemEl.className = 'legend-item';

            const colorSpan = document.createElement('span');
            colorSpan.className = 'legend-color';
            colorSpan.style.backgroundColor = getCategoryColor(category);
            colorSpan.setAttribute('aria-hidden', 'true');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'legend-label';
            const percent = total > 0 ? ((catAmount / total) * 100).toFixed(1) : '0.0';
            labelSpan.textContent = `${category} (${percent}%)`;

            itemEl.appendChild(colorSpan);
            itemEl.appendChild(labelSpan);
            legendContainer.appendChild(itemEl);
        }
    });
}

/**
 * Full Pie Chart Render Function: clears canvas, draws segments, and updates legend.
 * Updates within 1 second of state change.
 * 
 * **Validates: Requirements 5.1, 5.3, 5.4, 5.5, 14.2, 15.4**
 * 
 * @param {Array<Object>} [transactions] - Transactions list (defaults to filtered state transactions)
 */
function renderPieChart(transactions) {
    const canvas = document.getElementById('pie-chart');
    const emptyMessage = document.getElementById('chart-empty-message');
    if (!canvas) return;

    const items = Array.isArray(transactions) 
        ? transactions 
        : filterTransactionsByMonth(getState().transactions, getState().monthFilter);
    const total = calculateTotalBalance(items);
    const categoryTotals = calculateCategoryTotals(items);

    if (total === 0 || items.length === 0) {
        drawPieChart(canvas, []);
        if (emptyMessage) {
            emptyMessage.hidden = false;
        }
        renderLegend(categoryTotals, 0);
        return;
    }

    if (emptyMessage) {
        emptyMessage.hidden = true;
    }

    const segments = calculatePieSegments(items);
    drawPieChart(canvas, segments);
    renderLegend(categoryTotals, total);
}

// ============================================================================
// Task 10: Event Handlers and User Interactions
// Requirements: 1.3, 1.4, 1.5, 1.6, 3.2, 3.3, 3.4, 3.5, 9.1, 9.2, 9.4
// ============================================================================

/**
 * Handles real-time input event on the item name input.
 * Clears error as soon as user types valid content if error is currently shown.
 * 
 * **Validates: Requirement 9.2**
 * 
 * @param {Event} event - Input event
 */
function handleItemNameInput(event) {
    const input = event.target;
    if (!input) return;
    
    // If the input was previously marked as error, validate live to clear or update
    if (input.classList.contains('has-error')) {
        const result = validateItemName(input.value);
        if (result.isValid) {
            renderFieldError('itemName', null);
        }
    }
}

/**
 * Handles blur event on the item name input.
 * Displays inline error message if input is invalid.
 * 
 * **Validates: Requirement 9.2**
 * 
 * @param {Event} event - Blur event
 */
function handleItemNameBlur(event) {
    const input = event.target;
    if (!input) return;
    
    // Only validate if user typed something or already has error
    if (input.value.length > 0 || input.classList.contains('has-error')) {
        const result = validateItemName(input.value);
        renderFieldError('itemName', result.isValid ? null : result.error);
    }
}

/**
 * Handles real-time input event on the amount input.
 * Clears error as soon as user types valid amount if error is currently shown.
 * 
 * **Validates: Requirements 9.1, 9.3**
 * 
 * @param {Event} event - Input event
 */
function handleAmountInput(event) {
    const input = event.target;
    if (!input) return;
    
    if (input.classList.contains('has-error')) {
        const result = validateAmount(input.value);
        if (result.isValid) {
            renderFieldError('amount', null);
        }
    }
}

/**
 * Handles blur event on the amount input.
 * Validates amount and displays inline error message if invalid.
 * 
 * **Validates: Requirements 9.1, 9.3**
 * 
 * @param {Event} event - Blur event
 */
function handleAmountBlur(event) {
    const input = event.target;
    if (!input) return;
    
    if (input.value.length > 0 || input.classList.contains('has-error')) {
        const result = validateAmount(input.value);
        renderFieldError('amount', result.isValid ? null : result.error);
    }
}

/**
 * Handles change and blur events on the category dropdown.
 * Validates category selection and updates inline error.
 * 
 * **Validates: Requirement 9.4**
 * 
 * @param {Event} event - Change or blur event
 */
function handleCategoryChange(event) {
    const select = event.target;
    if (!select) return;
    
    const result = validateCategory(select.value);
    renderFieldError('category', result.isValid ? null : result.error);
}

/**
 * Handles transaction form submission.
 * - Prevents default browser submission
 * - Collects form input values
 * - Validates all inputs using validation service
 * - Displays errors if invalid and focuses first erroneous field
 * - Adds transaction and resets form on success
 * 
 * **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
 * 
 * @param {Event} event - Form submit event
 * @returns {boolean} True if transaction added successfully, false otherwise
 */
function handleFormSubmit(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    
    const form = event && event.currentTarget 
        ? event.currentTarget 
        : document.getElementById('transaction-form');
    
    const itemNameInput = document.getElementById('item-name');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    
    const formData = {
        itemName: itemNameInput ? itemNameInput.value : '',
        amount: amountInput ? amountInput.value : '',
        category: categorySelect ? categorySelect.value : ''
    };
    
    const validationResult = validateTransaction(formData);
    
    if (!validationResult.isValid) {
        renderErrors(validationResult.errors);
        
        // Focus first field with error for accessibility and great UX
        if (validationResult.errors.itemName && itemNameInput) {
            itemNameInput.focus();
        } else if (validationResult.errors.amount && amountInput) {
            amountInput.focus();
        } else if (validationResult.errors.category && categorySelect) {
            categorySelect.focus();
        }
        
        return false;
    }
    
    // Clear any previous validation errors
    clearErrors();
    
    // Add transaction via service layer (triggers state update & persistence)
    addTransaction(validationResult.values);
    
    // Reset form fields (Req 1.5)
    if (form && typeof form.reset === 'function') {
        form.reset();
    } else {
        if (itemNameInput) itemNameInput.value = '';
        if (amountInput) amountInput.value = '';
        if (categorySelect) categorySelect.value = '';
    }
    
    // Return focus to item name for fast consecutive data entry
    if (itemNameInput) {
        itemNameInput.focus();
    }
    
    return true;
}

/**
 * Handles click events on the transaction list container using event delegation.
 * Detects delete button clicks, displays confirmation dialog, and executes deletion.
 * 
 * **Validates: Requirements 3.2, 3.3, 3.4, 3.5**
 * 
 * @param {Event} event - Click event
 * @returns {boolean} True if a transaction was deleted, false otherwise
 */
function handleDeleteClick(event) {
    if (!event || !event.target) return false;
    
    const deleteBtn = event.target.closest('.btn-delete, .transaction-delete-btn, [data-id]');
    if (!deleteBtn) return false;
    
    // Verify it is indeed a delete button
    if (!deleteBtn.classList.contains('btn-delete') && !deleteBtn.classList.contains('transaction-delete-btn')) {
        return false;
    }
    
    const transactionId = deleteBtn.getAttribute('data-id');
    if (!transactionId) return false;
    
    // Requirement 3.2: Display confirmation dialog before removing transaction
    const isConfirmed = window.confirm('Are you sure you want to delete this transaction?');
    
    // Requirement 3.3: Retain transaction if cancelled
    if (isConfirmed) {
        // Requirements 3.4, 3.5: deleteTransaction updates totalBalance and pie chart within 100ms
        return deleteTransaction(transactionId);
    }
    
    return false;
}

/**
 * Attaches real-time validation listeners to form inputs.
 * 
 * **Validates: Requirements 9.1, 9.2, 9.4**
 */
function attachInputValidationListeners() {
    const itemNameInput = document.getElementById('item-name');
    if (itemNameInput) {
        itemNameInput.addEventListener('input', handleItemNameInput);
        itemNameInput.addEventListener('blur', handleItemNameBlur);
    }
    
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', handleAmountInput);
        amountInput.addEventListener('blur', handleAmountBlur);
    }
    
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
        categorySelect.addEventListener('blur', handleCategoryChange);
    }
}

/**
 * Sets up all event listeners for user interactions across the application.
 * 
 * **Validates: Requirements 1.3, 1.4, 1.5, 3.2, 3.3, 9.1, 9.2, 9.4**
 */
function setupEventListeners() {
    // 10.1 Form submission handler
    const form = document.getElementById('transaction-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // 10.2 Delete confirmation handler via event delegation
    const listContainer = document.getElementById('transactions-list-container');
    if (listContainer) {
        listContainer.addEventListener('click', handleDeleteClick);
    }
    
    // 10.3 Input validation handlers
    attachInputValidationListeners();

    // 15.1 Theme toggle handler
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // 15.2 Budget limit form handlers
    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const budgetInput = document.getElementById('budget-limit-input');
            if (budgetInput) {
                const res = setBudgetLimit(budgetInput.value);
                if (!res.success) {
                    alert(res.error);
                } else {
                    budgetInput.value = '';
                }
            }
        });
    }

    const clearBudgetBtn = document.getElementById('btn-clear-budget');
    if (clearBudgetBtn) {
        clearBudgetBtn.addEventListener('click', clearBudgetLimit);
    }

    // 15.3 Sort select handler
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            setState({ sortOption: selected });
            const displayed = getFilteredAndSortedTransactions();
            renderTransactionList(displayed);
        });
    }

    // 15.4 Month filter handler
    const monthFilter = document.getElementById('month-filter');
    if (monthFilter) {
        monthFilter.addEventListener('change', (e) => {
            const selected = e.target.value;
            setState({ monthFilter: selected });
            const displayed = getFilteredAndSortedTransactions();
            renderTransactionList(displayed);
            renderPieChart(filterTransactionsByMonth(getState().transactions, selected));
            renderMonthlySummary(filterTransactionsByMonth(getState().transactions, selected), selected);
        });
    }

    // 15.5 Custom category creation handlers
    const toggleCustomCatBtn = document.getElementById('btn-toggle-custom-category');
    const customCatBox = document.getElementById('custom-category-box');
    const addCustomCatBtn = document.getElementById('btn-add-custom-category');
    const cancelCustomCatBtn = document.getElementById('btn-cancel-custom-category');
    const customCatNameInput = document.getElementById('custom-category-name');
    const customCatColorInput = document.getElementById('custom-category-color');
    const customCatError = document.getElementById('custom-category-error');

    if (toggleCustomCatBtn && customCatBox) {
        toggleCustomCatBtn.addEventListener('click', () => {
            const isHidden = customCatBox.hidden;
            customCatBox.hidden = !isHidden;
            toggleCustomCatBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
            if (isHidden && customCatNameInput) {
                customCatNameInput.focus();
            }
        });
    }

    if (cancelCustomCatBtn && customCatBox) {
        cancelCustomCatBtn.addEventListener('click', () => {
            customCatBox.hidden = true;
            if (toggleCustomCatBtn) toggleCustomCatBtn.setAttribute('aria-expanded', 'false');
            if (customCatError) customCatError.textContent = '';
            if (customCatNameInput) customCatNameInput.value = '';
        });
    }

    if (addCustomCatBtn) {
        addCustomCatBtn.addEventListener('click', () => {
            if (!customCatNameInput) return;
            const name = customCatNameInput.value;
            const color = customCatColorInput ? customCatColorInput.value : '#9b59b6';
            const result = addCustomCategory(name, color);
            if (result.success) {
                customCatNameInput.value = '';
                if (customCatError) customCatError.textContent = '';
                if (customCatBox) customCatBox.hidden = true;
                if (toggleCustomCatBtn) toggleCustomCatBtn.setAttribute('aria-expanded', 'false');
            } else {
                if (customCatError) customCatError.textContent = result.error;
            }
        });
    }
}

// ============================================================================
// ============================================================================
// Task 11: Application Initialization
// Requirements: 4.5, 5.5, 6.3, 6.4, 8.1
// ============================================================================

/**
 * Initializes the application state, services, and UI components.
 * 
 * Sequence:
 * 1. Verifies browser API compatibility
 * 2. Initializes active theme (Req 11.4)
 * 3. Initializes custom categories from Local Storage (Req 15.3, 15.5)
 * 4. Retrieves stored transactions & budget limit from Local Storage (Req 6.3, 12.2)
 * 5. Populates initial AppState with stored data
 * 6. Subscribes UI rendering functions to state changes
 * 7. Sets up all DOM event listeners
 * 8. Performs initial render of all UI components
 * 9. Marks application initialization as complete
 * 
 * **Validates: Requirements 4.5, 5.5, 6.3, 6.4, 8.1, 11.4, 12.2, 14.1, 15.3**
 */
function initApp() {
    console.log('Expense & Budget Visualizer initializing...');
    
    // 1. Check browser compatibility before proceeding (Req 8.1, 8.2)
    if (!checkBrowserCompatibility()) {
        console.error('Browser compatibility check failed: Required APIs not supported');
        showUnsupportedBrowserMessage();
        return;
    }
    
    console.log('Browser compatibility check passed');
    
    // 2. Initialize active theme (Req 11.4)
    initTheme();

    // 3. Initialize custom categories (Req 15.3, 15.5)
    initCustomCategories();

    // 4. Load stored transactions and budget limit from Local Storage (Req 6.3, 6.6, 12.2)
    const loadResult = loadFromStorage();
    const initialTransactions = loadResult.success ? loadResult.data : [];
    const initialBudgetLimit = loadBudgetLimitFromStorage();
    
    if (loadResult.corruptedCount && loadResult.corruptedCount > 0) {
        console.warn(`Recovered from storage corruption: ${loadResult.corruptedCount} corrupted records discarded`);
    }
    
    // 5. Initialize state manager with loaded transactions and optional challenge states
    const initialTotal = calculateTotalBalance(initialTransactions);
    const initialCategoryTotals = calculateCategoryTotals(initialTransactions);
    
    setState({
        transactions: initialTransactions,
        totalBalance: initialTotal,
        categoryTotals: initialCategoryTotals,
        budgetLimit: initialBudgetLimit,
        monthFilter: 'all',
        sortOption: 'date-desc',
        isInitialized: true
    });
    
    // 6. Register reactive state subscriber to automatically re-render components on changes
    subscribe((state) => {
        renderBalance(state.totalBalance);
        renderBudgetStatus(state.totalBalance, state.budgetLimit);
        updateMonthFilterDropdown(state.transactions);
        
        const displayed = getFilteredAndSortedTransactions();
        renderTransactionList(displayed);
        
        const monthFiltered = filterTransactionsByMonth(state.transactions, state.monthFilter);
        renderPieChart(monthFiltered);
        renderMonthlySummary(monthFiltered, state.monthFilter);
    });
    
    // 7. Wire up all DOM event listeners
    setupEventListeners();
    
    // 8. Perform initial render of all UI components
    updateMonthFilterDropdown(initialTransactions);
    renderBalance(initialTotal);
    renderBudgetStatus(initialTotal, initialBudgetLimit);
    renderTransactionList(getFilteredAndSortedTransactions(initialTransactions, 'all', 'date-desc'));
    renderPieChart(initialTransactions);
    renderMonthlySummary(initialTransactions, 'all');
    
    console.log('Expense & Budget Visualizer successfully initialized');
}

/**
 * Application Bootstrap Sequence (DOMContentLoaded Bootstrap)
 * Waits for DOM ready state, handles initialization errors gracefully,
 * and logs ready state to console.
 * 
 * **Validates: Requirement 8.1**
 */
function bootstrapApp() {
    try {
        initApp();
        console.log('Application ready state: fully initialized');
    } catch (error) {
        console.error('Fatal initialization error:', error);
    }
}

// Start the application when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrapApp);
    } else {
        bootstrapApp();
    }
}
