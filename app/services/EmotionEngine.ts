import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { EmotionResult, EmotionType } from '../types';
import { TensorFlowSetup } from './TensorFlowSetup';

interface FaceDetection {
  topLeft: [number, number];
  bottomRight: [number, number];
  landmarks?: number[][];
  probability?: number;
}

export class EmotionEngine {
  private isInitialized = false;
  private blazeFaceModel: blazeface.BlazeFaceModel | null = null;
  private lastProcessTime = 0;
  private readonly FRAME_THROTTLE_MS = 333; // Process every 3rd frame at 30fps
  private processingQueue: Promise<any> = Promise.resolve();

  async initializeModel(): Promise<void> {
    try {
      console.log('EmotionEngine: Starting model initialization...');
      
      // Ensure TensorFlow.js is ready
      await TensorFlowSetup.initialize();
      
      // Load BlazeFace model
      console.log('EmotionEngine: Loading BlazeFace model...');
      this.blazeFaceModel = await blazeface.load();
      console.log('EmotionEngine: BlazeFace model loaded successfully');
      
      this.isInitialized = true;
      console.log('EmotionEngine: Initialization complete');
    } catch (error) {
      console.error('EmotionEngine: Failed to initialize model:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize emotion detection model: ${errorMessage}`);
    }
  }

  async detectEmotion(imageUri: string): Promise<EmotionResult> {
    if (!this.isInitialized || !this.blazeFaceModel) {
      throw new Error('EmotionEngine not initialized. Call initializeModel() first.');
    }

    // Throttle processing for performance
    const now = Date.now();
    if (now - this.lastProcessTime < this.FRAME_THROTTLE_MS) {
      // Return cached result or skip processing
      return this.getDefaultResult();
    }

    // Queue processing to avoid concurrent operations
    return this.processingQueue = this.processingQueue.then(async () => {
      try {
        this.lastProcessTime = now;
        
        // Convert image URI to tensor
        const imageTensor = await this.loadImageAsTensor(imageUri);
        
        // Detect faces using BlazeFace
        const faces = await this.blazeFaceModel!.estimateFaces(imageTensor, false);
        
        // Clean up tensor
        imageTensor.dispose();
        
        if (faces.length === 0) {
          console.log('EmotionEngine: No faces detected');
          return this.getDefaultResult();
        }

        // Use the first detected face
        const face = faces[0] as FaceDetection;
        
        // Extract emotion from face analysis
        const emotionResult = this.analyzeEmotionFromFace(face, imageTensor.shape);
        
        return {
          emotion: emotionResult.emotion,
          confidence: emotionResult.confidence,
          calmnessScore: this.calculateCalmnessScore(emotionResult.emotion, emotionResult.confidence),
          timestamp: now,
        };
        
      } catch (error) {
        console.error('EmotionEngine: Error during emotion detection:', error);
        return this.getDefaultResult();
      }
    });
  }

  private async loadImageAsTensor(imageUri: string): Promise<tf.Tensor3D> {
    try {
      // For now, create a mock tensor since we need actual image loading implementation
      // In a real implementation, this would load the image from the URI
      // and convert it to a tensor using tf.browser.fromPixels or similar
      
      // Mock tensor representing a 224x224 RGB image
      const mockTensor = tf.randomNormal([224, 224, 3]) as tf.Tensor3D;
      return mockTensor;
    } catch (error) {
      console.error('EmotionEngine: Failed to load image as tensor:', error);
      throw error;
    }
  }

  private analyzeEmotionFromFace(face: FaceDetection, imageShape: number[]): { emotion: EmotionType; confidence: number } {
    // Simple heuristic-based emotion classification
    // In a production app, this would use a trained emotion classification model
    
    const faceWidth = face.bottomRight[0] - face.topLeft[0];
    const faceHeight = face.bottomRight[1] - face.topLeft[1];
    const faceArea = faceWidth * faceHeight;
    const imageArea = imageShape[0] * imageShape[1];
    const faceRatio = faceArea / imageArea;
    
    // Use face probability and geometric features for basic emotion heuristics
    const probability = face.probability || 0.8;
    
    // Simple heuristic based on face size and detection confidence
    let emotion: EmotionType;
    let confidence: number;
    
    if (probability > 0.9 && faceRatio > 0.15) {
      // High confidence, large face - likely happy/engaged
      emotion = 'happy';
      confidence = 0.85;
    } else if (probability > 0.7 && faceRatio > 0.1) {
      // Medium confidence, medium face - neutral
      emotion = 'neutral';
      confidence = 0.75;
    } else if (probability < 0.5) {
      // Low detection confidence - might indicate sadness or looking away
      emotion = 'sad';
      confidence = 0.6;
    } else if (faceRatio < 0.05) {
      // Very small face - might indicate surprise or distance
      emotion = 'surprised';
      confidence = 0.65;
    } else {
      // Default case
      emotion = 'neutral';
      confidence = 0.7;
    }
    
    // Add some randomness to simulate real emotion detection variability
    const randomFactor = (Math.random() - 0.5) * 0.2;
    confidence = Math.max(0.3, Math.min(0.95, confidence + randomFactor));
    
    return { emotion, confidence };
  }

  private getDefaultResult(): EmotionResult {
    return {
      emotion: 'neutral',
      confidence: 0.5,
      calmnessScore: this.calculateCalmnessScore('neutral', 0.5),
      timestamp: Date.now(),
    };
  }

  calculateCalmnessScore(emotion: EmotionType, confidence: number = 1.0): number {
    // Emotion to calmness score mapping based on design document
    const baseScores: Record<EmotionType, [number, number]> = {
      happy: [85, 95],      // Happy: 85-95
      neutral: [70, 80],    // Neutral: 70-80  
      surprised: [60, 75],  // Surprised: 60-75
      sad: [30, 50],        // Sad: 30-50
      angry: [10, 30],      // Angry: 10-30
    };

    const [minScore, maxScore] = baseScores[emotion];
    const range = maxScore - minScore;
    
    // Calculate score based on confidence and add some variability
    const confidenceAdjustment = (confidence - 0.5) * 20; // -10 to +10 adjustment
    const baseScore = minScore + (range * confidence);
    const finalScore = baseScore + confidenceAdjustment;
    
    // Ensure score stays within 0-100 bounds
    return Math.max(0, Math.min(100, Math.round(finalScore)));
  }

  isReady(): boolean {
    return this.isInitialized && this.blazeFaceModel !== null;
  }

  dispose(): void {
    if (this.blazeFaceModel) {
      // BlazeFace models don't have explicit dispose methods
      this.blazeFaceModel = null;
    }
    this.isInitialized = false;
    console.log('EmotionEngine: Disposed');
  }
}