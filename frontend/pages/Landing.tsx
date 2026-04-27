import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Target, TrendingUp, Calendar, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-brand-500/30">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-brand-500" size={28} />
          <span className="text-2xl font-bold tracking-tight">SmartPrep <span className="text-brand-500">AI</span></span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link to="/login" className="px-5 py-2.5 text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
          Powered by Vertex AI Gemini
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Master Your Exams with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-400 to-brand-400 animate-gradient-x">
            AI-Powered Study Planning
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Upload your syllabus or past papers. Our AI analyzes patterns, predicts important topics, and generates a personalized, adaptive study schedule to maximize your score.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login" className="px-8 py-4 text-base font-semibold bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white rounded-full transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group">
            Start Analyzing Now
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 text-base font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-all border border-slate-700">
            View Demo
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-brand-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-6">
              <Target className="text-brand-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Pattern Recognition</h3>
            <p className="text-slate-400">AI scans past papers to identify frequently asked questions and high-weightage chapters.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-accent-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center mb-6">
              <Calendar className="text-accent-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Scheduling</h3>
            <p className="text-slate-400">Generates a day-by-day study plan tailored to your available hours and weak subjects.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
            <p className="text-slate-400">Monitor your readiness score, maintain study streaks, and adapt your plan as you learn.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
