import { GoogleGenAI, Type } from '@google/genai';
import { ExamAnalysis, StudyPlan, StudyTask, SubjectInput, MockTest, QuizQuestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'dummy-key-for-ui-testing', vertexai: true });

export const analyzeExamContent = async (content: string, examName: string): Promise<ExamAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following syllabus or exam past paper content for an exam named "${examName}". 
      Extract the main topics, estimate their percentage weightage based on importance or frequency, 
      and classify their difficulty (Easy, Medium, Hard). Also, predict 3-5 specific high-priority concepts.
      
      Content:
      ${content}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING, description: 'Name of the topic' },
                  weightage: { type: Type.NUMBER, description: 'Estimated percentage weightage (0-100)' },
                  difficulty: { type: Type.STRING, description: 'Easy, Medium, or Hard' }
                },
                required: ['topic', 'weightage', 'difficulty']
              }
            },
            predictedHighPriority: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 3-5 specific high-priority concepts to study'
            },
            summary: {
              type: Type.STRING,
              description: 'A brief 1-2 sentence summary of the analysis strategy'
            }
          },
          required: ['topics', 'predictedHighPriority', 'summary']
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    
    return {
      id: `analysis-${Date.now()}`,
      examName,
      dateAnalyzed: new Date().toISOString(),
      topics: result.topics,
      predictedHighPriority: result.predictedHighPriority,
      summary: result.summary
    };
  } catch (error) {
    console.error("Error analyzing exam:", error);
    throw new Error("Failed to analyze exam content. Please check your API key and try again.");
  }
};

export const generateStudyPlan = async (
  examName: string, 
  examDate: string, 
  dailyHours: number, 
  subjects: SubjectInput[], 
  preferredSession: string,
  offDay: string,
  targetScore: string,
  previousScores: string
): Promise<StudyPlan> => {
  try {
    const targetDateObj = new Date(examDate);
    const today = new Date();
    const daysUntilExam = Math.max(1, Math.ceil((targetDateObj.getTime() - today.getTime()) / (1000 * 3600 * 24)));

    const subjectsFormatted = subjects.map(s => 
      `Subject: ${s.name}\nStrength Level: ${s.strength}\nSyllabus:\n${s.syllabus}`
    ).join('\n\n');

    const prompt = `Act as an expert AI Study Coach. Create a highly personalized, day-by-day study plan for an exam named "${examName}".
    
    User Profile & Goals:
    - Target Score/Grade: ${targetScore || 'Not specified'}
    - Previous Mock Scores: ${previousScores || 'Not specified'}
    
    Constraints & Preferences:
    - Days available until exam: ${daysUntilExam} days
    - Daily study hours available: ${dailyHours} hours
    - Preferred study session: ${preferredSession}
    - Weekly off day: ${offDay} (Do not schedule heavy study on this day)
    
    Curriculum Details:
    ${subjectsFormatted}
    
    Instructions:
    1. Distribute topics across the available days.
    2. Prioritize 'Weak' subjects/topics early and allocate more time to them.
    3. Implement Spaced Repetition: Schedule 'Revision' sessions for topics a few days after they are first studied.
    4. Include 'Study' sessions for learning new concepts.
    5. Include at least one 'Mock Test' near the end of the schedule.
    6. Provide a specific 'learningGoal' for each task (e.g., "Understand the difference between TCP and UDP").
    7. Ensure total hours per day do not exceed ${dailyHours}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: 'Day number (1 to daysUntilExam)' },
                  subject: { type: Type.STRING, description: 'Name of the subject' },
                  topic: { type: Type.STRING, description: 'Specific topic to study or do' },
                  learningGoal: { type: Type.STRING, description: 'A short, actionable goal for this session' },
                  durationHours: { type: Type.NUMBER, description: 'Hours allocated for this task' },
                  type: { type: Type.STRING, description: 'Must be exactly: Study, Revision, or Mock Test' }
                },
                required: ['day', 'subject', 'topic', 'learningGoal', 'durationHours', 'type']
              }
            }
          },
          required: ['tasks']
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    
    const tasks: StudyTask[] = result.tasks.map((t: any, index: number) => {
      const taskDate = new Date();
      taskDate.setDate(taskDate.getDate() + (t.day - 1));
      
      return {
        id: `task-${Date.now()}-${index}`,
        day: t.day,
        date: taskDate.toISOString(),
        subject: t.subject,
        topic: t.topic,
        learningGoal: t.learningGoal,
        durationHours: t.durationHours,
        type: t.type as 'Study' | 'Revision' | 'Mock Test',
        completed: false
      };
    });

    return {
      id: `plan-${Date.now()}`,
      examName,
      targetDate: targetDateObj.toISOString(),
      tasks,
      subjects
    };
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Failed to generate study plan.");
  }
};

export const generateMockTest = async (subject: string, syllabus: string, weakTopicsFocus: boolean): Promise<MockTest> => {
  try {
    const focusInstruction = weakTopicsFocus 
      ? "Focus heavily on complex, difficult concepts to test weak areas." 
      : "Provide a balanced mix of easy, medium, and hard questions covering the syllabus.";

    const prompt = `Generate a multiple-choice mock test for the subject "${subject}".
    Syllabus context: ${syllabus}
    
    Instructions:
    1. Generate exactly 5 high-quality multiple-choice questions.
    2. ${focusInstruction}
    3. Provide 4 plausible options for each question.
    4. Indicate the correct answer index (0 to 3).
    5. Provide a brief explanation of why the answer is correct.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Exactly 4 options"
                  },
                  correctAnswerIndex: { type: Type.INTEGER, description: "0, 1, 2, or 3" },
                  explanation: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctAnswerIndex', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    
    return {
      id: `mock-${Date.now()}`,
      subject,
      topicFocus: weakTopicsFocus ? 'Weak Areas Focus' : 'General Syllabus',
      questions: result.questions
    };
  } catch (error) {
    console.error("Error generating mock test:", error);
    throw new Error("Failed to generate mock test.");
  }
};

