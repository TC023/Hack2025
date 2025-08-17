import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../constants/colors';
import { urls } from '../constants/urls';

// ---- Types ----
export interface QuizQuestion {
	id: string | number;
	question: string;
	options: string[]; // possible answers
	correctAnswer?: string; // may be omitted by backend for security; scoring would then be server-side
	area: string; // e.g. "Science", "Arts"
}

interface FetchState {
	loading: boolean;
	error: string | null;
}

// ---- Component ----
const Quiz: React.FC = () => {
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [fetchState, setFetchState] = useState<FetchState>({ loading: true, error: null });
	const [currentIdx, setCurrentIdx] = useState(0);
	const [answers, setAnswers] = useState<Record<string | number, string>>({});
	const [submitted, setSubmitted] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	const baseUrl = urls.dbServer?.replace(/\/$/, '') || ''; // ensure no trailing slash

	const fetchQuestions = useCallback(async () => {
		if (!baseUrl) {
			setFetchState({ loading: false, error: 'Backend URL not configured (constants/urls.ts).' });
			return;
		}
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setFetchState({ loading: true, error: null });
		try {
			const res = await fetch(`${baseUrl}/questions`, { signal: controller.signal });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data: QuizQuestion[] = await res.json();
			if (!Array.isArray(data) || data.length === 0) throw new Error('No questions received');
			setQuestions(data);
			setCurrentIdx(0);
			setAnswers({});
			setSubmitted(false);
			setFetchState({ loading: false, error: null });
		} catch (e: any) {
			if (e.name === 'AbortError') return;
			setFetchState({ loading: false, error: e.message || 'Failed to fetch questions' });
		}
	}, [baseUrl]);

	useEffect(() => {
		fetchQuestions();
		return () => abortRef.current?.abort();
	}, [fetchQuestions]);

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
			Alert.alert('Complete Quiz', 'Please answer all questions before submitting.');
			return;
		}
		setSubmitted(true);
	};

	const restart = () => {
		setAnswers({});
		setCurrentIdx(0);
		setSubmitted(false);
	};

	if (fetchState.loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text style={styles.muted}>Loading questions...</Text>
			</View>
		);
	}
	if (fetchState.error) {
		return (
			<View style={styles.center}>
				<Text style={styles.error}>Error: {fetchState.error}</Text>
				<TouchableOpacity style={styles.retryBtn} onPress={fetchQuestions}>
					<Text style={styles.retryText}>Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}
	if (!currentQuestion) {
		return (
			<View style={styles.center}>
				<Text style={styles.muted}>No questions.</Text>
				<TouchableOpacity style={styles.retryBtn} onPress={fetchQuestions}>
					<Text style={styles.retryText}>Reload</Text>
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
						<Text style={styles.resultsTitle}>Results</Text>
						<Text style={styles.resultsScore}>Score: {score} / {total}</Text>
						{Object.entries(scoreByArea).map(([area, s]) => (
							<Text key={area} style={styles.areaScore}>{area}: {s.correct} / {s.total}</Text>
						))}
						<TouchableOpacity style={styles.restartBtn} onPress={restart}>
							<Text style={styles.restartText}>Restart</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.reloadBtn} onPress={fetchQuestions}>
							<Text style={styles.reloadText}>New Quiz</Text>
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
	error: { color: '#b00020', textAlign: 'center', fontSize: 16, marginBottom: 16 },
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
	restartBtn: { backgroundColor: colors.secondary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
	restartText: { color: '#fff', fontWeight: '600' },
	reloadBtn: { backgroundColor: colors.accent, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
	reloadText: { color: '#fff', fontWeight: '600' },
});

export default Quiz;

