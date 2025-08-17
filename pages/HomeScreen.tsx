import { StyleSheet, Text, View, Button } from 'react-native';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

export function HomeScreen({ navigation }: any) {
    const { user } = useAuth();
    const { profile, setProfile } = useProfile();
    const name = profile?.name || user?.name || 'Usuario';
    const assignArea = (area: string) => {
        setProfile({ ...(profile || {}), area_interes: area });
    };
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
            <View style={styles.testBlock}>
                <Text style={styles.testLabel}>Testing rápido (asignar área):</Text>
                <Button title="Set Ingeniería y Ciencias" onPress={() => assignArea('Ingeniería y Ciencias')} />
                <Button title="Set Letras y Humanidades" onPress={() => assignArea('Letras y Humanidades')} />
                <Button title="Set Ciencias Químicas y de la Salud" onPress={() => assignArea('Ciencias Químicas y de la Salud')} />
            </View>
            {profile?.area_interes && (
                <>
                    <Text style={styles.unlocked}>Área destacada: {profile.area_interes}. ¡Simulador desbloqueado!</Text>
                    <Button
                        title="Probar simulador"
                        onPress={() => navigation.navigate('Simulator')}
                    />
                </>
            )}
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
    unlocked: {
        fontSize: 14,
        color: colors.primary,
        marginTop: 8,
        textAlign: 'center'
    },
    testBlock: {
        marginTop: 24,
        width: '100%',
        gap: 6,
    },
    testLabel: {
        textAlign: 'center',
        fontSize: 12,
        color: '#555',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
});