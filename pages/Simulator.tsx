import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '../context/ProfileContext';
import { colors } from '../constants/colors';

// Carreras actualizadas por área (según solicitud)
const CAREERS_BY_AREA: Record<string, string[]> = {
  // Mantenemos las llaves con los nombres de área usados en el Quiz
  'Ingeniería y Ciencias': [
    'Ingeniería en Software',
    'Ingeniería Civil',
    'Ingeniería Aeroespacial'
  ],
  'Letras y Humanidades': [
    'Diseño de Modas',
    'Fotografía',
    'Artes Plásticas'
  ],
  'Ciencias Químicas y de la Salud': [
    'Ingeniería Química',
    'Odontología'
  ],
};

// Permite acceder también usando versiones en minúsculas simplificadas
const resolveCareers = (area?: string): string[] => {
  if (!area) return [];
  if (CAREERS_BY_AREA[area]) return CAREERS_BY_AREA[area];
  const norm = area.trim().toLowerCase();
  const entry = Object.entries(CAREERS_BY_AREA).find(([k]) => k.toLowerCase() === norm);
  return entry ? entry[1] : [];
};

const Simulator: React.FC = () => {
  const { profile } = useProfile();
  const area = profile?.area_interes;
  const navigation = useNavigation<any>();

  const careers = useMemo(() => resolveCareers(area || undefined), [area]);

  return (
    <View style={styles.container}>
      {!area ? (
        <Text style={styles.note}>Completa primero la evaluación para desbloquear este simulador.</Text>
      ) : (
        <>
          <Text style={styles.title}>Simulador - Área: {area}</Text>
          <Text style={styles.subtitle}>Carreras sugeridas</Text>
          <FlatList
            data={careers}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CareerSimulation', { career: item })} activeOpacity={0.75}>
                <Text style={styles.cardText}>{item}</Text>
                <Text style={styles.cardHint}>Tocar para simular</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.note}>No hay carreras configuradas para esta área.</Text>}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4, color: colors.accent },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  note: { textAlign: 'center', marginTop: 40, fontSize: 15, color: '#666' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardText: { fontSize: 16, fontWeight: '500', color: colors.text },
  cardHint: { fontSize: 11, color: '#777', marginTop: 4 },
});

export default Simulator;
