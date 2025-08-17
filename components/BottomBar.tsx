import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type BottomBarProps = {
    icons: {
        name: keyof typeof MaterialIcons.glyphMap;
        onPress: () => void;
        active?: boolean;
    }[];
};

export const BottomBar: React.FC<BottomBarProps> = ({ icons }) => {
    // Limit to 5 icons max
    const displayedIcons = icons.slice(0, 5);

    return (
        <View style={styles.container}>
            {displayedIcons.map((icon, idx) => (
                <TouchableOpacity
                    key={icon.name + idx}
                    onPress={icon.onPress}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name={icon.name}
                        size={32}
                        color={icon.active ? '#007AFF' : '#444'}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    iconButton: {
        flex: 1,
        alignItems: 'center',
    },
});
