import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import { urls } from '../constants/urls';

export const SignUp: React.FC = ({navigation}:any) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(''); // Changed from 'user' to 'email'
    const [password, setPassword] = useState('');
    const [grade, setGrade] = useState('5to');
    const [language, setLanguage] = useState('');
    const [message, setMessage] = useState<string | null>(null)

    const handleSignUp = async () => {
        // Replace with actual sign up logic

        const form = new FormData();
        
        form.append("name", firstName)
        form.append("last_name", lastName)
        form.append("email", email)
        form.append("password", password)
        form.append("grade", grade)
        form.append("language", language)
        
        await fetch(urls.dbServer, {
            method: "POST",
            body: form,
        }).then(res => {
            if (!res.ok) {
                setMessage('Error al crear usuario')
            }
            else {
                setMessage('Usuario creado corretamente')
                navigation.navigate('Start')
            }

        })
        
        Alert.alert('Sign Up', `Nombre(s): ${firstName}\nApellidos: ${lastName}\nEmail: ${email}\nContraseña: ${password}\nGrado escolar: ${grade}\nIdioma/Lengua: ${language}`);
        
        
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre(s)"
                value={firstName}
                onChangeText={setFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="Apellidos"
                value={lastName}
                onChangeText={setLastName}
            />
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
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Grado escolar"
                value={grade}
                onChangeText={setGrade}
            />
            <TextInput
                style={styles.input}
                placeholder="Idioma/Lengua"
                value={language}
                onChangeText={setLanguage}
            />
            <Button title="Sign Up" onPress={handleSignUp} />

            { message && (
                <span>{message}</span>
            ) }
            
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
    pickerContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    picker: {
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#f9f9f9', // Added background color for better visibility
        color: '#333', // Text color for better contrast
        paddingHorizontal: 12, // Added padding for better usability
        overflow: 'hidden', // Prevents carousel-like behavior on iOS
        alignContent: 'center'
    },
});
