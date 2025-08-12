import { useRef, useEffect } from "react";

const PercentageSlider = ({ testGroups, onGroupPercentagesChange }) => {
    const sliderRef = useRef(null);

    const handleDividerMouseDown = (index, e) => {
        const handleMouseMove = (e) => {
            if (!sliderRef.current) return;

            const sliderRect = sliderRef.current.getBoundingClientRect();
            const position = (e.clientX - sliderRect.left) / sliderRect.width;
            const percentage = Math.max(0, Math.min(100, position * 100));

            // Calculate new percentages
            const newGroups = [...testGroups];
            let totalBefore = 0;
            for (let i = 0; i <= index; i++) {
                totalBefore += newGroups[i].percentage;
            }

            const diff = percentage - totalBefore;
            if (diff !== 0) {
                // Adjust the groups before and after the divider
                const groupBefore = newGroups[index];
                const groupAfter = newGroups[index + 1];

                const newPercentageBefore = Math.max(5, groupBefore.percentage + diff);
                const newPercentageAfter = Math.max(5, groupAfter.percentage - diff);

                if (newPercentageBefore + newPercentageAfter === groupBefore.percentage + groupAfter.percentage) {
                    groupBefore.percentage = Math.round(newPercentageBefore);
                    groupAfter.percentage = Math.round(newPercentageAfter);
                    onGroupPercentagesChange(newGroups);
                }
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Clean up event listeners
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', () => { });
            document.removeEventListener('mouseup', () => { });
        };
    }, []);

    // Calculate gradient for slider background
    const gradientBackground = testGroups
        .map((group, index) => {
            const start = testGroups
                .slice(0, index)
                .reduce((sum, g) => sum + g.percentage, 0);
            return `${group.color} ${start}% ${start + group.percentage}%`;
        })
        .join(', ');

    return (
        <div
            ref={sliderRef}
            style={{
                width: '100%',
                height: '4px',
                background: `linear-gradient(to right, ${gradientBackground})`,
                marginTop: '20px',
                position: 'relative',
            }}
        >
            {testGroups.map((group, index) => {
                const position = testGroups
                    .slice(0, index + 1)
                    .reduce((sum, g) => sum + g.percentage, 0);
                return index < testGroups.length - 1 && (
                    <div
                        key={group.id}
                        style={{
                            position: 'absolute',
                            width: '12px',
                            height: '12px',
                            background: 'white',
                            border: `2px solid ${group.color}`,
                            borderRadius: '50%',
                            top: '-4px',
                            left: `${position}%`,
                            transform: 'translateX(-50%)',
                            cursor: 'ew-resize',
                            zIndex: 1,
                            userSelect: 'none',
                        }}
                        onMouseDown={(e) => handleDividerMouseDown(index, e)}
                    />
                );
            })}
        </div>
    );
};

export default PercentageSlider; 