import { User, ExamAnalysis, StudyPlan } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Student',
  email: 'alex@example.com',
  streak: 0,
  readinessScore: 0,
};

export const MOCK_ANALYSIS: ExamAnalysis = {
  id: 'a1',
  examName: 'Computer Science 101 Final',
  dateAnalyzed: new Date().toISOString(),
  topics: [
    { topic: 'Data Structures', weightage: 35, difficulty: 'Hard' },
    { topic: 'Algorithms', weightage: 25, difficulty: 'Hard' },
    { topic: 'Object Oriented Programming', weightage: 20, difficulty: 'Medium' },
    { topic: 'Databases', weightage: 15, difficulty: 'Medium' },
    { topic: 'Web Basics', weightage: 5, difficulty: 'Easy' },
  ],
  predictedHighPriority: ['Binary Trees', 'Sorting Algorithms', 'Polymorphism'],
  summary: 'Focus heavily on Data Structures and Algorithms as they constitute 60% of the expected exam weight based on historical patterns.',
};

export const MOCK_PLAN: StudyPlan = {
  id: 'p1',
  examName: 'Computer Science 101 Final',
  targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  tasks: [
    { id: 't1', day: 1, date: new Date().toISOString(), subject: 'Data Structures', topic: 'Arrays & Linked Lists', durationHours: 2, type: 'Study', completed: true },
    { id: 't2', day: 1, date: new Date().toISOString(), subject: 'Algorithms', topic: 'Basic Sorting', durationHours: 1, type: 'Study', completed: false },
    { id: 't3', day: 2, date: new Date(Date.now() + 86400000).toISOString(), subject: 'Data Structures', topic: 'Trees & Graphs', durationHours: 3, type: 'Study', completed: false },
    { id: 't4', day: 3, date: new Date(Date.now() + 86400000 * 2).toISOString(), subject: 'OOP', topic: 'OOP Concepts', durationHours: 2, type: 'Study', completed: false },
    { id: 't5', day: 4, date: new Date(Date.now() + 86400000 * 3).toISOString(), subject: 'Data Structures', topic: 'Revision: Data Structures', durationHours: 2, type: 'Revision', completed: false },
  ],
  subjects: []
};
