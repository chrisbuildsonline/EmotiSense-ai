/**
 * Eye Detection Module
 * Handles eye closure detection and blink analysis
 */

import type { FaceFeature } from './FaceDetector';

export interface EyeDetectionResult {
  eyesClosed: boolean;
  eyeClosureRate: number;
  leftEyeOpen: number;
  rightEyeOpen: number;
  averageEyeOpen: number;
  blinkRate: number;
}

export class EyeDetector {
  private eyeClosureHistory: number[] = [];
  private readonly EYE_CLOSURE_HISTORY_SIZE = 5;
  private readonly EYE_CLOSED_THRESHOLD = 0.3;
  
  // Blink tracking
  private blinkTimestamps: number[] = [];
  private lastEyeState: boolean = false;
  private readonly BLINK_WINDOW_MS = 60000; // 1 minute window

  /**
   * Analyzes eye closure state
   */
  analyzeEyeClosure(face: FaceFeature): EyeDetectionResult {
    const leftEyeOpen = face.leftEyeOpenProbability ?? 0.8;
    const rightEyeOpen = face.rightEyeOpenProbability ?? 0.8;
    const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;
    
    const eyeClosureRate = 1 - avgEyeOpen;
    
    // Add to history for smoothing
    this.eyeClosureHistory.push(eyeClosureRate);
    if (this.eyeClosureHistory.length > this.EYE_CLOSURE_HISTORY_SIZE) {
      this.eyeClosureHistory.shift();
    }
    
    // Calculate average closure rate
    const avgClosure = this.eyeClosureHistory.reduce((a, b) => a + b, 0) / this.eyeClosureHistory.length;
    const eyesClosed = avgClosure > (1 - this.EYE_CLOSED_THRESHOLD);
    
    // Detect blinks (transition from open to closed)
    const now = Date.now();
    if (eyesClosed && !this.lastEyeState) {
      this.blinkTimestamps.push(now);
    }
    this.lastEyeState = eyesClosed;
    
    // Remove old blink timestamps outside the window
    this.blinkTimestamps = this.blinkTimestamps.filter(
      timestamp => now - timestamp < this.BLINK_WINDOW_MS
    );
    
    // Calculate blinks per minute
    const blinkRate = this.blinkTimestamps.length;
    
    return {
      eyesClosed,
      eyeClosureRate: avgClosure,
      leftEyeOpen,
      rightEyeOpen,
      averageEyeOpen: avgEyeOpen,
      blinkRate,
    };
  }

  /**
   * Resets eye detection history
   */
  reset(): void {
    this.eyeClosureHistory = [];
    this.blinkTimestamps = [];
    this.lastEyeState = false;
  }
}
