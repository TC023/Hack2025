import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../constants/colors';
import { useProfile } from '../context/ProfileContext';
import { useNavigation } from '@react-navigation/native';

// ---- Types ----
export interface QuizQuestion {
	id: string | number;
	question: string;
	options: string[]; // possible answers
	correctAnswer?: string; // may be omitted by backend for security; scoring would then be server-side
	area: string; // e.g. "Science", "Arts"
}

// Hardcoded questions actualizadas con nuevas áreas
const HARD_QUESTIONS: QuizQuestion[] = [
	// LETRAS Y HUMANIDADES (10)
	{ id: 1, question: '¿Cuál es la función de la palabra "rápido" en: “¡Qué rápido corres!”', options: ['Adverbio de modo', 'Sustantivo', 'Verbo', 'Adjetivo calificativo'], correctAnswer: 'Adverbio de modo', area: 'Letras y Humanidades' },
	{ id: 2, question: '¿Qué figura retórica predomina en: “Floralba, a las piedras les das alma”', options: ['Epopeya', 'Metáfora', 'Hipérbole', 'Paradoja'], correctAnswer: 'Metáfora', area: 'Letras y Humanidades' },
	{ id: 3, question: 'En el texto dramático, el conflicto se plantea en:', options: ['Nudo', 'Desenlace', 'Clímax', 'Desarrollo'], correctAnswer: 'Nudo', area: 'Letras y Humanidades' },
	{ id: 4, question: 'Función predominante en un texto editorial:', options: ['Emotiva', 'Apelativa', 'Referencial', 'Metalingüística'], correctAnswer: 'Apelativa', area: 'Letras y Humanidades' },
	{ id: 5, question: 'Repetir una palabra al inicio de versos/oraciones para énfasis es:', options: ['Epíteto', 'Onomatopeya', 'Anáfora', 'Elipsis'], correctAnswer: 'Anáfora', area: 'Letras y Humanidades' },
	{ id: 6, question: 'Elemento: “Presenta las fuentes consultadas. Formato APA”.', options: ['Anexos', 'Glosario', 'Referencias', 'Aparato crítico'], correctAnswer: 'Referencias', area: 'Letras y Humanidades' },
	{ id: 7, question: 'Bellas Artes, Centenario y Universidad de México realizados bajo:', options: ['Benito Juarez', 'Alfonso Reyes', 'José Vasconcelos', 'Porfirio Díaz Mori'], correctAnswer: 'Porfirio Díaz Mori', area: 'Letras y Humanidades' },
	{ id: 8, question: 'Rima con coincidencia total desde la vocal acentuada:', options: ['Paroxítona', 'Asonante', 'Disonante', 'Consonante'], correctAnswer: 'Consonante', area: 'Letras y Humanidades' },
	{ id: 9, question: 'Corriente que periodiza la historia en modos de producción:', options: ['Historicismo', 'Positivismo', 'Materialismo histórico', 'Escuela de los annales'], correctAnswer: 'Materialismo histórico', area: 'Letras y Humanidades' },
	{ id: 10, question: 'Género antiguo que narra hazañas de héroes:', options: ['Epopeya', 'Cuento', 'Comedia', 'Didáctico'], correctAnswer: 'Epopeya', area: 'Letras y Humanidades' },
	// INGENIERÍA Y CIENCIAS (10)
	{ id: 11, question: 'Resultado de (a² – b) - (-b + 3a²):', options: ['4a²', '2a² + 2b', '-2a²', '4a² – 2b'], correctAnswer: '-2a²', area: 'Ingeniería y Ciencias' },
	{ id: 12, question: 'Razón cateto opuesto / adyacente:', options: ['Csc a', 'Cos a', 'Sec a', 'Tan a'], correctAnswer: 'Tan a', area: 'Ingeniería y Ciencias' },
	{ id: 13, question: 'Lugar geométrico con suma de distancias a focos constante:', options: ['Asíntota', 'Elipse', 'Recta', 'Parábola'], correctAnswer: 'Elipse', area: 'Ingeniería y Ciencias' },
	{ id: 14, question: 'Número cuyo valor más su antecedente = 3 veces él:', options: ['0', '1', '-1', '-2'], correctAnswer: '-1', area: 'Ingeniería y Ciencias' },
	{ id: 15, question: 'Perímetro rectángulo área 84 y base = h + 5:', options: ['38 metros', '16 metros', '48 metros', '28 metros'], correctAnswer: '38 metros', area: 'Ingeniería y Ciencias' },
	{ id: 16, question: 'Primos entre 1 y 20 (incluye 2 y 19):', options: ['7', '8', '9', '10'], correctAnswer: '8', area: 'Ingeniería y Ciencias' },
	{ id: 17, question: 'Objeto acelera desde MRU cuando:', options: ['Se duplica su masa', 'Gana inercia', 'Disminuye su inercia', 'Se le aplica una fuerza neta'], correctAnswer: 'Se le aplica una fuerza neta', area: 'Ingeniería y Ciencias' },
	{ id: 18, question: '“Σ de momentos/torcas = 0” corresponde a:', options: ['Primera ley de Newton', 'Segunda ley de Newton', 'Primera condición de equilibrio', 'Segunda condición de equilibrio'], correctAnswer: 'Segunda condición de equilibrio', area: 'Ingeniería y Ciencias' },
	{ id: 19, question: 'Luz como onda y partícula explica:', options: ['Reflexión y refracción', 'Difracción y refracción', 'Fusión y fisión', 'Superposición y polarización'], correctAnswer: 'Difracción y refracción', area: 'Ingeniería y Ciencias' },
	{ id: 20, question: 'Resultado de 10/4 + 7%4:', options: ['5.5', '6', '4.5', '7'], correctAnswer: '5.5', area: 'Ingeniería y Ciencias' },
	// CIENCIAS QUÍMICAS Y DE LA SALUD (10)
	{ id: 21, question: 'El ________ es un compuesto.', options: ['Amoniaco', 'Antimonio', 'Aire', 'Humo'], correctAnswer: 'Amoniaco', area: 'Ciencias Químicas y de la Salud' },
	{ id: 22, question: 'Fenómenos que ocurren en el núcleo del átomo:', options: ['Fusión y fisión', 'Efecto espectroscópico', 'Efecto fotoeléctrico', 'Reactividad y radiactividad'], correctAnswer: 'Fusión y fisión', area: 'Ciencias Químicas y de la Salud' },
	{ id: 23, question: 'Afirmó que el átomo es la partícula más pequeña:', options: ['Dalton', 'Rutherford', 'Bohr', 'Thomson'], correctAnswer: 'Dalton', area: 'Ciencias Químicas y de la Salud' },
	{ id: 24, question: 'Zona de elementos más electronegativos en la tabla:', options: ['Inferior izquierda', 'Superior izquierda', 'Inferior derecha', 'Superior derecha'], correctAnswer: 'Superior derecha', area: 'Ciencias Químicas y de la Salud' },
	{ id: 25, question: 'pH = 4 significa que es:', options: ['Una sal', 'Un hidróxido', 'Un ácido', 'Un óxido básico'], correctAnswer: 'Un ácido', area: 'Ciencias Químicas y de la Salud' },
	{ id: 26, question: 'Función de la queratina:', options: ['Hormonal', 'Estructural', 'De transporte', 'Enzimática'], correctAnswer: 'Estructural', area: 'Ciencias Químicas y de la Salud' },
	{ id: 27, question: 'Los citocromos son:', options: ['Transportadores de electrones', 'Generadores de NADH', 'Transportadores de Piruvato', 'Fijadores del Carbono'], correctAnswer: 'Transportadores de electrones', area: 'Ciencias Químicas y de la Salud' },
	{ id: 28, question: 'Complejo que sintetiza proteínas a partir de ARNm:', options: ['Ribosoma', 'Centriolo', 'Cloroplasto', 'Lisosoma'], correctAnswer: 'Ribosoma', area: 'Ciencias Químicas y de la Salud' },
	{ id: 29, question: 'Proceso natural que no requiere oxígeno:', options: ['Flotación de minerales', 'Corrosión de un metal', 'Combustión de la gasolina', 'Fotosíntesis'], correctAnswer: 'Fotosíntesis', area: 'Ciencias Químicas y de la Salud' },
	{ id: 30, question: 'Producto de hidrolizar ATP:', options: ['ADP', 'ADN', 'RNA', 'AMP'], correctAnswer: 'ADP', area: 'Ciencias Químicas y de la Salud' },
];

