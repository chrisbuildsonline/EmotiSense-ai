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
import type { EmotionResult } from "../../services/EmotionDetector";

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
      
      // Debug logging
      console.log('🎭 EMOTION DETECTION:', {
        emotion: result.emotion,
        smileIntensity: result.smileIntensity.toFixed(4),
        energyLevel: result.energyLevel,
        confidence: result.confidence,
      });
      
      setCurrentEmotion(result);
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
      case 'excited': return '🤩';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'happy': return '#4CAF50';
      case 'excited': return '#FF9800';
      case 'tired': return '#9C27B0';
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
                <Text style={styles.emotionLabel}>
                  {currentEmotion?.emotion.toUpperCase() || 'NEUTRAL'}
                </Text>
              </Animated.View>
              <Text style={styles.confidenceText}>
                {currentEmotion ? `${Math.round(currentEmotion.confidence)}% confidence` : ''}
              </Text>
            </View>

            <View style={styles.detailedMetricsContainer}>
              <Text style={styles.metricsTitle}>Motion Tracking</Text>
              
              <View style={styles.metricRow}>
                <View style={styles.metricRowLeft}>
                  <Ionicons name="happy-outline" size={20} color="#FFD700" />
                  <Text style={styles.metricRowLabel}>Smile Intensity</Text>
                </View>
                <View style={styles.metricRowRight}>
                  <View style={styles.activityBar}>
                    <View 
                      style={[
                        styles.activityBarFill, 
                        { 
                          width: `${currentEmotion ? Math.round(currentEmotion.smileIntensity * 100) : 0}%`,
                          backgroundColor: currentEmotion && currentEmotion.smileIntensity > 0.5 ? '#4CAF50' : currentEmotion && currentEmotion.smileIntensity > 0.25 ? '#FFD700' : '#9E9E9E'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.metricRowValue, { marginLeft: 8 }]}>
                    {currentEmotion ? `${Math.round(currentEmotion.smileIntensity * 100)}%` : '0%'}
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricRowLeft}>
                  <Ionicons name="swap-vertical" size={20} color="#4A90E2" />
                  <Text style={styles.metricRowLabel}>Head Nodding</Text>
                </View>
                <View style={styles.metricRowRight}>
                  <View style={[styles.indicator, { backgroundColor: currentEmotion && currentEmotion.headMovement > 30 ? '#4CAF50' : '#9E9E9E' }]} />
                  <Text style={styles.metricRowValue}>
                    {currentEmotion && currentEmotion.headMovement > 30 ? 'Active' : 'Stable'}
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricRowLeft}>
                  <Ionicons name="trending-up" size={20} color="#FF9800" />
                  <Text style={styles.metricRowLabel}>Movement Rate</Text>
                </View>
                <View style={styles.metricRowRight}>
                  <Text style={styles.metricRowValue}>
                    {currentEmotion ? `${Math.round(currentEmotion.headMovement)}%` : '0%'}
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricRowLeft}>
                  <Ionicons name="eye-off" size={20} color="#2196F3" />
                  <Text style={styles.metricRowLabel}>Eyes Closed</Text>
                </View>
                <View style={styles.metricRowRight}>
                  <View style={[styles.indicator, { backgroundColor: currentEmotion && currentEmotion.eyesClosed ? '#F44336' : '#4CAF50' }]} />
                  <Text style={styles.metricRowValue}>
                    {currentEmotion && currentEmotion.eyesClosed ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricRowLeft}>
                  <Ionicons name="bed" size={20} color="#9C27B0" />
                  <Text style={styles.metricRowLabel}>Drowsiness</Text>
                </View>
                <View style={styles.metricRowRight}>
                  <View style={styles.activityBar}>
                    <View 
                      style={[
                        styles.activityBarFill, 
                        { 
                          width: `${currentEmotion ? currentEmotion.drowsinessLevel : 0}%`,
                          backgroundColor: currentEmotion && currentEmotion.drowsinessLevel > 70 ? '#F44336' : currentEmotion && currentEmotion.drowsinessLevel > 40 ? '#FF9800' : '#4CAF50'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.metricRowValue, { marginLeft: 8 }]}>
                    {currentEmotion ? `${currentEmotion.drowsinessLevel}%` : '0%'}
                  </Text>
                </View>
              </View>
            </View>
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
    fontSize: 140,
    marginBottom: 15,
  },
  emotionLabel: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Playfair-Bold",
    letterSpacing: 2,
    color: "#FFFFFF"
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
  detailedMetricsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  metricRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  metricRowLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 10,
  },
  metricRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricRowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activityBar: {
    width: 80,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  activityBarFill: {
    height: "100%",
    borderRadius: 3,
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
