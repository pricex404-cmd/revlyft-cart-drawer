import { Text, Button, InlineStack, Icon, TextField } from "@shopify/polaris";
import { EditIcon } from '@shopify/polaris-icons';
import { useState, useEffect } from "react";

export const TestGroupCircle = ({ percentage, name, color, onEdit, onRemove, totalGroups, disabled }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(name);
    const [hasError, setHasError] = useState(false);

    // Update editedName when name prop changes
    useEffect(() => {
        setEditedName(name);
    }, [name]);

    const handleEditClick = () => {
        if (disabled) return;
        if (isEditing) {
            // Validate that the name is not empty or just whitespace
            const trimmedName = editedName.trim();
            if (!trimmedName) {
                setHasError(true);
                return; // Don't save if name is empty
            }
            setHasError(false);
            onEdit(trimmedName);
        }
        setIsEditing(!isEditing);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // Validate that the name is not empty or just whitespace
            const trimmedName = editedName.trim();
            if (!trimmedName) {
                setHasError(true);
                return; // Don't save if name is empty
            }
            setHasError(false);
            onEdit(trimmedName);
            setIsEditing(false);
        } else if (e.key === 'Escape') {
            setEditedName(name);
            setHasError(false);
            setIsEditing(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '150px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.7 : 1
        }}>
            <div style={{
                border: `3px solid ${color}`,
                borderRadius: '50%',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${color}20`,
                boxShadow: `0 2px 4px ${color}40`,
                cursor: disabled ? 'not-allowed' : 'default'
            }}>
                <Text variant="headingXl" as="h2" style={{ color: color, fontWeight: 'bold' }}>
                    {percentage}%
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <TextField
                                value={editedName}
                                onChange={(value) => {
                                    setEditedName(value);
                                    setHasError(false); // Clear error when user starts typing
                                }}
                                onKeyUp={handleKeyPress}
                                autoFocus
                                maxLength={20}
                                size="small"
                                error={hasError ? 'Group name cannot be empty' : undefined}
                                style={{
                                    border: `2px solid ${hasError ? '#FF5722' : color}`,
                                    borderRadius: '4px'
                                }}
                                disabled={disabled}
                            />
                        </div>
                    ) : (
                        <Text variant="bodyMd" as="p" style={{ color: color, fontWeight: '500' }}>{name}</Text>
                    )}
                    {name !== 'Control Group' && (
                        <InlineStack gap="100">
                            <Button
                                plain
                                onClick={handleEditClick}
                                icon={<Icon source={EditIcon} />}
                                disabled={disabled}
                            >
                                {isEditing ? 'Save' : ''}
                            </Button>
                            {!isEditing && totalGroups > 2 && (
                                <Button
                                    plain
                                    onClick={onRemove}
                                    destructive
                                    disabled={disabled}
                                >
                                    ×
                                </Button>
                            )}
                        </InlineStack>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestGroupCircle; 