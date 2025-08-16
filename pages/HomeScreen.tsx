import { StyleSheet, Text, View, Button } from 'react-native';


export function HomeScreen({ navigation }: any) {
  return (
    <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 16,
    }}>
      <Text style={{
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
      }}>Welcome to Expo React Native App!</Text>
      <Button title="Switch to Details" onPress={() => navigation.navigate('Details')} />
    </View>
  );
}