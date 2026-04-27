import React, { useState } from 'react';
import { GraduationCap, Loader2, PlayCircle, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateMockTest } from '../services/geminiService';
import { MockTest } from '../types';

const MockTests: React.FC = () => {
  const { currentPlan, mockTests, addMockTest, updateMockTestScore } = useAppContext();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [focusWeakAreas, setFocusWeakAreas] = useState(false);
  
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerateTest = async () => {
    if (!currentPlan || !selectedSubject) return;
    
    const subjectData = currentPlan.subjects?.find(s => s.name === selectedSubject);
    if (!subjectData) return;

    setIsGenerating(true);
    try {
      const test = await generateMockTest(subjectData.name, subjectData.syllabus, focusWeakAreas);
      addMockTest(test);
      setActiveTest(test);
      setAnswers({});
      setShowResults(false);
    } catch (error) {
      console.error(error);
      alert("Failed to generate mock test.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;
    
    let correctCount = 0;
    activeTest.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / activeTest.questions.length) * 100);
    let feedback = score >= 80 ? "Great job! You have a solid understanding." : "You need more revision on these topics.";
    
    updateMockTestScore(activeTest.id, score, feedback);
    setShowResults(true);
  };

  if (!currentPlan || !currentPlan.subjects) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <GraduationCap size={32} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Subjects Available</h2>
        <p className="text-slate-400 max-w-md">Generate a study plan first to unlock AI mock tests based on your syllabus.</p>
      </div>
    );
  }

  // Active Test View
  if (activeTest) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
        <header className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{activeTest.subject} Mock Test</h1>
            <p className="text-sm text-slate-400">Focus: {activeTest.topicFocus}</p>
          </div>
          {showResults && (
            <div className="text-right">
              <div className="text-3xl font-bold text-brand-400">{activeTest.score}%</div>
              <div className="text-xs text-slate-400">Final Score</div>
            </div>
          )}
        </header>

        <div className="space-y-8">
          {activeTest.questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                <span className="text-brand-400 mr-2">{qIdx + 1}.</span>
                {q.question}
              </h3>
              
              <div className="space-y-3">
                {q.options.map((opt, oIdx) => {
                  const isSelected = answers[qIdx] === oIdx;
                  const isCorrect = q.correctAnswerIndex === oIdx;
                  
                  let btnClass = "w-full text-left p-4 rounded-xl border transition-all ";
                  
                  if (!showResults) {
                    btnClass += isSelected 
                      ? "bg-brand-600/20 border-brand-500 text-white" 
                      : "bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500";
                  } else {
                    if (isCorrect) {
                      btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-100";
                    } else if (isSelected && !isCorrect) {
                      btnClass += "bg-red-500/20 border-red-500 text-red-100";
                    } else {
                      btnClass += "bg-slate-900/50 border-slate-700 text-slate-500 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={showResults}
                      onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                      className={btnClass}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {showResults && isCorrect && <CheckCircle2 size={18} className="text-emerald-500" />}
                        {showResults && isSelected && !isCorrect && <XCircle size={18} className="text-red-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResults && (
                <div className="mt-4 p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-sm text-slate-300">
                  <span className="font-semibold text-brand-400 block mb-1">Explanation:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {!showResults ? (
          <button
            onClick={handleSubmitTest}
            disabled={Object.keys(answers).length < activeTest.questions.length}
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Test
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTest(null)}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-600"
            >
              Back to Dashboard
            </button>
            {activeTest.score !== undefined && activeTest.score < 70 && (
              <button
                onClick={() => {
                  setActiveTest(null);
                  // In a real app, this could trigger a specific adaptation for this subject
                }}
                className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle size={18} />
                Adapt Study Plan
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">AI Mock Tests</h1>
        <p className="text-slate-400">Generate custom quizzes based on your syllabus to test your knowledge and improve your readiness score.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Generator Card */}
        <div className="md:col-span-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 h-fit">
          <h3 className="text-lg font-semibold text-white mb-4">Generate New Test</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
              >
                <option value="">-- Choose a subject --</option>
                {currentPlan.subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
              <input
                type="checkbox"
                id="focusWeak"
                checked={focusWeakAreas}
                onChange={(e) => setFocusWeakAreas(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-brand-500 focus:ring-brand-500 bg-slate-800"
              />
              <label htmlFor="focusWeak" className="text-sm text-slate-300 cursor-pointer">
                Focus on weak areas
              </label>
            </div>

            <button
              onClick={handleGenerateTest}
              disabled={isGenerating || !selectedSubject}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PlayCircle size={18} />
                  Start Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Test History</h3>
          
          {mockTests.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-slate-700 rounded-2xl text-center text-slate-500">
              No mock tests taken yet. Generate one to get started!
            </div>
          ) : (
            <div className="grid gap-4">
              {mockTests.map(test => (
                <div key={test.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{test.subject}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{test.topicFocus}</span>
                      <span>•</span>
                      <span>{test.dateTaken ? new Date(test.dateTaken).toLocaleDateString() : 'Incomplete'}</span>
                    </div>
                  </div>
                  
                  {test.score !== undefined ? (
                    <div className="text-right">
                      <div className={`text-xl font-bold ${test.score >= 80 ? 'text-emerald-400' : test.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {test.score}%
                      </div>
                      <div className="text-xs text-slate-500">Score</div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveTest(test)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Resume
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockTests;
