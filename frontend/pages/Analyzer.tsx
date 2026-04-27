import React, { useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { analyzeExamContent } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { ExamAnalysis } from '../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];

const Analyzer: React.FC = () => {
  const [examName, setExamName] = useState('');
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExamAnalysis | null>(null);
  
  const { addAnalysis } = useAppContext();

  const handleAnalyze = async () => {
    if (!examName || !content) {
      setError('Please provide both an exam name and content to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await analyzeExamContent(content, examName);
      setResult(analysis);
      addAnalysis(analysis);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Exam Pattern Analyzer</h1>
        <p className="text-slate-400">Paste your syllabus or past paper text, and let AI extract the most important topics and their weightage.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Exam Name</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g., CS101 Final Exam"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 flex justify-between">
                  <span>Syllabus / Past Paper Content</span>
                  <span className="text-xs text-slate-500">Text only for demo</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the text content of your syllabus or past exam papers here..."
                  rows={10}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono text-sm"
                ></textarea>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !examName || !content}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing with Gemini...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Analyze Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-brand-900/40 to-accent-900/40 border border-brand-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <PieChartIcon size={20} className="text-brand-400" />
                  AI Analysis Summary
                </h3>
                <p className="text-slate-300 leading-relaxed">{result.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weightage Chart */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col">
                  <h3 className="text-base font-semibold text-white mb-4">Topic Weightage</h3>
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.topics}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="weightage"
                          nameKey="topic"
                        >
                          {result.topics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                          itemStyle={{ color: '#f8fafc' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* High Priority List */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-white mb-4">Predicted High Priority</h3>
                  <ul className="space-y-3">
                    {result.predictedHighPriority.map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-sm text-slate-200">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Topics Table */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-medium">Topic</th>
                      <th className="px-6 py-4 font-medium">Weightage</th>
                      <th className="px-6 py-4 font-medium">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {result.topics.map((topic, idx) => (
                      <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4 text-slate-200 font-medium">{topic.topic}</td>
                        <td className="px-6 py-4 text-slate-300">{topic.weightage}%</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            topic.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            topic.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {topic.difficulty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Upload size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Analysis Yet</h3>
              <p className="max-w-sm">Fill out the form on the left and click analyze to see AI-generated insights here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyzer;
