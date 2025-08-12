import { Text, Button, InlineStack, Icon, TextField } from "@shopify/polaris";
import { EditIcon } from '@shopify/polaris-icons';
import { useState } from "react";

export const TestGroupCircle = ({ percentage, name, color, onEdit, onRemove, totalGroups, disabled }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(name);

    const handleEditClick = () => {
        if (disabled) return;
        if (isEditing) {
            onEdit(editedName);
        }
        setIsEditing(!isEditing);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onEdit(editedName);
            setIsEditing(false);
        } else if (e.key === 'Escape') {
            setEditedName(name);
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
                <InlineStack gap="100" align="center">
                    {isEditing ? (
                        <TextField
                            value={editedName}
                            onChange={setEditedName}
                            onKeyUp={handleKeyPress}
                            autoFocus
                            maxLength={20}
                            size="small"
                            style={{
                                border: `2px solid ${color}`,
                                borderRadius: '4px'
                            }}
                            disabled={disabled}
                        />
                    ) : (
                        <Text variant="bodyMd" as="p" style={{ color: color, fontWeight: '500' }}>{name}</Text>
                    )}
                    <InlineStack gap="100">
                        {name !== 'Control Group' && (
                            <Button
                                plain
                                onClick={handleEditClick}
                                icon={<Icon source={EditIcon} />}
                                disabled={disabled}
                            >
                                {isEditing ? 'Save' : ''}
                            </Button>
                        )}
                        {name !== 'Control Group' && !isEditing && totalGroups > 2 && (
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
                </InlineStack>
            </div>
        </div>
    );
};

export default TestGroupCircle; 