import React from 'react';
import { Flame, Target, BookOpen, Award, Bookmark, Sparkles } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, currentPlan } = useAppContext();

  if (!currentPlan) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in">
        <div className="w-24 h-24 bg-brand-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <Target size={40} className="text-brand-400" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Welcome to SmartPrep AI, {user?.name.split(' ')[0]}!</h2>
        <p className="text-slate-400 max-w-lg mb-10 text-lg leading-relaxed">
          You haven't set up your study profile yet. Let's create your personalized AI study plan, mock tests, and revision schedule to get started.
        </p>
        <Link 
          to="/planner"
          className="px-8 py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/25 flex items-center gap-3 text-lg"
        >
          <Sparkles size={24} />
          Complete Your Study Profile
        </Link>
      </div>
    );
  }

  // Mock data for charts based on actual plan progress
  const progressData = [
    { name: 'Mon', hours: 2 },
    { name: 'Tue', hours: 3.5 },
    { name: 'Wed', hours: 1.5 },
    { name: 'Thu', hours: 4 },
    { name: 'Fri', hours: 2.5 },
    { name: 'Sat', hours: 5 },
    { name: 'Sun', hours: 3 },
  ];

  const readinessData = [
    { week: 'W1', score: 40 },
    { week: 'W2', score: 55 },
    { week: 'W3', score: 65 },
    { week: 'W4', score: user?.readinessScore || 0 },
  ];

  const completedTasks = currentPlan.tasks.filter(t => t.completed).length || 0;
  const totalTasks = currentPlan.tasks.length || 1;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
        <p className="text-slate-400">Here's an overview of your study progress.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame className="text-orange-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Study Streak</p>
            <p className="text-2xl font-bold text-white">{user?.streak} Days</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center">
            <Target className="text-brand-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Readiness Score</p>
            <p className="text-2xl font-bold text-white">{user?.readinessScore}%</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <BookOpen className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Topics Completed</p>
            <p className="text-2xl font-bold text-white">{completedTasks} / {totalTasks}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center">
            <Award className="text-accent-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Next Milestone</p>
            <p className="text-lg font-bold text-white truncate">Mock Test 1</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Hours Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Study Hours (This Week)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readiness Trend Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Exam Readiness Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readinessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Current Plan: {currentPlan.examName}</h3>
          <span className="text-sm text-brand-400 font-medium">{progressPercentage}% Complete</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2.5 mb-6">
          <div className="bg-gradient-to-r from-brand-500 to-accent-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        <div className="space-y-3">
          {currentPlan.tasks.slice(0, 3).map(task => (
            <div key={task.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${task.completed ? 'bg-emerald-500' : 'bg-brand-500'}`}></div>
                <div>
                  {task.subject && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-400 mb-0.5 uppercase tracking-wider">
                      <Bookmark size={10} />
                      {task.subject}
                    </div>
                  )}
                  <span className={`font-medium text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {task.topic}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md shrink-0">
                {task.type} • {task.durationHours}h
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