// ---- Component ----
const Quiz: React.FC = () => {
	const [questions] = useState<QuizQuestion[]>(HARD_QUESTIONS);
	const [currentIdx, setCurrentIdx] = useState(0);
	const [answers, setAnswers] = useState<Record<string | number, string>>({});
	const [submitted, setSubmitted] = useState(false);
	const { setProfile, profile } = useProfile();
	const navigation = useNavigation<any>();

	const total = questions.length;
	const currentQuestion = questions[currentIdx];
	const currentSelected = currentQuestion ? answers[currentQuestion.id] : undefined;

	const allAnswered = useMemo(() => total > 0 && questions.every(q => answers[q.id] !== undefined), [questions, answers, total]);

	const score = useMemo(() => {
		if (!submitted) return 0;
		return questions.reduce((acc, q) => {
			if (q.correctAnswer && answers[q.id] === q.correctAnswer) return acc + 1;
			return acc;
		}, 0);
	}, [submitted, questions, answers]);

	const scoreByArea = useMemo(() => {
		if (!submitted) return {} as Record<string, { correct: number; total: number }>;
		return questions.reduce((acc, q) => {
			if (!acc[q.area]) acc[q.area] = { correct: 0, total: 0 };
			acc[q.area].total += 1;
			if (q.correctAnswer && answers[q.id] === q.correctAnswer) acc[q.area].correct += 1;
			return acc;
		}, {} as Record<string, { correct: number; total: number }>);
	}, [submitted, questions, answers]);

	// Determine best performing area(s)
	const bestAreas = useMemo(() => {
		if (!submitted) return [] as string[];
		const entries = Object.entries(scoreByArea);
		if (entries.length === 0) return [];
		// Compute accuracy; break ties by higher correct count; if still tie keep all
		let best: { area: string; acc: number; correct: number }[] = [];
		for (const [area, s] of entries) {
			const acc = s.total ? s.correct / s.total : 0;
			if (best.length === 0) {
				best.push({ area, acc, correct: s.correct });
				continue;
			}
			const currentBest = best[0];
			if (acc > currentBest.acc || (acc === currentBest.acc && s.correct > currentBest.correct)) {
				best = [{ area, acc, correct: s.correct }];
			} else if (acc === currentBest.acc && s.correct === currentBest.correct) {
				best.push({ area, acc, correct: s.correct });
			}
		}
		return best.map(b => b.area);
	}, [scoreByArea, submitted]);

	const handleSelect = (option: string) => {
		if (!currentQuestion || submitted) return;
		setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
	};

	const goNext = () => {
		if (currentIdx < total - 1) setCurrentIdx(i => i + 1);
	};
	const goPrev = () => {
		if (currentIdx > 0) setCurrentIdx(i => i - 1);
	};

	const submit = () => {
		if (!allAnswered) {
			Alert.alert('Complete Quiz', 'Por favor responde todas las preguntas antes de enviar.');
			return;
		}
		setSubmitted(true);
	};

	const restart = () => {
		setAnswers({});
		setCurrentIdx(0);
		setSubmitted(false);
	};

	const finishAndGoHome = () => {
		// Save best area (first if tie) into profile context under area_interes
		if (bestAreas.length > 0) {
			const best = bestAreas[0];
			setProfile({ ...(profile || {}), area_interes: best });
		}
		navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
	};

	if (!currentQuestion) {
		return (
			<View style={styles.center}>
				<Text style={styles.muted}>No hay preguntas.</Text>
				<TouchableOpacity style={styles.retryBtn} onPress={restart}>
					<Text style={styles.retryText}>Reiniciar</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Progress Bar */}
			<View style={styles.progressWrapper}>
				<View style={[styles.progressBar, { width: `${((currentIdx + 1) / total) * 100}%` }]} />
			</View>

			{/* Question Header */}
			<View style={styles.headerRow}>
				<Text style={styles.counter}>Question {currentIdx + 1} / {total}</Text>
				<View style={styles.areaBadge}>
					<Text style={styles.areaText}>{currentQuestion.area}</Text>
				</View>
			</View>

			<ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
				<Text style={styles.questionText}>{currentQuestion.question}</Text>

				<View style={styles.optionsWrapper}>
					{currentQuestion.options.map(opt => {
						const selected = currentSelected === opt;
						const showCorrect = submitted && currentQuestion.correctAnswer === opt;
						const showIncorrect = submitted && selected && currentQuestion.correctAnswer !== opt;
						return (
							<TouchableOpacity
								key={opt}
								style={[
									styles.optionBtn,
									selected && !submitted && styles.optionSelected,
									showCorrect && styles.optionCorrect,
									showIncorrect && styles.optionIncorrect,
								]}
								onPress={() => handleSelect(opt)}
								disabled={submitted}
								activeOpacity={0.75}
							>
								<Text style={styles.optionText}>{opt}</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				{/* Navigation Buttons */}
				<View style={styles.navRow}>
					<TouchableOpacity onPress={goPrev} disabled={currentIdx === 0} style={[styles.navBtn, currentIdx === 0 && styles.disabledBtn]}>
						<Text style={styles.navText}>Prev</Text>
					</TouchableOpacity>
					{currentIdx < total - 1 && (
						<TouchableOpacity onPress={goNext} disabled={!currentSelected} style={[styles.navBtn, !currentSelected && styles.disabledBtn]}>
							<Text style={styles.navText}>Next</Text>
						</TouchableOpacity>
					)}
					{currentIdx === total - 1 && !submitted && (
						<TouchableOpacity onPress={submit} disabled={!allAnswered} style={[styles.submitBtn, !allAnswered && styles.disabledBtn]}>
							<Text style={styles.submitText}>Submit</Text>
						</TouchableOpacity>
					)}
				</View>

				{submitted && (
					<View style={styles.resultsBox}>
						<Text style={styles.resultsTitle}>Resultados</Text>
						<Text style={styles.resultsScore}>Puntaje: {score} / {total}</Text>
						{Object.entries(scoreByArea).map(([area, s]) => (
							<Text key={area} style={styles.areaScore}>{area}: {s.correct} / {s.total} ({((s.correct / s.total) * 100).toFixed(0)}%)</Text>
						))}
						{bestAreas.length > 0 && (
							<Text style={styles.bestArea}>Área(s) destacada(s): {bestAreas.join(', ')}</Text>
						)}
						<TouchableOpacity style={styles.homeBtn} onPress={finishAndGoHome}>
							<Text style={styles.homeBtnText}>Regresar al inicio</Text>
						</TouchableOpacity>
					</View>
				)}
			</ScrollView>
		</View>
	);
};

// ---- Styles ----
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 24 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
	muted: { color: '#666', marginTop: 12 },
	retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
	retryText: { color: '#fff', fontWeight: '600' },
	progressWrapper: { height: 8, backgroundColor: '#ddd', borderRadius: 4, overflow: 'hidden', marginBottom: 20 },
	progressBar: { height: '100%', backgroundColor: colors.primary },
	headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
	counter: { fontSize: 16, fontWeight: '600', color: colors.accent },
	areaBadge: { backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
	areaText: { color: '#fff', fontWeight: '600', fontSize: 12 },
	scroll: { flex: 1 },
	questionText: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
	optionsWrapper: { gap: 12 },
	optionBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 16, backgroundColor: '#fff' },
	optionSelected: { borderColor: colors.primary, backgroundColor: '#e6efff' },
	optionCorrect: { borderColor: '#2e7d32', backgroundColor: '#e0f5e5' },
	optionIncorrect: { borderColor: '#c62828', backgroundColor: '#fdecea' },
	optionText: { fontSize: 16, color: colors.text },
	navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, gap: 12 },
	navBtn: { flex: 1, backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
	navText: { color: '#fff', fontWeight: '600' },
	submitBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
	submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
	disabledBtn: { opacity: 0.4 },
	resultsBox: { marginTop: 40, backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#eee' },
	resultsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: colors.accent },
	resultsScore: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
	areaScore: { fontSize: 14, marginTop: 2 },
	bestArea: { fontSize: 15, fontWeight: '600', marginTop: 14, color: colors.primary },
	restartBtn: { backgroundColor: colors.secondary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 24 },
	restartText: { color: '#fff', fontWeight: '600' },
	homeBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 28 },
	homeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default Quiz;

