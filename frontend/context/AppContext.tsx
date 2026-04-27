import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, User, ExamAnalysis, StudyPlan, MockTest } from '../types';
import { adaptStudyPlan } from '../services/geminiService';

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  addAnalysis: (analysis: ExamAnalysis) => void;
  setPlan: (plan: StudyPlan) => void;
  toggleTaskCompletion: (taskId: string) => void;
  addMockTest: (test: MockTest) => void;
  updateMockTestScore: (testId: string, score: number, feedback: string) => void;
  triggerAdaptPlan: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [analyses, setAnalyses] = useState<ExamAnalysis[]>([]);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);

  const login = (newUser: User) => setUser(newUser);
  const logout = () => setUser(null);
  
  const addAnalysis = (analysis: ExamAnalysis) => {
    setAnalyses(prev => [analysis, ...prev]);
  };

  const setPlan = (plan: StudyPlan) => {
    setCurrentPlan(plan);
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (!currentPlan) return;
    
    const updatedTasks = currentPlan.tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    setCurrentPlan({ ...currentPlan, tasks: updatedTasks });
    
    if (user) {
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const totalCount = updatedTasks.length;
      const newScore = Math.round((completedCount / totalCount) * 100) || 0;
      setUser({ ...user, readinessScore: newScore });
    }
  };

  const addMockTest = (test: MockTest) => {
    setMockTests(prev => [test, ...prev]);
  };

  const updateMockTestScore = (testId: string, score: number, feedback: string) => {
    setMockTests(prev => prev.map(t => 
      t.id === testId ? { ...t, score, feedback, dateTaken: new Date().toISOString() } : t
    ));
    
    // Adjust readiness score based on mock test performance
    if (user) {
      const currentScore = user.readinessScore;
      // Simple logic: blend current readiness with mock test score
      const newScore = Math.round((currentScore * 0.7) + (score * 0.3));
      setUser({ ...user, readinessScore: newScore });
    }
  };

  const triggerAdaptPlan = async () => {
    if (!currentPlan) return;
    const adaptedPlan = await adaptStudyPlan(currentPlan);
    setCurrentPlan(adaptedPlan);
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      analyses, 
      currentPlan, 
      mockTests,
      login, 
      logout, 
      addAnalysis, 
      setPlan,
      toggleTaskCompletion,
      addMockTest,
      updateMockTestScore,
      triggerAdaptPlan
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
