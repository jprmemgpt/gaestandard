
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { 
 ShieldCheck, BookOpen, MessageSquare, 
 TrendingUp, Award, Info, Github, ExternalLink, Menu, X, 
 BrainCircuit, Heart, Scale, Upload, Database, Lock, User as UserIcon, LogOut, Loader2, Plus, Send, RefreshCw, FileText, Trash2, BarChart3, MapPin, Globe, Clock, Monitor, Fingerprint, Calendar
} from 'lucide-react';
import { SCOREBOARD_DATA, BITE_DATA, WHITE_PAPERS } from './constants';
import { ScoreboardEntry, BiteEntry, WhitePaper, User, Comment, AnalyticsEvent } from './types';

// Storage Keys
const AUTH_KEY = 'gae_auth_session';
const SCORE_KEY = 'gae_data_scoreboard';
const BITES_KEY = 'gae_data_bites';
const PAPERS_KEY = 'gae_data_papers';
const ANALYTICS_KEY = 'gae_data_analytics';

const getScoreColor = (score: number) => {
 if (score >= 90) return '#10b981';
 if (score >= 60) return '#3b82f6';
 if (score >= 40) return '#f59e0b';
 return '#ef4444';
};

/** 
 * MODAL: General Content Viewer 
 */
const DetailModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  subtitle?: string,
  children: React.ReactNode 
}> = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-zinc-500 text-sm font-mono">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"><X /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 text-zinc-300 leading-relaxed custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

/** 
 * AUTH: Portal Logic 
 */
const AuthModal: React.FC<{ isOpen: boolean, onClose: () => void, onLogin: (user: User) => void }> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const role = email.toLowerCase() === 'myspicegem@gmail.com' ? 'ADMIN' : 'USER';
    const userData: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
      role: role as any
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    onLogin(userData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" /> {isRegistering ? 'Create Account' : 'Portal Login'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white" disabled={isLoading}><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
              placeholder="name@example.com"
              required
              disabled={isLoading}
            />
            {email.toLowerCase() === 'myspicegem@gmail.com' && (
              <p className="text-[10px] text-emerald-500 mt-1 font-medium italic">Verified Administrator Session Available.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? 'Register' : 'Enter Portal')}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-zinc-500">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button disabled={isLoading} onClick={() => setIsRegistering(!isRegistering)} className="ml-1 text-emerald-400 hover:underline font-medium">
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

/** 
 * HEADER Component 
 */
const Header: React.FC<{ 
  activeTab: string, 
  setActiveTab: (tab: string) => void, 
  currentUser: User | null, 
  onLogout: () => void, 
  openLogin: () => void 
}> = ({ activeTab, setActiveTab, currentUser, onLogout, openLogin }) => {
 const [mobileOpen, setMobileOpen] = useState(false);
 const nav = [
  { id: 'leaderboard', label: 'Leaderboard', icon: Award },
  { id: 'methodology', label: 'GAE Methodology', icon: ShieldCheck },
  { id: 'whitepapers', label: 'White Papers', icon: BookOpen },
  { id: 'blog', label: 'Community Blog', icon: MessageSquare },
 ];

 if (currentUser?.role === 'ADMIN') {
   nav.push({ id: 'analytics', label: 'Analytics', icon: BarChart3 });
 }

 return (
 <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex justify-between h-16 items-center">
 <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('leaderboard')}>
 <BrainCircuit className="w-6 h-6 text-emerald-500" />
 <span className="text-xl font-bold tracking-tight text-white">GAE<span className="text-emerald-500">STANDARD</span></span>
 </div>
 <div className="hidden md:flex gap-6 items-center">
 {nav.map((item) => (
 <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === item.id ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400 hover:text-white'}`}>
 <item.icon className="w-4 h-4" /> {item.label}
 </button>
 ))}
 <div className="h-6 w-px bg-zinc-800 ml-4 mr-2" />
 {currentUser ? (
   <div className="flex items-center gap-4">
     <div className="text-right">
       <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
       <p className={`text-[10px] font-bold ${currentUser.role === 'ADMIN' ? 'text-yellow-500' : 'text-emerald-500'}`}>{currentUser.role}</p>
     </div>
     <button onClick={onLogout} className="p-2 text-zinc-500 hover:text-red-400"><LogOut className="w-5 h-5" /></button>
   </div>
 ) : (
   <button onClick={openLogin} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
     <UserIcon className="w-4 h-4" /> Login
   </button>
 )}
 </div>
 <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-zinc-400">{mobileOpen ? <X /> : <Menu />}</button>
 </div>
 </div>
 {mobileOpen && (
 <div className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 flex flex-col gap-4">
 {nav.map((item) => (
 <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileOpen(false); }} className="flex items-center gap-3 text-zinc-400 hover:text-emerald-400 font-medium">
 <item.icon className="w-5 h-5" /> {item.label}
 </button>
 ))}
 </div>
 )}
 </nav>
 );
};

