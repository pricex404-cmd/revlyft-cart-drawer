import { TextField } from "@shopify/polaris";
import { getCurrencySymbol } from "../../../utils/currencyFormatter";

export function ThresholdInput({
    discountType,
    threshold,
    onThresholdChange,
    currency
}) {
    const handleInputChange = (value) => {
        // For 'value' type, allow numbers with optional decimal point
        // For other types, only allow whole numbers
        const numberPattern = discountType === 'value' 
            ? /^\d*\.?\d*$/  // Allows numbers with optional decimal point
            : /^\d*$/;         // Only allows whole numbers
            
        if (value === '' || numberPattern.test(value)) {
            onThresholdChange(value);
        }
    };

    return (
        <TextField
            label={discountType === "value" ? "Cart Value Threshold" : "Cart Quantity Threshold"}
            type="text"
            value={threshold}
            placeholder="Enter Cart Value Threshold"
            onChange={handleInputChange}
            prefix={discountType === "value" ? getCurrencySymbol(currency) : ""}
            helpText={
                discountType === "value"
                    ? "Enter the minimum cart value to trigger discount"
                    : "Enter the minimum number of items to trigger discount"
            }
        />
    );
} 