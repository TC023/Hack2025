import { StyleSheet, Text, View, Button } from 'react-native';


export function DetailsScreen() {
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
      }}>This is the Details Screen.</Text>
    </View>
  );
}