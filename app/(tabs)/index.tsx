import AppBackground from "@/components/AppBackground";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
} from "react-native-vision-camera";
import { useServices } from "../../contexts/ServiceContext";
import type { EmotionResult, EmotionStats } from "../../services/EmotionDetector";

const { width } = Dimensions.get("window");

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, [dot1, dot2, dot3]);

  const dotStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  });

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, dotStyle(dot1)]} />
      <Animated.View style={[styles.dot, dotStyle(dot2)]} />
      <Animated.View style={[styles.dot, dotStyle(dot3)]} />
    </View>
  );
}

export default function HomeScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [stats, setStats] = useState<EmotionStats | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const device = useCameraDevice("front");
  const cameraRef = useRef<Camera>(null);
  const { emotionDetector, isInitialized } = useServices();
  const isProcessingRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentEmotion?.emotion === 'excited') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [currentEmotion?.emotion, pulseAnim]);

  const detectEmotions = useCallback(async () => {
    if (
      !cameraRef.current ||
      isProcessingRef.current ||
      !emotionDetector ||
      !isInitialized
    )
      return;
    try {
      isProcessingRef.current = true;
      
      if (!cameraRef.current) {
        return;
      }
      
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: "speed",
        enableShutterSound: false,
      });
      if (!photo?.path) {
        setFaceDetected(false);
        return;
      }
      const FaceDetection =
        require("@react-native-ml-kit/face-detection").default;
      const faces = await FaceDetection.detect(`file://${photo.path}`, {
        landmarkMode: "all",
        contourMode: "none",
        classificationMode: "all",
        performanceMode: "fast",
      });
      
      if (faces.length === 0) {
        setFaceDetected(false);
        return;
      }

      setFaceDetected(true);
      const result = await emotionDetector.detectEmotion(faces);
      setCurrentEmotion(result);
      
      const currentStats = emotionDetector.getStats();
      setStats(currentStats);
    } catch (error: any) {
      if (error?.message?.includes("Camera is closed")) {
        return;
      }
      console.error("Error detecting emotions:", error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [emotionDetector, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !hasPermission) return;
    
    const interval = setInterval(() => {
      detectEmotions();
    }, 2000);
    setTimeout(() => detectEmotions(), 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isInitialized, hasPermission, detectEmotions]);

  const getEmotionEmoji = (emotion: string): string => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'excited': return '🤩';
      default: return '😐';
    }
  };

  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'happy': return '#4CAF50';
      case 'sad': return '#2196F3';
      case 'excited': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Initializing AI...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="happy-outline" size={80} color="#4A90E2" />
        <Text style={styles.permissionTitle}>MotionAI</Text>
        <Text style={styles.permissionText}>
          Analyze your emotions and motion patterns with real-time AI detection.
        </Text>
        <Text
          style={styles.permissionButton}
          onPress={() => requestPermission()}
        >
          Enable Camera
        </Text>
      </View>
    );
  }

  return (
    <AppBackground>
      {device && (
        <Camera
          ref={cameraRef}
          style={styles.hiddenCamera}
          device={device}
          isActive={true}
          photo={true}
        />
      )}

      <View style={styles.mainContainer}>
        {!faceDetected ? (
          <View style={styles.placeholderContainer}>
            <LoadingDots />
            <Text style={styles.placeholderText}>Looking for your face</Text>
            <Text style={styles.placeholderSubtext}>
              Position yourself in front of the camera
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.emotionDisplay}>
              <Text style={styles.emotionEmoji}>
                {currentEmotion ? getEmotionEmoji(currentEmotion.emotion) : '😐'}
              </Text>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Text style={[styles.emotionLabel, { color: currentEmotion ? getEmotionColor(currentEmotion.emotion) : '#9E9E9E' }]}>
                  {currentEmotion?.emotion.toUpperCase() || 'NEUTRAL'}
                </Text>
              </Animated.View>
              <Text style={styles.confidenceText}>
                {currentEmotion ? `${Math.round(currentEmotion.confidence)}% confidence` : ''}
              </Text>
            </View>

            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Ionicons name="happy" size={24} color="#4A90E2" />
                <Text style={styles.metricValue}>
                  {currentEmotion ? `${Math.round(currentEmotion.smileIntensity * 100)}%` : '0%'}
                </Text>
                <Text style={styles.metricLabel}>Smile</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Ionicons name="flash" size={24} color="#FF9800" />
                <Text style={styles.metricValue}>
                  {currentEmotion ? `${currentEmotion.energyLevel}%` : '0%'}
                </Text>
                <Text style={styles.metricLabel}>Energy</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Ionicons name="move" size={24} color="#4CAF50" />
                <Text style={styles.metricValue}>
                  {currentEmotion ? `${Math.round(currentEmotion.headMovement)}%` : '0%'}
                </Text>
                <Text style={styles.metricLabel}>Movement</Text>
              </View>
            </View>

            {stats && stats.totalDetections > 0 && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Session Stats</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statEmoji}>😊</Text>
                    <Text style={styles.statValue}>{stats.happyCount}</Text>
                    <Text style={styles.statLabel}>Happy</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statEmoji}>😢</Text>
                    <Text style={styles.statValue}>{stats.sadCount}</Text>
                    <Text style={styles.statLabel}>Sad</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statEmoji}>🤩</Text>
                    <Text style={styles.statValue}>{stats.excitedCount}</Text>
                    <Text style={styles.statLabel}>Excited</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statEmoji}>😐</Text>
                    <Text style={styles.statValue}>{stats.neutralCount}</Text>
                    <Text style={styles.statLabel}>Neutral</Text>
                  </View>
                </View>
                <View style={styles.averagesContainer}>
                  <Text style={styles.averageText}>
                    Avg Smile: {stats.averageSmile}% • Avg Energy: {stats.averageEnergy}%
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.faceIndicator}>
        <View
          style={[
            styles.faceIndicatorDot,
            { backgroundColor: faceDetected ? "#4CAF50" : "#FF9800" },
          ]}
        />
        <Text style={styles.faceIndicatorText}>
          {faceDetected ? "Face Detected" : "No face detected"}
        </Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  hiddenCamera: { position: "absolute", width: 1, height: 1, opacity: 0 },
  mainContainer: { 
    flex: 1, 
    justifyContent: "center", 
    paddingHorizontal: 20 
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emotionDisplay: {
    alignItems: "center",
    marginBottom: 40,
  },
  emotionEmoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  emotionLabel: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Playfair-Bold",
    letterSpacing: 2,
  },
  confidenceText: {
    fontSize: 14,
    color: "#9bb2c974",
    marginTop: 8,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  metricCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 16,
    minWidth: width / 3.5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: "#9bb2c974",
    marginTop: 5,
  },
  statsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "#9bb2c974",
    marginTop: 3,
  },
  averagesContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 15,
    alignItems: "center",
  },
  averageText: {
    fontSize: 13,
    color: "#9bb2c974",
  },
  faceIndicator: {
    position: "absolute",
    top: 60,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  faceIndicatorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  faceIndicatorText: { color: "#FFFFFF", fontSize: 12, fontWeight: "500" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E27",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#9bb2c974" },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E27",
    padding: 30,
  },
  permissionTitle: {
    fontSize: 36,
    fontWeight: "bold",
    fontFamily: "Playfair-Bold",
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 15,
  },
  permissionText: {
    fontSize: 16,
    color: "#9bb2c974",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: "#4A90E2",
    color: "#FFFFFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    fontSize: 16,
    fontWeight: "600",
    overflow: "hidden",
  },
  placeholderText: {
    fontSize: 26,
    fontWeight: "600",
    fontFamily: "Playfair",
    color: "#FFFFFF",
    marginTop: 20,
    textAlign: "center",
  },
  placeholderSubtext: {
    fontSize: 16,
    color: "#9bb2c974",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4A90E2",
    marginHorizontal: 6,
  },
});
