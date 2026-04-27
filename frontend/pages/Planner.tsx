import React, { useState } from 'react';
import { CalendarDays, Clock, Book, AlertTriangle, Loader2, Sparkles, Plus, Trash2, Target, History } from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { SubjectInput } from '../types';

const Planner: React.FC = () => {
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState<number>(4);
  const [preferredSession, setPreferredSession] = useState('Morning');
  const [offDay, setOffDay] = useState('None');
  const [targetScore, setTargetScore] = useState('');
  const [previousScores, setPreviousScores] = useState('');
  
  const [subjects, setSubjects] = useState<SubjectInput[]>([
    { id: 'sub-1', name: '', syllabus: '', strength: 'Medium' }
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setPlan } = useAppContext();
  const navigate = useNavigate();

  const handleAddSubject = () => {
    setSubjects([...subjects, { id: `sub-${Date.now()}`, name: '', syllabus: '', strength: 'Medium' }]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const handleSubjectChange = (id: string, field: keyof SubjectInput, value: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examName || !examDate) {
      setError('Exam name and date are required.');
      return;
    }

    const invalidSubjects = subjects.filter(s => !s.name.trim() || !s.syllabus.trim());
    if (invalidSubjects.length > 0) {
      setError('Please provide a name and syllabus for all subjects.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const plan = await generateStudyPlan(
        examName, 
        examDate, 
        dailyHours, 
        subjects, 
        preferredSession, 
        offDay,
        targetScore,
        previousScores
      );
      setPlan(plan);
      navigate('/dashboard'); // Navigate to dashboard to see the newly generated plan
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 mb-4 shadow-lg shadow-brand-500/30">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Smart Study Planner</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Build a fully personalized study schedule. Add your subjects, paste your syllabus, and let AI optimize your preparation based on your strengths and available time.
        </p>
      </header>

      <form onSubmit={handleGenerate} className="space-y-8">
        
        {/* Section 1: Basic Details */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-4 mb-6 flex items-center gap-2">
            <CalendarDays className="text-brand-400" />
            Exam Details & Preferences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Exam Name</label>
              <input
                type="text"
                required
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g., AWS Solutions Architect, Final Semester Exams"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Exam Date</label>
              <input
                type="date"
                required
                min={minDate}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Daily Study Hours</label>
              <input
                type="number"
                min="1"
                max="16"
                required
                value={dailyHours}
                onChange={(e) => setDailyHours(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Target size={16} className="text-emerald-400" /> Target Score / Grade
              </label>
              <input
                type="text"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                placeholder="e.g., 95%, Grade A"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <History size={16} className="text-orange-400" /> Previous Mock Scores (Optional)
              </label>
              <input
                type="text"
                value={previousScores}
                onChange={(e) => setPreviousScores(e.target.value)}
                placeholder="e.g., 65% in midterms"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Study Session</label>
              <select
                value={preferredSession}
                onChange={(e) => setPreferredSession(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
              >
                <option value="Morning">Morning (Early Bird)</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night (Night Owl)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Weekly Off Day</label>
              <select
                value={offDay}
                onChange={(e) => setOffDay(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
              >
                <option value="None">None (Study Every Day)</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Dynamic Subjects */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Book className="text-emerald-400" />
              Curriculum & Syllabus
            </h3>
            <button
              type="button"
              onClick={handleAddSubject}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-white transition-colors"
            >
              <Plus size={16} />
              Add Subject
            </button>
          </div>

          {subjects.map((subject, index) => (
            <div key={subject.id} className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 relative group">
              {subjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(subject.id)}
                  className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Remove Subject"
                >
                  <Trash2 size={18} />
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject {index + 1} Name
                  </label>
                  <input
                    type="text"
                    required
                    value={subject.name}
                    onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                    placeholder="e.g., Database Management Systems"
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Strength Level
                  </label>
                  <select
                    value={subject.strength}
                    onChange={(e) => handleSubjectChange(subject.id, 'strength', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                  >
                    <option value="Strong">Strong (Needs less time)</option>
                    <option value="Medium">Medium (Average time)</option>
                    <option value="Weak">Weak (Needs more focus)</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Detailed Syllabus / Topics
                  </label>
                  <textarea
                    required
                    value={subject.syllabus}
                    onChange={(e) => handleSubjectChange(subject.id, 'syllabus', e.target.value)}
                    placeholder="Paste the syllabus units or topics here. E.g., Unit 1: Intro to DBMS, Unit 2: ER Model..."
                    rows={4}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono text-sm"
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full flex justify-center items-center gap-3 py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/25 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Analyzing syllabus & crafting plan...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Generate Personalized Study Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Planner;
