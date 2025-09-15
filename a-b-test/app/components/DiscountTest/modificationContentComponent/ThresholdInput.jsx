import { TextField } from "@shopify/polaris";
import { getCurrencySymbol } from "../../../utils/currencyFormatter";
export function ThresholdInput({
    discountType,
    threshold,
    onThresholdChange,
    currency
}) {
    return (
        <TextField
            label={discountType === "value" ? "Cart Value Threshold" : "Cart Quantity Threshold"}
            type="number"
            value={threshold}
            onChange={onThresholdChange}
            prefix={discountType === "value" ? getCurrencySymbol(currency) : ""}
            helpText={
                discountType === "value"
                    ? "Enter the minimum cart value to trigger discount"
                    : "Enter the minimum number of items to trigger discount"
            }
        />
    );
} 