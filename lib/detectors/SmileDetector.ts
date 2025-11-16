/**
 * Smile Detection Module
 * Handles smile intensity analysis
 */

import type { FaceFeature } from './FaceDetector';

export interface SmileDetectionResult {
  smileIntensity: number;
  isSmiling: boolean;
  confidence: number;
}

export class SmileDetector {
  private readonly SMILE_THRESHOLD = 0.10;
  private lastSmileIntensity = 0;

  /**
   * Analyzes smile intensity with minimal smoothing
   */
  analyzeSmile(face: FaceFeature): SmileDetectionResult {
    const rawSmileIntensity = face.smilingProbability ?? 0;
    
    // Only smooth if new value is lower (prevent drops), otherwise use raw value (instant response)
    let smileIntensity: number;
    if (rawSmileIntensity < this.lastSmileIntensity) {
      // Smooth downward changes to prevent sudden drops
      smileIntensity = this.lastSmileIntensity * 0.7 + rawSmileIntensity * 0.3;
    } else {
      // Use raw value for instant upward response
      smileIntensity = rawSmileIntensity;
    }
    
    this.lastSmileIntensity = smileIntensity;
    
    const isSmiling = smileIntensity > this.SMILE_THRESHOLD;
    const confidence = Math.round(smileIntensity * 100);

    return {
      smileIntensity,
      isSmiling,
      confidence,
    };
  }

  reset(): void {
    this.lastSmileIntensity = 0;
  }
}
