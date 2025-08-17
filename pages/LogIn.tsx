import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export const LogIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<any>();
    const { login, loading, error } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) return;
        const ok = await login(email, password);
        if (ok) {
            // Reset navigation stack to main area
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Log In</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
            ) : (
                <Button title="Log In" onPress={handleLogin} disabled={!email || !password} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    error: {
        color: '#b00020',
        marginBottom: 12,
        textAlign: 'center',
    }
});
