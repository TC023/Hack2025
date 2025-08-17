// app/VideoConSelfies.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, Alert, ActivityIndicator } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import { CameraView, PermissionStatus, useCameraPermissions } from "expo-camera";

const CAPTURE_FRACTIONS = [0.1, 0.3, 0.5, 0.7, 0.9] as const;

type CaptureIndex = 0 | 1 | 2 | 3 | 4;

type UploadPayload = {
    imageBase64: string;  // data:image/jpeg;base64,...
    index: number;
    videoId: string;
    capturedAt: string;   // ISO
};

function isSuccess(status: AVPlaybackStatus): status is AVPlaybackStatusSuccess {
    return (status as AVPlaybackStatusSuccess).isLoaded === true;
}

// Renamed for clarity with file name
export default function VideoAnalysisScreen(): React.ReactElement {
    const videoRef = useRef<Video | null>(null);
    const cameraRef = useRef<CameraView | null>(null);

    const [hasConsent, setHasConsent] = useState<boolean>(false);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();

    const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
    const [capturedMap, setCapturedMap] = useState<Record<number, true>>({});
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
    // URIs de archivos (foto.uri) para subir como multipart/form-data
    const [images, setImages] = useState<string[]>([]);
    const [batchUploading, setBatchUploading] = useState<boolean>(false);
    const [batchUploaded, setBatchUploaded] = useState<boolean>(false);
    const [mostFrequent, setMostFrequent] = useState<string | null>(null);

    // Cambia el video y el endpoint a lo tuyo:
    const VIDEO_SOURCE = { uri: "https://videos.pexels.com/video-files/855029/855029-hd_1920_1080_30fps.mp4" };
    // TODO: replace with your real endpoint. For local dev you can use e.g. http://<YOUR_LAN_IP>:8000/upload
    const SERVER_URL = "https://71458dc7df52.ngrok-free.app/predict";
    const VIDEO_ID = "video-001";

    const handleAcceptConsent = useCallback(async () => {
        setHasConsent(true);
        try {
            const result = await requestCameraPermission();
            if (!result || result.status !== PermissionStatus.GRANTED) {
                Alert.alert("Permiso requerido", "Sin permiso de cámara no podemos capturar imágenes.");
            }
        } catch (e: unknown) {
            setErrorMsg(String(e));
        }
    }, [requestCameraPermission]);

    const handleDeclineConsent = useCallback(() => {
        setHasConsent(false);
        Alert.alert("Entendido", "No capturaremos imágenes. Puedes salir o ver el video sin capturas.");
    }, []);

    const uploadBatch = useCallback(async (imgs: string[]) => {
        if (batchUploading || batchUploaded) return;
        setBatchUploading(true);
        setErrorMsg("");
        try {
            const form = new FormData();
            form.append("videoId", VIDEO_ID);
            imgs.forEach((uri, i) => {
                if (!uri) return;
                form.append("images", {
                    uri,
                    name: `selfie_${i + 1}.jpg`,
                    type: "image/jpeg",
                } as any);
            });
            // NOTA: No seteamos manualmente Content-Type para permitir que RN agregue boundary.
            const res = await fetch(SERVER_URL, {
                method: "POST",
                body: form,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            let data: any = null;
            try {
                data = await res.json();
                if (data && typeof data.most_frequent === "string") {
                    setMostFrequent(data.most_frequent);
                }
            } catch (e) {
                console.log("No se pudo parsear JSON de respuesta", e);
            }
            setBatchUploaded(true);
        } catch (err: unknown) {
            setErrorMsg(`Error subiendo lote: ${String(err)}`);
        } finally {
            setBatchUploading(false);
        }
    }, [SERVER_URL, VIDEO_ID, batchUploading, batchUploaded]);

    const takeSelfie = useCallback(async (index: number) => {
        if (!cameraRef.current || !isCameraReady) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.6,
                skipProcessing: true,
            });
            if (photo?.uri) {
                setImages(prev => {
                    const next = [...prev];
                    next[index] = photo.uri; // mantener orden
                    return next;
                });
            } else {
                console.log("[VideoAnalysis] Captura sin uri");
            }
        } catch (e: unknown) {
            setErrorMsg(`Error al capturar imagen #${index + 1}: ${String(e)}`);
        }
    }, [isCameraReady]);

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!isSuccess(status)) return;
        if (!hasConsent || cameraPermission?.status !== PermissionStatus.GRANTED) return;
        if (!status.durationMillis || status.durationMillis <= 0) return;

        const progress = status.positionMillis / status.durationMillis;

        CAPTURE_FRACTIONS.forEach((fraction, idx) => {
            if (progress >= fraction && !capturedMap[idx]) {
                // marcar y capturar
                setCapturedMap((prev) => ({ ...prev, [idx]: true }));
                // slight delay to let frame stabilize
                setTimeout(() => void takeSelfie(idx as CaptureIndex), 150);
            }
        });
    }, [cameraPermission?.status, capturedMap, hasConsent, takeSelfie]);

    // Efecto: cuando tengamos todas las imágenes, subimos lote
    useEffect(() => {
        if (images.filter(Boolean).length === CAPTURE_FRACTIONS.length && !batchUploaded) {
            uploadBatch(images);
        }
    }, [images, batchUploaded, uploadBatch]);

    useEffect(() => {
        // limpieza del video al desmontar
        return () => {
            (async () => {
                try {
                    await videoRef.current?.unloadAsync?.();
                } catch { /* no-op */ }
            })();
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Consentimiento */}
            <Modal visible={!hasConsent} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.title}>Permiso para capturar imágenes</Text>
                        <Text style={styles.paragraph}>
                            Con tu autorización, tomaremos <Text style={styles.bold}>5 fotos con la cámara frontal</Text> en distintos momentos mientras ves el video.
                            Las imágenes se enviarán de forma segura a nuestro servidor para los fines descritos en nuestra política de privacidad.
                        </Text>
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={handleDeclineConsent}>
                                <Text style={[styles.btnText, styles.btnOutlineText]}>No acepto</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleAcceptConsent}>
                                <Text style={styles.btnText}>Acepto</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.smallNote}>Puedes retirar tu consentimiento cerrando esta pantalla o saliendo del video.</Text>
                    </View>
                </View>
            </Modal>

            {/* Video */}
            <View style={styles.videoWrap}>
                <Video
                    ref={(r) => { videoRef.current = r; }}
                    source={VIDEO_SOURCE}
                    shouldPlay
                    isLooping={false}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    onReadyForDisplay={() => setIsVideoReady(true)}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    style={styles.video}
                />
                {!isVideoReady && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" />
                        <Text style={{ marginTop: 10 }}>Cargando video…</Text>
                    </View>
                )}
            </View>

            {/* Cámara frontal “badge” */}
            {hasConsent && cameraPermission?.status === PermissionStatus.GRANTED && (
                <View style={styles.cameraBadgeWrap}>
                    <CameraView
                        ref={(r: CameraView | null) => { cameraRef.current = r; }}
                        facing="front"
                        style={styles.cameraBadge}
                        onCameraReady={() => setIsCameraReady(true)}
                        onMountError={(e: any) => setErrorMsg(`Error montando cámara: ${e?.message || e}`)}
                    />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            Capturas: {Object.keys(capturedMap).length}/{CAPTURE_FRACTIONS.length}
                            {batchUploading ? " • Subiendo lote" : ""}
                            {batchUploaded ? " • Listo" : ""}
                            {!isCameraReady ? " • Cámara…" : ""}
                            {mostFrequent ? `\nEmoción: ${mostFrequent}` : ""}
                        </Text>
                    </View>
                </View>
            )}

            {!!errorMsg && (
                <View style={styles.errorBar}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    videoWrap: { flex: 1, backgroundColor: "#000" },
    video: { flex: 1 },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    cameraBadgeWrap: { position: "absolute", right: 12, top: 12, alignItems: "center" },
    cameraBadge: { width: 80, height: 80, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#ddd", backgroundColor: "#000" },
    badge: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 8 },
    badgeText: { color: "#fff", fontSize: 12 },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 20 },
    modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 18, width: "100%", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
    title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
    paragraph: { fontSize: 14, lineHeight: 20, color: "#333" },
    bold: { fontWeight: "700" },
    row: { flexDirection: "row", gap: 10, marginTop: 14 },
    btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    btnPrimary: { backgroundColor: "#2563eb" },
    btnText: { color: "#fff", fontWeight: "600" },
    btnOutline: { borderWidth: 1, borderColor: "#2563eb", backgroundColor: "#fff" },
    btnOutlineText: { color: "#2563eb" },
    smallNote: { marginTop: 10, fontSize: 12, color: "#666" },
    errorBar: { padding: 10, backgroundColor: "#fee2e2", borderTopWidth: 1, borderTopColor: "#fecaca" },
    errorText: { color: "#991b1b", fontSize: 12 },
});