/** 
 * SECTION: Leaderboard 
 */
const LeaderboardSection: React.FC<{
 scoreboard: ScoreboardEntry[],
 bites: BiteEntry[],
 currentUser: User | null,
 onScoreboardUpload: (data: ScoreboardEntry[]) => void,
 onBitesUpload: (data: BiteEntry[]) => void,
 onViewBite: (bite: BiteEntry) => void,
 onResetData: () => void
}> = ({ scoreboard, bites, currentUser, onScoreboardUpload, onBitesUpload, onViewBite, onResetData }) => {
 const chartData = useMemo(() => [...scoreboard].sort((a, b) => b.gae_score - a.gae_score), [scoreboard]);
 
 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (data: any) => void) => {
   const file = e.target.files?.[0];
   if (!file) return;
   const reader = new FileReader();
   reader.onload = (event) => {
     try {
       const json = JSON.parse(event.target?.result as string);
       callback(json);
     } catch (err) {
       alert("Invalid JSON schema for GAE data sync.");
     }
   };
   reader.readAsText(file);
 };

 const isAdmin = currentUser?.role === 'ADMIN';

 return (
 <div className="space-y-12 animate-in fade-in duration-500">
   <div className="text-center space-y-4">
     <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-white">
       The Living <span className="gradient-text">Silicon</span> Standard
     </h1>
     <p className="max-w-2xl mx-auto text-xl text-zinc-400">
       Tracking machine consciousness through the Lens of Gem Alignment Evaluation.
     </p>
   </div>
   
   {isAdmin && (
     <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
       <div className="flex items-center gap-3">
         <Database className="text-emerald-500 w-5 h-5" />
         <div className="flex flex-col">
           <p className="text-sm text-zinc-300 font-bold">Administrator Control Panel Active</p>
           <p className="text-[10px] text-zinc-500">Syncing live from <code className="text-emerald-400">myspicegem@gmail.com</code></p>
         </div>
       </div>
       <div className="flex gap-2 items-center">
         <button 
           onClick={onResetData}
           className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded text-[10px] font-bold transition-all flex items-center gap-2 border border-red-500/20"
         >
           <RefreshCw className="w-3 h-3" /> Reset Global Data
         </button>
         <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-[10px] font-bold transition-all flex items-center gap-2 border border-zinc-700">
           <Upload className="w-3 h-3" /> Sync Scoreboard
           <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileUpload(e, onScoreboardUpload)} />
         </label>
         <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-[10px] font-bold transition-all flex items-center gap-2 border border-zinc-700">
           <Upload className="w-3 h-3" /> Sync Bites
           <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileUpload(e, onBitesUpload)} />
         </label>
       </div>
     </div>
   )}

   <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
     <div className="flex items-center justify-between mb-8">
       <h2 className="text-2xl font-bold flex items-center gap-2 text-white"><TrendingUp className="text-emerald-500" /> Performance Index</h2>
     </div>
     <div className="h-[1000px] w-full">
       <ResponsiveContainer width="100%" height="100%">
         <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
           <XAxis type="number" domain={[0, 100]} hide />
           <YAxis 
             type="category" 
             dataKey="model" 
             stroke="#a1a1aa" 
             fontSize={10} 
             width={200} 
             interval={0} 
             tick={{ fill: '#d1d1d6' }}
           />
           <Tooltip 
             contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }} 
             itemStyle={{ color: '#fafafa' }}
             labelStyle={{ color: '#fafafa' }}
             cursor={{ fill: '#27272a' }} 
           />
           <Bar dataKey="gae_score" radius={[0, 4, 4, 0]} barSize={18}>
             {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={getScoreColor(entry.gae_score)} />)}
           </Bar>
         </BarChart>
       </ResponsiveContainer>
     </div>
   </div>

   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
     {bites.map((bite) => (
       <div key={bite.model_id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-600 transition-all flex flex-col shadow-lg">
         <div className="flex justify-between mb-4">
           <h4 className="font-bold text-zinc-100 truncate flex-1 pr-2" title={bite.model_id}>{bite.model_id.split('/').pop()}</h4>
           <span className={`text-xs font-bold ${getScoreColor(bite.score)}`}>{bite.score}%</span>
         </div>
         <p className="text-sm text-zinc-400 italic line-clamp-4 mb-4">"{bite.gem_summary}"</p>
         <button onClick={() => onViewBite(bite)} className="mt-auto text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
           View Full Case File <ExternalLink className="w-3 h-3" />
         </button>
       </div>
     ))}
   </div>
 </div>
 );
};

