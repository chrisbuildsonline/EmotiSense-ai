import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export class TensorFlowSetup {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (TensorFlowSetup.isInitialized) {
      return;
    }

    try {
      // Wait for tf to be ready
      await tf.ready();
      
      console.log('TensorFlow.js initialized successfully');
      console.log('Backend:', tf.getBackend());
      
      TensorFlowSetup.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
      throw error;
    }
  }

  static isReady(): boolean {
    return TensorFlowSetup.isInitialized;
  }
}