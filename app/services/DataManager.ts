import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailySummary, DailyTrend, EmotionSession } from '../types';

export class DataManager {
  private static readonly SESSIONS_KEY = 'emotion_sessions';
  private static readonly TRENDS_KEY = 'daily_trends';

  async initialize(): Promise<void> {
    try {
      console.log('DataManager: Initializing...');
      // Test AsyncStorage access
      await AsyncStorage.getItem('test');
      console.log('DataManager: Initialization complete');
    } catch (error) {
      console.error('DataManager: Failed to initialize:', error);
      throw error;
    }
  }

  async saveEmotionSession(session: EmotionSession): Promise<void> {
    try {
      const existingSessions = await this.getEmotionSessions();
      const updatedSessions = [...existingSessions, session];
      
      await AsyncStorage.setItem(
        DataManager.SESSIONS_KEY,
        JSON.stringify(updatedSessions)
      );
      
      console.log('DataManager: Saved emotion session', session.id);
    } catch (error) {
      console.error('DataManager: Error saving session', error);
      throw error;
    }
  }

  async getEmotionSessions(): Promise<EmotionSession[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem(DataManager.SESSIONS_KEY);
      return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
      console.error('DataManager: Error getting sessions', error);
      return [];
    }
  }

  async getDailyTrends(days: number = 7): Promise<DailyTrend[]> {
    try {
      const trendsJson = await AsyncStorage.getItem(DataManager.TRENDS_KEY);
      const allTrends: DailyTrend[] = trendsJson ? JSON.parse(trendsJson) : [];
      
      // Return last N days
      return allTrends.slice(-days);
    } catch (error) {
      console.error('DataManager: Error getting trends', error);
      return [];
    }
  }

  async calculateDailySummary(date: string): Promise<DailySummary> {
    try {
      const sessions = await this.getEmotionSessions();
      const dayStart = new Date(date).setHours(0, 0, 0, 0);
      const dayEnd = new Date(date).setHours(23, 59, 59, 999);
      
      const daySessions = sessions.filter(
        session => session.timestamp >= dayStart && session.timestamp <= dayEnd
      );

      if (daySessions.length === 0) {
        return {
          date,
          totalSessions: 0,
          averageScore: 0,
          topEmotion: 'neutral',
        };
      }

      const averageScore = daySessions.reduce(
        (sum, session) => sum + session.calmnessScore, 0
      ) / daySessions.length;

      // Find most common emotion
      const emotionCounts = daySessions.reduce((counts, session) => {
        counts[session.emotion] = (counts[session.emotion] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      const topEmotion = Object.entries(emotionCounts).reduce(
        (max, [emotion, count]) => count > max.count ? { emotion, count } : max,
        { emotion: 'neutral', count: 0 }
      ).emotion;

      return {
        date,
        totalSessions: daySessions.length,
        averageScore: Math.round(averageScore),
        topEmotion: topEmotion as any,
      };
    } catch (error) {
      console.error('DataManager: Error calculating daily summary', error);
      throw error;
    }
  }
}