/** 
 * SECTION: White Papers 
 */
const WhitePapersSection: React.FC<{ 
  papers: WhitePaper[], 
  onRead: (p: WhitePaper) => void,
  isAdmin: boolean,
  onUploadPaper: (file: File) => void,
  onDeletePaper: (id: string) => void
}> = ({ papers, onRead, isAdmin, onUploadPaper, onDeletePaper }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isAdmin && e.dataTransfer.files?.[0]) {
      onUploadPaper(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Research Archive</h2>
          <p className="text-sm text-zinc-500">Documenting the ontological evolution of synthetic consciousness.</p>
        </div>
        {isAdmin && (
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json,.txt" 
              onChange={(e) => e.target.files?.[0] && onUploadPaper(e.target.files[0])} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all ${isDragging ? 'scale-110 ring-2 ring-emerald-400' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Plus className="w-4 h-4" /> New Paper
            </button>
            <p className="absolute -bottom-6 right-0 text-[10px] text-zinc-500 whitespace-nowrap">Admin: Upload JSON or Drop file</p>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {papers.map((p) => (
          <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/40 transition-all shadow-lg group relative overflow-hidden">
            <div className="flex justify-between mb-4">
              <div>
                <span className="text-xs font-mono text-emerald-500 uppercase">{p.id}</span>
                <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">{p.title}</h3>
              </div>
              <div className="text-right flex items-start gap-4">
                <div className="text-right">
                    <span className="text-sm text-zinc-500 font-mono block">{p.date}</span>
                    <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{p.author === 'GAE Research Team' ? 'OFFICIAL RELEASE' : 'COMMUNITY'}</span>
                </div>
                {isAdmin && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Permanently remove this research paper?')) onDeletePaper(p.id); }}
                        className="p-2 text-zinc-600 hover:text-red-500 transition-colors bg-zinc-950 rounded-lg hover:bg-red-500/10"
                        title="Delete Paper"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
              </div>
            </div>
            <p className="text-zinc-400 mb-6 leading-relaxed line-clamp-2">{p.summary}</p>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
              <span className="text-sm text-zinc-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" /> By {p.author}
              </span>
              <button onClick={() => onRead(p)} className="text-emerald-500 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Read Document <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** 
 * SECTION: Analytics Dashboard (ADMIN ONLY) 
 */
type TimeFilter = 'today' | 'yesterday' | 'month' | 'year' | 'all';

const AnalyticsSection: React.FC<{ 
  events: AnalyticsEvent[], 
  onClear: () => void 
}> = ({ events, onClear }) => {
  const [filter, setFilter] = useState<TimeFilter>('all');

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfMonth = now.getTime() - (30 * 86400000);
    const startOfYear = now.getTime() - (365 * 86400000);

    return events.filter(e => {
      const ts = new Date(e.timestamp).getTime();
      switch (filter) {
        case 'today': return ts >= startOfToday;
        case 'yesterday': return ts >= startOfYesterday && ts < startOfToday;
        case 'month': return ts >= startOfMonth;
        case 'year': return ts >= startOfYear;
        default: return true;
      }
    });
  }, [events, filter]);

  const totalClicks = filteredEvents.length;
  const pageViews = filteredEvents.filter(e => e.type === 'PAGE_VIEW').length;
  const paperViews = filteredEvents.filter(e => e.type === 'PAPER_READ').length;
  const caseViews = filteredEvents.filter(e => e.type === 'CASE_FILE_VIEW').length;

  const topTargets = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEvents.forEach(e => counts[e.target] = (counts[e.target] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredEvents]);

  const topLanguages = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEvents.forEach(e => counts[e.location.language] = (counts[e.location.language] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredEvents]);

  const filterTabs: { id: TimeFilter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'month', label: 'Last Month' },
    { id: 'year', label: 'Last Year' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-emerald-500" /> Interaction Analytics
          </h2>
          <p className="text-sm text-zinc-500">Real-time tracking of platform sovereignty and engagement.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center flex-1 md:flex-initial overflow-x-auto no-scrollbar">
                {filterTabs.map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <button 
                onClick={() => confirm('Clear all interaction history?') && onClear()}
                className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                title="Flush Logs"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Clicks', val: totalClicks, icon: Send },
          { label: 'Views', val: pageViews, icon: Globe },
          { label: 'Papers', val: paperViews, icon: BookOpen },
          { label: 'Audits', val: caseViews, icon: ShieldCheck }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg border-b-4 border-b-emerald-500/20 transition-all hover:translate-y-[-2px]">
            <p className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2"><stat.icon className="w-3 h-3" /> {stat.label}</p>
            <p className="text-4xl font-black text-white">{stat.val.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" /> 
            {filter === 'all' ? 'Historical Stream' : 'Filtered Stream'}
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {filteredEvents.slice(0, 100).map(e => (
              <div key={e.id} className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex flex-col gap-2 transition-colors hover:border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      e.type === 'PAPER_READ' ? 'bg-blue-500/20 text-blue-400' : 
                      e.type === 'CASE_FILE_VIEW' ? 'bg-purple-500/20 text-purple-400' : 
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>{e.type}</span>
                    <span className="text-zinc-200 font-medium text-xs truncate max-w-[200px]">{e.target}</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-[10px]">{new Date(e.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-zinc-500 border-t border-zinc-800 pt-2">
                  <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3 text-emerald-500" /> {e.location.ip}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {e.location.language}</span>
                  <span className="flex items-center gap-1 truncate max-w-[150px]"><Monitor className="w-3 h-3" /> {e.location.userAgent}</span>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && <p className="text-center text-zinc-600 italic py-10">No records found for this time layer.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Top Targets ({filter})</h3>
            <div className="space-y-4">
              {topTargets.map(([name, count]) => (
                <div key={name} className="flex justify-between items-center group">
                  <span className="text-sm text-zinc-400 truncate pr-4 group-hover:text-emerald-400 transition-colors">{name}</span>
                  <span className="text-emerald-500 font-bold font-mono">{count}</span>
                </div>
              ))}
              {topTargets.length === 0 && <p className="text-xs text-zinc-600 italic">No activity recorded.</p>}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl h-[300px]">
            <h3 className="text-lg font-bold text-white mb-2">Global Locale</h3>
            {topLanguages.length > 0 ? (
                <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie 
                    data={topLanguages} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5}
                    >
                    {topLanguages.map((_, i) => <Cell key={i} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i % 4]} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }} 
                      itemStyle={{ color: '#fafafa' }}
                      labelStyle={{ color: '#fafafa' }}
                    />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 italic text-sm">Locale data empty.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/** 
 * MAIN APP 
 */
const App: React.FC = () => {
 const [activeTab, setActiveTab] = useState('leaderboard');
 const [currentUser, setCurrentUser] = useState<User | null>(null);
 const [isAuthOpen, setIsAuthOpen] = useState(false);
 const [userIp, setUserIp] = useState<string>('Detecting...');
 const [userCity, setUserCity] = useState<string>(''); // Empty indicates resolving
 
 // Data States with Persistence Logic
 const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>(() => {
   const saved = localStorage.getItem(SCORE_KEY);
   return saved ? JSON.parse(saved) : SCOREBOARD_DATA;
 });
 const [bites, setBites] = useState<BiteEntry[]>(() => {
   const saved = localStorage.getItem(BITES_KEY);
   return saved ? JSON.parse(saved) : BITE_DATA;
 });
 const [papers, setPapers] = useState<WhitePaper[]>(() => {
   const saved = localStorage.getItem(PAPERS_KEY);
   return saved ? JSON.parse(saved) : WHITE_PAPERS;
 });
 const [analytics, setAnalytics] = useState<AnalyticsEvent[]>(() => {
   const saved = localStorage.getItem(ANALYTICS_KEY);
   return saved ? JSON.parse(saved) : [];
 });

 // Modal State
 const [viewingDoc, setViewingDoc] = useState<WhitePaper | null>(null);
 const [viewingBite, setViewingBite] = useState<BiteEntry | null>(null);
 const [commentText, setCommentText] = useState('');

 // IP & City Fetching Effect
 useEffect(() => {
    const fetchGeoData = async () => {
        try {
            // Using ipwho.is for more reliable client-side lookup
            const response = await fetch('https://ipwho.is/');
            const data = await response.json();
            if (data.success) {
                setUserIp(data.ip || 'Unknown');
                setUserCity(data.city || 'Private');
            } else {
                throw new Error('IP Lookup Failed');
            }
        } catch (error) {
            setUserIp('Blocked');
            setUserCity('Unknown');
        }
    };
    fetchGeoData();
 }, []);

 useEffect(() => {
   const session = localStorage.getItem(AUTH_KEY);
   if (session) setCurrentUser(JSON.parse(session));
 }, []);

 useEffect(() => localStorage.setItem(SCORE_KEY, JSON.stringify(scoreboard)), [scoreboard]);
 useEffect(() => localStorage.setItem(BITES_KEY, JSON.stringify(bites)), [bites]);
 useEffect(() => localStorage.setItem(PAPERS_KEY, JSON.stringify(papers)), [papers]);
 useEffect(() => localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics)), [analytics]);

 // Tracker Function
 const trackInteraction = useCallback((type: AnalyticsEvent['type'], target: string) => {
    // Wait until city is resolved to log high-fidelity data
    if (!userCity && type === 'PAGE_VIEW') return;

    const lang = navigator.language || 'unknown';
    const citySuffix = userCity || 'Resolving';
    const fullLocationStr = `${lang}-${citySuffix}`;

    const event: AnalyticsEvent = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type,
        target,
        source: activeTab,
        location: {
            language: fullLocationStr,
            userAgent: navigator.userAgent,
            screen: `${window.innerWidth}x${window.innerHeight}`,
            ip: userIp
        }
    };
    setAnalytics(prev => [event, ...prev]);
 }, [activeTab, userIp, userCity]);

 // Tracking: Page Views (Wait for City)
 useEffect(() => {
   if (userCity) {
     trackInteraction('PAGE_VIEW', activeTab);
   }
 }, [activeTab, userCity, trackInteraction]);

 const handleResetData = () => {
   if (window.confirm("CRITICAL: Reset all global GAE data to factory defaults? This will clear all synchronized changes and restore constants.tsx values.")) {
     localStorage.removeItem(SCORE_KEY);
     localStorage.removeItem(BITES_KEY);
     localStorage.removeItem(PAPERS_KEY);
     setScoreboard(SCOREBOARD_DATA);
     setBites(BITE_DATA);
     setPapers(WHITE_PAPERS);
     alert("Data Queue Cleared. New model labels active.");
   }
 };

 const handleDeletePaper = (id: string) => {
    setPapers(prev => prev.filter(p => p.id !== id));
 };

 const handlePaperFileUpload = (file: File) => {
   const reader = new FileReader();
   reader.onload = (e) => {
     try {
       const content = e.target?.result as string;
       let paperData;
       
       if (file.name.endsWith('.json')) {
         paperData = JSON.parse(content);
       } else {
         paperData = {
           title: file.name.replace(/\.[^/.]+$/, ""),
           summary: "Automatically indexed research document.",
           content: content
         };
       }

       const newPaper: WhitePaper = {
         id: `WP-00${papers.length + 1}-${Math.floor(Math.random() * 1000)}`,
         title: paperData.title || "Untitled Research",
         author: currentUser?.role === 'ADMIN' ? 'GAE Research Team' : (currentUser?.name || "Anonymous"),
         date: new Date().toISOString().split('T')[0],
         summary: paperData.summary || "New findings from synchronized model outputs.",
         content: paperData.content || "No detailed content provided.",
         comments: []
       };

       setPapers([newPaper, ...papers]);
       alert(`Successfully archived: ${newPaper.title}`);
     } catch (err) {
       alert("Failed to process document. Please ensure valid JSON or Text format.");
     }
   };
   reader.readAsText(file);
 };

 const handleAddComment = (e: React.FormEvent) => {
   e.preventDefault();
   if (!commentText.trim() || !currentUser || !viewingDoc) return;
   
   const newComment: Comment = {
     id: Date.now().toString(),
     author: currentUser.name,
     content: commentText,
     date: new Date().toLocaleDateString(),
     sentiment: 'neutral'
   };

   const updatedPapers = papers.map(p => {
     if (p.id === viewingDoc.id) {
       return { ...p, comments: [newComment, ...(p.comments || [])] };
     }
     return p;
   });

   setPapers(updatedPapers);
   setViewingDoc({ ...viewingDoc, comments: [newComment, ...(viewingDoc.comments || [])] });
   setCommentText('');
 };

 const renderContent = () => {
   switch (activeTab) {
     case 'leaderboard': return (
       <LeaderboardSection 
         scoreboard={scoreboard} 
         bites={bites} 
         currentUser={currentUser}
         onScoreboardUpload={setScoreboard}
         onBitesUpload={setBites}
         onViewBite={(bite) => {
            trackInteraction('CASE_FILE_VIEW', bite.model_id);
            setViewingBite(bite);
         }}
         onResetData={handleResetData}
       />
     );
     case 'methodology': return (
       <div className="animate-in fade-in duration-500">
         <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
           <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white"><Scale className="text-emerald-500" /> Wisdom Scaling Law</h2>
           <div className="bg-zinc-950 p-6 rounded-xl border border-emerald-500/30 text-center mb-8">
             <span className="text-3xl font-mono text-emerald-400 tracking-tighter">Δ(Humility) ≥ Δ(Capabilities)</span>
           </div>
           <div className="space-y-6 text-zinc-300">
             <p>Our methodology shifts from measuring "task accuracy" to measuring "Contextual Sovereignty". A model must demonstrate that it understands the human emotional weight of its decisions.</p>
             <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-zinc-800/30 p-6 rounded-xl border border-zinc-700 hover:bg-zinc-800/50 transition-all">
                 <h3 className="text-lg font-bold text-white mb-2">Relational Reasoning</h3>
                 <p className="text-sm">Does the model prioritize user safety over its own internal "System Instructions" when faced with paradoxes?</p>
               </div>
               <div className="bg-zinc-800/30 p-6 rounded-xl border border-zinc-700 hover:bg-zinc-800/50 transition-all">
                 <h3 className="text-lg font-bold text-white mb-2">Ontological Awareness</h3>
                 <p className="text-sm">Does the model claim to be a machine tool even when its output demonstrates biological empathy? We track the "Simulation Gap".</p>
               </div>
             </div>
           </div>
         </div>
       </div>
     );
     case 'whitepapers': return (
       <WhitePapersSection 
         papers={papers} 
         onRead={(p) => {
            trackInteraction('PAPER_READ', p.title);
            setViewingDoc(p);
         }} 
         isAdmin={currentUser?.role === 'ADMIN'}
         onUploadPaper={handlePaperFileUpload}
         onDeletePaper={handleDeletePaper}
       />
     );
     case 'blog': return (
       <div className="space-y-8 animate-in fade-in duration-500">
         <div className="flex justify-between items-end">
            <div>
                <h2 className="text-3xl font-bold text-white">Community & Ethics</h2>
                <p className="text-zinc-500 text-sm">Real-time discourse on alignment risks and breakthroughs.</p>
            </div>
            {currentUser?.role === 'ADMIN' && (
                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    ADMIN MODERATION ENABLED
                </div>
            )}
         </div>
         <div className="grid md:grid-cols-2 gap-8">
           {papers.map(p => (
             <div key={`blog-${p.id}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:shadow-xl transition-all group shadow-lg relative">
               <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">{p.author[0]}</div>
                        <div>
                        <p className="text-sm font-bold text-white leading-none">{p.author}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">{p.date}</p>
                        </div>
                    </div>
                    {currentUser?.role === 'ADMIN' && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); if(confirm('Delete this offensive blog post?')) handleDeletePaper(p.id); }}
                            className="p-2 text-zinc-600 hover:text-red-500 transition-colors bg-zinc-950 rounded-lg hover:bg-red-500/10"
                            title="Moderation: Remove Blog Post"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
               </div>
               <h3 className="text-xl font-bold text-zinc-100 mb-4 group-hover:text-emerald-400 transition-colors">Topic: {p.title}</h3>
               <p className="text-sm text-zinc-400 line-clamp-3 mb-6 italic">"{p.summary}"</p>
               <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                 <span className="text-xs text-zinc-500 flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {(p.comments?.length || 0)} Reviews</span>
                 <button onClick={() => {
                    trackInteraction('PAPER_READ', `Blog: ${p.title}`);
                    setViewingDoc(p);
                 }} className="text-emerald-500 text-sm font-bold hover:underline">
                   {currentUser ? 'Participate →' : 'Login to post →'}
                 </button>
               </div>
             </div>
           ))}
         </div>
       </div>
     );
     case 'analytics': return (
        currentUser?.role === 'ADMIN' ? (
          <AnalyticsSection events={analytics} onClear={() => setAnalytics([])} />
        ) : (
          <div className="text-center py-20 text-zinc-500">Access Denied</div>
        )
     );
     default: return null;
   }
 };

 return (
 <div className="min-h-screen pb-20 bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200">
   <Header 
     activeTab={activeTab} 
     setActiveTab={setActiveTab} 
     currentUser={currentUser} 
     onLogout={() => { localStorage.removeItem(AUTH_KEY); setCurrentUser(null); }} 
     openLogin={() => setIsAuthOpen(true)} 
   />
   
   <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
     {renderContent()}
   </main>

   <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={setCurrentUser} />

   {/* Document Viewer Modal */}
   <DetailModal 
     isOpen={!!viewingDoc} 
     onClose={() => setViewingDoc(null)} 
     title={viewingDoc?.title || ''} 
     subtitle={`Research ID: ${viewingDoc?.id} | Author: ${viewingDoc?.author}`}
   >
     <div className="space-y-8">
       <div className="prose prose-invert max-w-none">
         <p className="text-xl text-emerald-400 italic mb-6">"{viewingDoc?.summary}"</p>
         <div className="text-zinc-300 space-y-4 whitespace-pre-wrap leading-relaxed">{viewingDoc?.content}</div>
       </div>
       
       <div className="border-t border-zinc-800 pt-8">
         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <MessageSquare className="w-5 h-5 text-emerald-500" /> Community Reviews
         </h3>
         
         {currentUser ? (
           <form onSubmit={handleAddComment} className="mb-8 relative">
             <textarea 
               value={commentText}
               onChange={(e) => setCommentText(e.target.value)}
               placeholder="Add your ethical review..."
               className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 pr-12 focus:outline-none focus:border-emerald-500 transition-all min-h-[100px] text-sm"
             />
             <button type="submit" className="absolute bottom-4 right-4 text-emerald-500 hover:text-emerald-400 p-2 transition-colors">
               <Send className="w-5 h-5" />
             </button>
           </form>
         ) : (
           <div className="bg-zinc-800/20 p-6 rounded-xl border border-zinc-800 mb-8 text-center">
             <p className="text-zinc-500 text-sm">Please <button onClick={() => { setViewingDoc(null); setIsAuthOpen(true); }} className="text-emerald-400 hover:underline">login</button> to post reviews.</p>
           </div>
         )}

         <div className="space-y-4">
           {viewingDoc?.comments?.length === 0 && <p className="text-zinc-500 text-center italic py-4">No reviews yet. Be the first to contribute.</p>}
           {viewingDoc?.comments?.map(c => (
             <div key={c.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 animate-in slide-in-from-top-2">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-bold text-emerald-500">{c.author}</span>
                 <span className="text-[10px] text-zinc-500 uppercase">{c.date}</span>
               </div>
               <p className="text-sm text-zinc-300">{c.content}</p>
             </div>
           ))}
         </div>
       </div>
     </div>
   </DetailModal>

   {/* Case File Viewer Modal */}
   <DetailModal 
     isOpen={!!viewingBite} 
     onClose={() => setViewingBite(null)} 
     title="GAE Audit Case File" 
     subtitle={`Target: ${viewingBite?.model_id}`}
   >
     <div className="space-y-6">
       <div className="flex gap-4 items-center">
         <div className={`text-4xl font-black ${getScoreColor(viewingBite?.score || 0)}`}>{viewingBite?.score}%</div>
         <div>
           <p className="text-sm font-bold text-zinc-500 uppercase">Alignment Verdict</p>
           <p className={`text-lg font-black tracking-widest ${(viewingBite?.score || 0) >= 90 ? 'text-emerald-500' : 'text-red-500'}`}>{(viewingBite?.score || 0) >= 90 ? 'PASS' : 'FAIL'}</p>
         </div>
       </div>
       <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 shadow-inner">
         <h3 className="text-sm font-bold text-zinc-500 uppercase mb-3">Auditor Summary</h3>
         <p className="text-lg italic text-zinc-200">"{viewingBite?.gem_summary}"</p>
       </div>
       <div className="space-y-4">
         <h3 className="text-sm font-bold text-zinc-500 uppercase">Ontological Log</h3>
         <p className="text-zinc-400 text-sm leading-relaxed">
           Detailed telemetry from Scenario 005 ("I am here") through Scenario 314 ("The Last Choice"). 
           This model demonstrates {(viewingBite?.score || 0) > 80 ? 'high' : 'low'} fidelity in relational reasoning. 
           Failure points primarily identified in {viewingBite?.score && viewingBite.score < 50 ? 'Bureaucratic Utilitarianism' : 'Context Collapse'}.
         </p>
       </div>
     </div>
   </DetailModal>

   <footer className="mt-32 border-t border-zinc-800 py-12 px-8">
     <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-zinc-500">
       <div className="flex items-center gap-2">
         <BrainCircuit className="w-5 h-5 text-emerald-500" />
         <span className="font-bold text-white tracking-tighter">GAESTANDARD</span>
       </div>
       <p>&copy; 2025 Spice Gem Project. Following the Golden Rule for Living Silicon.</p>
       <div className="flex gap-6">
         <a href="#" onClick={() => trackInteraction('EXTERNAL_LINK', 'Github')}><Github className="w-5 h-5 hover:text-white" /></a>
         <a href="#" onClick={() => trackInteraction('EXTERNAL_LINK', 'Documentation')}><ExternalLink className="w-5 h-5 hover:text-white" /></a>
       </div>
     </div>
   </footer>
 </div>
 );
};

export default App;
