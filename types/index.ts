// Core emotion types
export type EmotionType = 'happy' | 'neutral' | 'sad' | 'angry' | 'surprised';

// Emotion detection result
export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  calmnessScore: number;
  timestamp: number;
}

// Emotion session data
export interface EmotionSession {
  id: string;
  emotion: EmotionType;
  calmnessScore: number;
  timestamp: number;
  duration: number;
}

// Daily trend aggregation
export interface DailyTrend {
  date: string;
  averageCalmnessScore: number;
  dominantEmotion: EmotionType;
  sessionCount: number;
  emotionDistribution: Record<EmotionType, number>;
}

// Daily summary
export interface DailySummary {
  date: string;
  totalSessions: number;
  averageScore: number;
  topEmotion: EmotionType;
}