export const adaptStudyPlan = async (currentPlan: StudyPlan): Promise<StudyPlan> => {
  try {
    // Separate completed and uncompleted tasks
    const completedTasks = currentPlan.tasks.filter(t => t.completed);
    const pendingTasks = currentPlan.tasks.filter(t => !t.completed);
    
    const prompt = `Act as an AI Study Coach. The user has fallen behind or needs their schedule adapted.
    Exam: ${currentPlan.examName}
    
    Here are the tasks they have NOT completed yet:
    ${JSON.stringify(pendingTasks.map(t => ({ subject: t.subject, topic: t.topic, type: t.type, durationHours: t.durationHours })))}
    
    Instructions:
    1. Reschedule these pending tasks starting from Day 1 (which represents today).
    2. If there are too many tasks, prioritize 'Study' and 'Revision' of core topics.
    3. Output a new array of tasks. Keep the same JSON structure.
    4. Ensure daily hours are balanced (around 4-6 hours max per day).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: 'Day number starting from 1 (today)' },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  learningGoal: { type: Type.STRING },
                  durationHours: { type: Type.NUMBER },
                  type: { type: Type.STRING }
                },
                required: ['day', 'subject', 'topic', 'learningGoal', 'durationHours', 'type']
              }
            }
          },
          required: ['tasks']
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    
    const newTasks: StudyTask[] = result.tasks.map((t: any, index: number) => {
      const taskDate = new Date();
      taskDate.setDate(taskDate.getDate() + (t.day - 1));
      
      return {
        id: `task-adapted-${Date.now()}-${index}`,
        day: t.day,
        date: taskDate.toISOString(),
        subject: t.subject,
        topic: t.topic,
        learningGoal: t.learningGoal || `Master ${t.topic}`,
        durationHours: t.durationHours,
        type: t.type as 'Study' | 'Revision' | 'Mock Test',
        completed: false
      };
    });

    // Combine completed tasks (keep their original dates) with new adapted tasks
    return {
      ...currentPlan,
      tasks: [...completedTasks, ...newTasks]
    };
  } catch (error) {
    console.error("Error adapting plan:", error);
    throw new Error("Failed to adapt study plan.");
  }
};
