import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DBContextType {
  isInitialized: boolean;
  setInitialized: (isInitialized: boolean) => void;
}

const DBContext = createContext<DBContextType | undefined>(undefined);

export const DBContextProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setInitialized] = useState(false);

  return (
    <DBContext.Provider value={{ isInitialized, setInitialized }}>
      {children}
    </DBContext.Provider>
  );
};

export const useDB = () => {
  const context = useContext(DBContext);
  if (context === undefined) {
    throw new Error('useDB must be used within a DBContextProvider');
  }
  return context;
};
