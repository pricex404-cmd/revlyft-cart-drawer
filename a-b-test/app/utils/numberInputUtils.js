// Global utility functions for number input formatting

// Function to format number input by removing leading zeros
export const formatNumberInput = (value) => {
    if (value === '' || value === '0') return value;
    
    // Remove leading zeros but keep decimal points
    const trimmedValue = value.replace(/^0+/, '');
    if (trimmedValue === '' || trimmedValue === '.') return '0';
    
    return trimmedValue;
};

// Function to format the display value
export const formatDisplayValue = (value) => {
    if (value === '' || value === null || value === undefined) return '0';
    return value.toString();
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
