import { useState, useEffect } from "react";
import { Text, Icon } from "@shopify/polaris";
import { ClockIcon } from '@shopify/polaris-icons';
import { getTimerDisplayData } from "../../functions/timer";

export const TestTimer = ({ testData, testStatus }) => {
    const [elapsedTime, setElapsedTime] = useState('0h 0m');

    useEffect(() => {
        const updateTimer = () => {
            const timerData = getTimerDisplayData(testData?.sessions, testStatus);
            setElapsedTime(timerData.displayTime);
        };

        // Update immediately
        updateTimer();

        // Set up interval only if timer should update
        const timerData = getTimerDisplayData(testData?.sessions, testStatus);
        if (timerData.shouldUpdate) {
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [testData?.sessions, testStatus]);

    // Don't render if no sessions
    const timerData = getTimerDisplayData(testData?.sessions, testStatus);
    if (!testData?.sessions || testData.sessions.length === 0) {
        return null;
    }

    const isActive = timerData.isActive;
    const displayText = isActive ? `Running: ${elapsedTime}` : `Total: ${elapsedTime}`;

    return (
        <div style={{
            padding: '0.1rem 1rem',
            backgroundColor: isActive ? '#e8f5e8' : '#f8f9fa',
            borderRadius: '8px',
            border: `1px solid ${isActive ? '#4caf50' : '#e0e0e0'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '120px'
        }}>
            <div style={{
                color: isActive ? '#4caf50' : '#9e9e9e',
                animation: isActive ? 'pulse 2s infinite' : 'none'
            }}>
                <Icon source={ClockIcon} />
            </div>
            <Text variant="bodyMd" as="span" color={isActive ? 'success' : 'subdued'}>
                {displayText}
            </Text>
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>

            {/* Add global styles for warning button animation */}
            <style jsx global>{`
                    @keyframes pulse {
                        0% { 
                            opacity: 1; 
                            transform: scale(1);
                        }
                        50% { 
                            opacity: 0.8; 
                            transform: scale(1.02);
                        }
                        100% { 
                            opacity: 1; 
                            transform: scale(1);
                        }
                    }
                `}</style>
        </div>
    );
}; 