import { EmotionType } from '@/app/types';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

type CameraState = 'loading' | 'active' | 'error' | 'no-permission';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraState, setCameraState] = useState<CameraState>('loading');
  const [facing, setFacing] = useState<CameraType>('front');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral'); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [calmnessScore, setCalmnessScore] = useState<number>(75); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    checkCameraPermissions();
  }, [permission]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkCameraPermissions = async () => {
    if (permission === null) {
      setCameraState('loading');
      return;
    }

    if (permission.granted) {
      setCameraState('active');
    } else if (permission.canAskAgain) {
      setCameraState('no-permission');
    } else {
      setCameraState('error');
    }
  };

  const handleRequestPermission = async () => {
    try {
      setCameraState('loading');
      const result = await requestPermission();
      
      if (result.granted) {
        setCameraState('active');
      } else {
        setCameraState('error');
        Alert.alert(
          'Camera Permission Required',
          'CalmCam needs camera access to detect emotions. Please enable camera permissions in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch {
      setCameraState('error');
      Alert.alert('Error', 'Failed to request camera permission. Please try again.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const getEmotionColor = (emotion: EmotionType): string => {
    const colors = {
      happy: '#4CAF50',
      neutral: '#2196F3',
      sad: '#9C27B0',
      angry: '#F44336',
      surprised: '#FF9800',
    };
    return colors[emotion];
  };

  const getCalmnessColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const renderPermissionRequest = () => (
    <View style={styles.permissionContainer}>
      <Ionicons name="camera-outline" size={80} color="#4A90E2" />
      <Text style={styles.permissionTitle}>Camera Access Required</Text>
      <Text style={styles.permissionText}>
        CalmCam uses your camera to detect emotions and provide wellness insights.
        Your data stays private and is processed only on your device.
      </Text>
      <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
        <Text style={styles.permissionButtonText}>Enable Camera</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={80} color="#F44336" />
      <Text style={styles.errorTitle}>Camera Unavailable</Text>
      <Text style={styles.errorText}>
        Unable to access camera. Please check your device settings and ensure
        CalmCam has camera permissions enabled.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={checkCameraPermissions}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={styles.loadingText}>Initializing Camera...</Text>
    </View>
  );

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      {/* Top Section - Emotion Display */}
      <View style={styles.topSection}>
        <View style={styles.emotionContainer}>
          <Text style={styles.emotionLabel}>Current Emotion</Text>
          <View style={[styles.emotionBadge, { backgroundColor: getEmotionColor(currentEmotion) }]}>
            <Text style={styles.emotionText}>{currentEmotion.toUpperCase()}</Text>
          </View>
        </View>
        
        {isProcessing && (
          <View style={styles.processingIndicator}>
            <ActivityIndicator size="small" color="#4A90E2" />
            <Text style={styles.processingText}>Analyzing...</Text>
          </View>
        )}
      </View>

      {/* Camera View */}
      <View style={styles.cameraViewContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          onCameraReady={() => {
            console.log('Camera ready');
            // TODO: Start emotion detection in next task
          }}
        >
          {/* Camera Controls Overlay */}
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Face Detection Overlay Placeholder */}
          <View style={styles.faceOverlay}>
            <View style={styles.faceFrame} />
          </View>
        </CameraView>
      </View>

      {/* Bottom Section - Calmness Score */}
      <View style={styles.bottomSection}>
        <Text style={styles.scoreLabel}>Calmness Score</Text>
        <View style={[styles.scoreContainer, { borderColor: getCalmnessColor(calmnessScore) }]}>
          <Text style={[styles.scoreValue, { color: getCalmnessColor(calmnessScore) }]}>
            {calmnessScore}
          </Text>
          <Text style={styles.scoreUnit}>/ 100</Text>
        </View>
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreProgress, 
              { 
                width: `${calmnessScore}%`,
                backgroundColor: getCalmnessColor(calmnessScore)
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );

  // Main render logic based on camera state
  switch (cameraState) {
    case 'loading':
      return renderLoading();
    case 'no-permission':
      return renderPermissionRequest();
    case 'error':
      return renderError();
    case 'active':
      return renderCamera();
    default:
      return renderLoading();
  }
}

const styles = StyleSheet.create({
  // Permission Request Styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
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
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },

  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },

  // Camera Interface Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  topSection: {
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emotionContainer: {
    alignItems: 'flex-start',
  },
  emotionLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  emotionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  emotionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4A90E2',
  },

  // Camera View Styles
  cameraViewContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 20,
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
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.7)',
    borderRadius: 75,
    backgroundColor: 'transparent',
  },

  // Bottom Section Styles
  bottomSection: {
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
    fontSize: 18,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  scoreBar: {
    width: screenWidth - 40,
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
});
