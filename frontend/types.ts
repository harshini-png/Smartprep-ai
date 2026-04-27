export interface User {
  id: string;
  name: string;
  email: string;
  streak: number;
  readinessScore: number;
}

export interface TopicWeightage {
  topic: string;
  weightage: number; // percentage
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ExamAnalysis {
  id: string;
  examName: string;
  dateAnalyzed: string;
  topics: TopicWeightage[];
  predictedHighPriority: string[];
  summary: string;
}

export interface SubjectInput {
  id: string;
  name: string;
  syllabus: string;
  strength: 'Strong' | 'Medium' | 'Weak';
}

export interface StudyTask {
  id: string;
  day: number;
  date: string;
  subject?: string;
  topic: string;
  durationHours: number;
  type: 'Study' | 'Revision' | 'Mock Test';
  completed: boolean;
  learningGoal?: string;
}

export interface StudyPlan {
  id: string;
  examName: string;
  targetDate: string;
  tasks: StudyTask[];
  subjects: SubjectInput[]; // Store subjects to generate mock tests later
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface MockTest {
  id: string;
  subject: string;
  topicFocus: string;
  questions: QuizQuestion[];
  score?: number;
  dateTaken?: string;
  feedback?: string;
}

export interface AppState {
  user: User | null;
  analyses: ExamAnalysis[];
  currentPlan: StudyPlan | null;
  mockTests: MockTest[];
}
