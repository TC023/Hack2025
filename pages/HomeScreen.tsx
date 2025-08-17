import { StyleSheet, Text, View, Button } from 'react-native';

import { colors } from '../constants/colors';

export function HomeScreen({ navigation }: any) {

    
    return (
        <View style={{ 
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
            padding: 16,
        }}>
        <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 20,
        }}>Hola, Alonso</Text>
        <Button title="Switch to Details" onPress={() => navigation.navigate('Details')} />
        </View>
    );
}