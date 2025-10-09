import { TextField } from "@shopify/polaris";
import { useCallback } from "react";

export function TimerInput({ timerMinutes, onTimerChange, disabled = false }) {
    const handleChange = useCallback((value) => {
        // Allow empty while typing; otherwise keep only digits
        const numeric = value.replace(/[^0-9]/g, "");
        onTimerChange(numeric);
    }, [onTimerChange]);

    return (
        <TextField
            placeholder="Enter timer duration"
            label="Timer duration (minutes)"
            type="number"
            value={timerMinutes?.toString() ?? ""}
            onChange={handleChange}
            autoComplete="off"
            min={1}
            disabled={disabled}
            helpText="How long the countdown runs after the user qualifies."
        />
    );
}

export default TimerInput;

