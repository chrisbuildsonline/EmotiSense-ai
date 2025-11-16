/**
 * Emotion Classification Module
 * Classifies emotions based on facial features
 */

export type EmotionType = 'happy' | 'excited' | 'neutral' | 'tired';

export interface EmotionClassificationResult {
  emotion: EmotionType;
  confidence: number;
  reasoning: string;
}

export class EmotionClassifier {
  /**
   * Classifies emotion based on facial features
   */
  classifyEmotion(
    smileIntensity: number,
    energyLevel: number,
    headMovement: number,
    eyesClosed: boolean
  ): EmotionClassificationResult {
    // Tired state takes priority if eyes are closed
    if (eyesClosed) {
      return {
        emotion: 'tired',
        confidence: 90,
        reasoning: 'Eyes are closed',
      };
    }
    
    // Excited: very high smile + high energy
    if (smileIntensity > 0.7 && energyLevel > 70) {
      return {
        emotion: 'excited',
        confidence: Math.min(95, smileIntensity * 100),
        reasoning: 'Very high smile intensity and energy level',
      };
    }
    
    // Happy: clear smile detected (0.25+)
    if (smileIntensity > 0.25) {
      const confidence = Math.min(90, 60 + (smileIntensity * 60));
      return {
        emotion: 'happy',
        confidence,
        reasoning: 'Smile detected',
      };
    }
    
    // Default to neutral
    return {
      emotion: 'neutral',
      confidence: 70,
      reasoning: 'Relaxed or neutral expression',
    };
  }
}
