import React, { createContext, useContext, useEffect, useState } from 'react';
import { EmotionDetector } from '../services/EmotionDetector';

interface ServiceContextType {
  emotionDetector: EmotionDetector | null;
  isInitialized: boolean;
  initializationError: string | null;
}

const ServiceContext = createContext<ServiceContextType>({
  emotionDetector: null,
  isInitialized: false,
  initializationError: null,
});

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

interface ServiceProviderProps {
  children: React.ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const [emotionDetector, setEmotionDetector] = useState<EmotionDetector | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      console.log('ServiceContext: Initializing emotion detector...');
      
      const detectorInstance = new EmotionDetector();
      await detectorInstance.initialize();
      setEmotionDetector(detectorInstance);
      
      setIsInitialized(true);
      console.log('ServiceContext: Emotion detector initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error('ServiceContext: Failed to initialize:', errorMessage);
      setInitializationError(errorMessage);
    }
  };

  const contextValue: ServiceContextType = {
    emotionDetector,
    isInitialized,
    initializationError,
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
};