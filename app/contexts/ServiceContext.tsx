import React, { createContext, useContext, useEffect, useState } from 'react';
import { SleepinessDetector } from '../services/SleepinessDetector';

interface ServiceContextType {
  sleepinessDetector: SleepinessDetector | null;
  isInitialized: boolean;
  initializationError: string | null;
}

const ServiceContext = createContext<ServiceContextType>({
  sleepinessDetector: null,
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
  const [sleepinessDetector, setSleepinessDetector] = useState<SleepinessDetector | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      console.log('ServiceContext: Initializing sleepiness detector...');
      
      const detectorInstance = new SleepinessDetector();
      await detectorInstance.initialize();
      setSleepinessDetector(detectorInstance);
      
      setIsInitialized(true);
      console.log('ServiceContext: Sleepiness detector initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error('ServiceContext: Failed to initialize:', errorMessage);
      setInitializationError(errorMessage);
    }
  };

  const contextValue: ServiceContextType = {
    sleepinessDetector,
    isInitialized,
    initializationError,
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
};