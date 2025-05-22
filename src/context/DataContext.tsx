import React, { createContext, useContext, useState } from 'react';

export type DataPoint = {
  [key: string]: string | number;
};

export type DataSet = {
  id: string;
  name: string;
  data: DataPoint[];
  columns: string[];
  createdAt: Date;
  createdBy: string;
};

type DataContextType = {
  datasets: DataSet[];
  currentDataset: DataSet | null;
  setCurrentDataset: (dataset: DataSet | null) => void;
  addDataset: (dataset: DataSet) => void;
  removeDataset: (id: string) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<DataSet[]>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('datasets');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert string dates back to Date objects
      return parsed.map((ds: any) => ({
        ...ds,
        createdAt: new Date(ds.createdAt)
      }));
    }
    return [];
  });
  
  const [currentDataset, setCurrentDataset] = useState<DataSet | null>(null);

  const addDataset = (dataset: DataSet) => {
    const newDatasets = [...datasets, dataset];
    setDatasets(newDatasets);
    localStorage.setItem('datasets', JSON.stringify(newDatasets));
  };

  const removeDataset = (id: string) => {
    const newDatasets = datasets.filter(ds => ds.id !== id);
    setDatasets(newDatasets);
    localStorage.setItem('datasets', JSON.stringify(newDatasets));
    
    // If the current dataset is being removed, set it to null
    if (currentDataset && currentDataset.id === id) {
      setCurrentDataset(null);
    }
  };

  return (
    <DataContext.Provider value={{ 
      datasets, 
      currentDataset, 
      setCurrentDataset,
      addDataset, 
      removeDataset 
    }}>
      {children}
    </DataContext.Provider>
  );
};