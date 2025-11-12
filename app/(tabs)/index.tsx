import { useServices } from '@/app/contexts/ServiceContext';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

type CameraState = 'loading' | 'active' | 'error' | 'no-permission';

export default function DrowsinessMonitor() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraState, setCameraState] = useState<CameraState>('loading');
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [alertnessScore, setAlertnessScore] = useState<number>(100);
  const [eyeClosureRate, setEyeClosureRate] = useState<number>(0);
  const [blinkRate, setBlinkRate] = useState<number>(0);
  const [yawnDetected, setYawnDetected] = useState<boolean>(false);
  const [headNodding, setHeadNodding] = useState<boolean>(false);
  const [isSleepy, setIsSleepy] = useState<boolean>(false);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const device = useCameraDevice(facing);
  const cameraRef = useRef<Camera>(null);
  const { sleepinessDetector, isInitialized, initializationError } = useServices();
  const isProcessingRef = useRef(false);

  // Detect faces using ML Kit (called periodically)
  const detectFaces = useCallback(async () => {
    if (!cameraRef.current || isProcessingRef.current || !sleepinessDetector || !isInitialized) {
      return;
    }

    try {
      isProcessingRef.current = true;

      // Take snapshot without interrupting preview
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
        enableShutterSound: false,
      });

      if (!photo?.path) {
        setFaceDetected(false);
        return;
      }

      // Use ML Kit for face detection
      const FaceDetection = require('@react-native-ml-kit/face-detection').default;
      
      const faces = await FaceDetection.detect(`file://${photo.path}`, {
        landmarkMode: 'none',
        contourMode: 'none',
        classificationMode: 'all',
        performanceMode: 'fast',
      });

      if (faces.length === 0) {
        setFaceDetected(false);
        const emptyResult = await sleepinessDetector.detectSleepiness([]);
        setAlertnessScore(emptyResult.alertnessScore);
        return;
      }

      // Process with sleepiness detector
      const result = await sleepinessDetector.detectSleepiness(faces);
      
      setFaceDetected(true);
      setAlertnessScore(result.alertnessScore);
      setEyeClosureRate(result.eyeClosureRate);
      setBlinkRate(result.blinkRate);
      setYawnDetected(result.yawnDetected);
      setHeadNodding(result.headNodding);
      setIsSleepy(result.isSleepy);
    } catch (error) {
      console.error('Error detecting faces:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [sleepinessDetector, isInitialized]);

  // Run detection loop
  useEffect(() => {
    if (cameraState !== 'active' || !isInitialized) return;

    const interval = setInterval(() => {
      detectFaces();
    }, 2000); // Every 2 seconds - smooth and efficient

    // Initial detection
    setTimeout(() => detectFaces(), 1000);

    return () => clearInterval(interval);
  }, [cameraState, isInitialized, detectFaces]);

  useEffect(() => {
    checkCameraPermissions();
  }, [checkCameraPermissions, hasPermission]);

  const checkCameraPermissions = async () => {
    if (hasPermission === undefined) {
      setCameraState('loading');
      return;
    }

    if (hasPermission) {
      setCameraState('active');
    } else {
      setCameraState('no-permission');
    }
  };

  const handleRequestPermission = async () => {
    setCameraState('loading');
    const result = await requestPermission();
    
    if (result) {
      setCameraState('active');
    } else {
      setCameraState('error');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const getAlertnessColor = (score: number): string => {
    if (score >= 70) return '#4CAF50';
    if (score >= 50) return '#8BC34A';
    if (score >= 30) return '#FF9800';
    return '#F44336';
  };

  const getAlertnessStatus = (score: number): string => {
    if (score >= 70) return 'ALERT';
    if (score >= 50) return 'NORMAL';
    if (score >= 30) return 'DROWSY';
    return 'VERY DROWSY';
  };

  if (cameraState === 'loading' || !device) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>
          {!isInitialized ? 'Initializing AI Detection...' : 'Starting Camera...'}
        </Text>
      </View>
    );
  }

  if (cameraState === 'no-permission') {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="eye-outline" size={80} color="#4A90E2" />
        <Text style={styles.permissionTitle}>🚀 CalmCam Ready!</Text>
        <Text style={styles.permissionText}>
          ✅ Smooth, zero-flicker face detection!{'\n\n'}
          Grant camera permission to start real-time drowsiness monitoring.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cameraState === 'error') {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#F44336" />
        <Text style={styles.errorTitle}>Camera Unavailable</Text>
        <Text style={styles.errorText}>
          {initializationError || 'Unable to access camera.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.monitorContainer}>
      {/* Vision Camera - stays mounted, no flicker! */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        enableZoomGesture={false}
      />

      {/* Top Section - Status */}
      <View style={styles.topSection}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: getAlertnessColor(alertnessScore) }]}>
            <Text style={styles.statusText}>{getAlertnessStatus(alertnessScore)}</Text>
          </View>
        </View>
      </View>

      {/* Camera Controls */}
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Face Frame Overlay */}
      <View style={styles.faceOverlay}>
        <View style={[styles.faceFrame, { borderColor: faceDetected ? '#4CAF50' : '#FF9800' }]} />
        {!faceDetected && (
          <View style={styles.noFaceOverlay}>
            <Ionicons name="person-outline" size={80} color="rgba(255,255,255,0.9)" />
            <Text style={styles.noFaceText}>No Face Detected</Text>
            <Text style={styles.noFaceSubtext}>Position your face in the frame</Text>
          </View>
        )}
      </View>

      {/* Bottom Section - Metrics */}
      {faceDetected && (
        <View style={styles.bottomSection}>
          <Text style={styles.scoreLabel}>Alertness Score</Text>
          <View style={[styles.scoreContainer, { borderColor: getAlertnessColor(alertnessScore) }]}>
            <Text style={[styles.scoreValue, { color: getAlertnessColor(alertnessScore) }]}>
              {alertnessScore}
            </Text>
            <Text style={styles.scoreUnit}>/ 100</Text>
          </View>

          <View style={styles.scoreBar}>
            <View style={[styles.scoreProgress, {
              width: `${alertnessScore}%`,
              backgroundColor: getAlertnessColor(alertnessScore)
            }]} />
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Ionicons name="eye-outline" size={24} color="#2196F3" />
              <Text style={styles.metricLabel}>Eye Closure</Text>
              <Text style={styles.metricValue}>{(eyeClosureRate * 100).toFixed(0)}%</Text>
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="flash-outline" size={24} color="#2196F3" />
              <Text style={styles.metricLabel}>Blink Rate</Text>
              <Text style={styles.metricValue}>{blinkRate}/min</Text>
            </View>

            <View style={styles.metricCard}>
              <Ionicons name={yawnDetected ? 'alert-circle' : 'checkmark-circle-outline'} 
                size={24} color={yawnDetected ? '#FF9800' : '#4CAF50'} />
              <Text style={styles.metricLabel}>Yawn</Text>
              <Text style={styles.metricValue}>{yawnDetected ? 'Yes' : 'No'}</Text>
            </View>

            <View style={styles.metricCard}>
              <Ionicons name={headNodding ? 'alert-circle' : 'checkmark-circle-outline'} 
                size={24} color={headNodding ? '#FF9800' : '#4CAF50'} />
              <Text style={styles.metricLabel}>Head Nod</Text>
              <Text style={styles.metricValue}>{headNodding ? 'Yes' : 'No'}</Text>
            </View>
          </View>

          {isSleepy && (
            <View style={styles.alertBanner}>
              <Ionicons name="warning" size={24} color="#FFF" />
              <Text style={styles.alertText}>DROWSINESS DETECTED - TAKE A BREAK!</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  monitorContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  topSection: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraControls: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 25,
  },
  faceOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -75 }],
  },
  faceFrame: {
    width: 150,
    height: 150,
    borderWidth: 3,
    borderRadius: 75,
    backgroundColor: 'transparent',
  },
  noFaceOverlay: {
    position: 'absolute',
    top: -100,
    left: -75,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 30,
    borderRadius: 20,
  },
  noFaceText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  noFaceSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderWidth: 3,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 15,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreUnit: {
    fontSize: 20,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 15,
    width: '100%',
  },
  alertText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 30,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 30,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 20,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
