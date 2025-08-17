import { StyleSheet, Text, View, Button } from 'react-native';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export function HomeScreen({ navigation }: any) {
    const { user } = useAuth();
    const name = user?.name || 'Usuario';
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hola, {name}</Text>
            <Button
                title="Comprobación de conocimientos"
                onPress={() => navigation.navigate('Quiz')}
            />
            <Button
                title="Conoce el catálogo de profesiones"
                onPress={() => navigation.navigate('Details')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: 16,
        gap: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});