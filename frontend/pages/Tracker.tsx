import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Calendar, Clock, BookOpen, AlertCircle, Bookmark, RefreshCw, Loader2, Target } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Tracker: React.FC = () => {
  const { currentPlan, toggleTaskCompletion, triggerAdaptPlan } = useAppContext();
  const [isAdapting, setIsAdapting] = useState(false);

  // Group tasks by day
  const tasksByDay = useMemo(() => {
    if (!currentPlan) return [];
    
    const grouped = currentPlan.tasks.reduce((acc, task) => {
      const day = task.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(task);
      return acc;
    }, {} as Record<number, typeof currentPlan.tasks>);

    return Object.entries(grouped).map(([day, tasks]) => ({
      day: parseInt(day),
      date: tasks[0].date,
      tasks
    })).sort((a, b) => a.day - b.day);
  }, [currentPlan]);

  const handleAdaptPlan = async () => {
    setIsAdapting(true);
    try {
      await triggerAdaptPlan();
    } catch (error) {
      console.error(error);
      alert("Failed to adapt plan. Please try again.");
    } finally {
      setIsAdapting(false);
    }
  };

  if (!currentPlan) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Calendar size={32} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Study Plan</h2>
        <p className="text-slate-400 max-w-md mb-8">You haven't generated a study plan yet. Head over to the planner to create your personalized schedule.</p>
        <Link 
          to="/planner"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors"
        >
          Create a Plan
        </Link>
      </div>
    );
  }

  const completedCount = currentPlan.tasks.filter(t => t.completed).length;
  const totalCount = currentPlan.tasks.length;
  const progress = Math.round((completedCount / totalCount) * 100) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Progress Tracker</h1>
          <p className="text-slate-400">Plan: <span className="text-brand-400 font-medium">{currentPlan.examName}</span></p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={handleAdaptPlan}
            disabled={isAdapting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            {isAdapting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Adapt Schedule
          </button>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center gap-6 min-w-[250px]">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">Overall Progress</span>
                <span className="text-brand-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
        {tasksByDay.map((dayGroup, index) => {
          const isToday = index === 0; // Mocking 'today' for demo
          const dayCompleted = dayGroup.tasks.every(t => t.completed);
          
          return (
            <div key={dayGroup.day} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline dot */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                dayCompleted ? 'bg-emerald-500' : isToday ? 'bg-brand-500' : 'bg-slate-700'
              }`}>
                <span className="text-xs font-bold text-white">D{dayGroup.day}</span>
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-slate-800/50 border border-slate-700 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    Day {dayGroup.day}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {new Date(dayGroup.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {dayGroup.tasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        task.completed 
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : 'bg-slate-900/50 border-slate-700 hover:border-brand-500/50'
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 focus:outline-none">
                        {task.completed ? (
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        ) : (
                          <Circle size={20} className="text-slate-500 hover:text-brand-400 transition-colors" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        {task.subject && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-400 mb-1 uppercase tracking-wider">
                            <Bookmark size={10} />
                            {task.subject}
                          </div>
                        )}
                        <p className={`text-sm font-medium leading-snug ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {task.topic}
                        </p>
                        
                        {task.learningGoal && !task.completed && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-400 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                            <Target size={12} className="text-accent-400 shrink-0 mt-0.5" />
                            <span>{task.learningGoal}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            task.type === 'Study' ? 'bg-blue-500/10 text-blue-400' :
                            task.type === 'Revision' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-orange-500/10 text-orange-400'
                          }`}>
                            {task.type === 'Study' && <BookOpen size={10} />}
                            {task.type === 'Revision' && <CheckCircle2 size={10} />}
                            {task.type === 'Mock Test' && <AlertCircle size={10} />}
                            {task.type}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={12} />
                            {task.durationHours}h
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tracker;
