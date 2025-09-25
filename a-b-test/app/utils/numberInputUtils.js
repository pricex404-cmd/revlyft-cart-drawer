// Global utility functions for number input formatting

// Function to format number input by removing leading zeros and limiting decimal places
export const formatNumberInput = (value) => {
    if (value === '' || value === '0') return value;
    
    // Remove leading zeros but keep decimal points
    let trimmedValue = value.replace(/^0+/, '');
    if (trimmedValue === '' || trimmedValue === '.') return '0';
    
    // Limit to 2 decimal places
    if (trimmedValue.includes('.')) {
        const parts = trimmedValue.split('.');
        if (parts[1] && parts[1].length > 2) {
            trimmedValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
    }
    
    return trimmedValue;
};

// Function to format the display value
export const formatDisplayValue = (value) => {
    if (value === '' || value === null || value === undefined) return '0';
    return value.toString();
};

// Function to validate and format price input (max 2 decimal places)
export const formatPriceInput = (value) => {
    if (value === '' || value === '0') return value;
    
    // Remove leading zeros
    let trimmedValue = value.replace(/^0+/, '');
    if (trimmedValue === '' || trimmedValue === '.') return '0';
    
    // Ensure only numbers and one decimal point
    trimmedValue = trimmedValue.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points - keep only the first one
    const decimalIndex = trimmedValue.indexOf('.');
    if (decimalIndex !== -1) {
        const beforeDecimal = trimmedValue.substring(0, decimalIndex);
        const afterDecimal = trimmedValue.substring(decimalIndex + 1).replace(/\./g, '');
        trimmedValue = beforeDecimal + '.' + afterDecimal;
    }
    
    // Limit to 2 decimal places
    if (trimmedValue.includes('.')) {
        const parts = trimmedValue.split('.');
        if (parts[1] && parts[1].length > 2) {
            trimmedValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
    }
    
    return trimmedValue;
};

// Function to handle real-time input changes and prevent more than 2 decimal places
export const handlePriceInputChange = (value, onChange) => {
    // Allow empty string
    if (value === '') {
        onChange(value);
        return;
    }
    
    // Remove any non-numeric characters except decimal point
    let cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points - keep only the first one
    const decimalIndex = cleanValue.indexOf('.');
    if (decimalIndex !== -1) {
        const beforeDecimal = cleanValue.substring(0, decimalIndex);
        const afterDecimal = cleanValue.substring(decimalIndex + 1).replace(/\./g, '');
        cleanValue = beforeDecimal + '.' + afterDecimal;
    }
    
    // Limit to 2 decimal places in real-time
    if (cleanValue.includes('.')) {
        const parts = cleanValue.split('.');
        if (parts[1] && parts[1].length > 2) {
            cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
    }
    
    // Only call onChange if the value has changed
    if (cleanValue !== value) {
        onChange(cleanValue);
    } else {
        onChange(value);
    }
};

// Function to handle real-time percentage input changes (max 2 decimal places, max 99%)
export const handlePercentageInputChange = (value, onChange) => {
    // Allow empty string
    if (value === '') {
        onChange(value);
        return;
    }
    
    // Remove any non-numeric characters except decimal point
    let cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points - keep only the first one
    const decimalIndex = cleanValue.indexOf('.');
    if (decimalIndex !== -1) {
        const beforeDecimal = cleanValue.substring(0, decimalIndex);
        const afterDecimal = cleanValue.substring(decimalIndex + 1).replace(/\./g, '');
        cleanValue = beforeDecimal + '.' + afterDecimal;
    }
    
    // Limit to 2 decimal places in real-time
    if (cleanValue.includes('.')) {
        const parts = cleanValue.split('.');
        if (parts[1] && parts[1].length > 2) {
            cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
    }
    
    // Check if value exceeds 99% and prevent input
    const numericValue = parseFloat(cleanValue);
    if (!isNaN(numericValue) && numericValue >= 100) {
        // Don't update the input value - this prevents the invalid input
        return;
    }
    
    // Only call onChange if the value has changed
    if (cleanValue !== value) {
        onChange(cleanValue);
    } else {
        onChange(value);
    }
};

// Global CSS to remove spinner arrows from number inputs
export const numberInputCSS = `
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type="number"] {
        -moz-appearance: textfield;
    }
`;


export const numberTextFieldCSS = `
  .Polaris-TextField__Spinner {
    display: none !important;
  }
  .Polaris-TextField__Input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  .Polaris-TextField__Input[type="number"]::-webkit-inner-spin-button,
  .Polaris-TextField__Input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

// Function to apply global number input formatting
export const applyGlobalNumberInputFormatting = () => {
    // Add global CSS to document head
    if (!document.getElementById('number-input-styles')) {
        const style = document.createElement('style');
        style.id = 'number-input-styles';
        style.textContent = numberInputCSS;
        document.head.appendChild(style);
    }

    // Add global event listeners for automatic formatting
    document.addEventListener('blur', function(event) {
        if (event.target.type === 'number' && event.target.dataset.autoFormat !== 'false') {
            const formattedValue = formatNumberInput(event.target.value);
            if (formattedValue !== event.target.value) {
                event.target.value = formattedValue;
                // Trigger change event to notify React
                const changeEvent = new Event('change', { bubbles: true });
                event.target.dispatchEvent(changeEvent);
            }
        }
    }, true);
};
