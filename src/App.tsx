import { useState, useEffect, lazy, Suspense } from 'react';
import { 
  LayoutDashboard, 
  Mic, 
  FolderOpen, 
  Code2, 
  Mail, 
  ShieldAlert, 
  ScanEye, 
  Settings, 
  Terminal,
  LogOut,
  User,
  Bell,
  Loader2,
  CheckCircle2,
  X,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import FaceIDScanner from './components/FaceIDScanner';

// Lazy Modules
const Dashboard = lazy(() => import('./components/Dashboard'));
const VoiceEngine = lazy(() => import('./components/VoiceEngine'));
const FileManager = lazy(() => import('./components/FileManager'));
const CodeAssist = lazy(() => import('./components/CodeAssist'));
const GmailAssistant = lazy(() => import('./components/GmailAssistant'));
const SecurityModule = lazy(() => import('./components/SecurityModule'));
const VisionModule = lazy(() => import('./components/VisionModule'));
const SettingsModule = lazy(() => import('./components/SettingsModule'));
const SystemLogs = lazy(() => import('./components/SystemLogs'));

type ModuleId = 
  | 'dashboard' 
  | 'voice' 
  | 'files' 
  | 'code' 
  | 'gmail' 
  | 'security' 
  | 'vision' 
  | 'settings' 
  | 'logs';

export default function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [systemTime, setSystemTime] = useState(new Date());
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'success' | 'error' }[]>([]);
  const [registeredDescriptor, setRegisteredDescriptor] = useState<Float32Array | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('faceid_descriptor');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setRegisteredDescriptor(new Float32Array(arr));
      } catch (e) {
        console.error('Failed to parse saved descriptor');
      }
    }
  }, []);

  const addNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRegister = (descriptor: Float32Array) => {
    setRegisteredDescriptor(descriptor);
    localStorage.setItem('faceid_descriptor', JSON.stringify(Array.from(descriptor)));
    addNotification('Face registered successfully', 'success');
    // Automatically verify after registration
    setIsVerified(true);
  };

  const handleReset = () => {
    localStorage.removeItem('faceid_descriptor');
    setRegisteredDescriptor(null);
    setIsVerified(false);
    addNotification('Face data reset', 'info');
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#0d1117] border border-slate-800 rounded-[40px] shadow-2xl p-8 md:p-12">
          <FaceIDScanner 
            mode={registeredDescriptor ? 'unlock' : 'register'}
            registeredDescriptor={registeredDescriptor}
            onRegister={handleRegister}
            onUnlock={() => {
              setIsVerified(true);
              addNotification('Biometric Verification Successful', 'success');
            }}
          />
          
          {registeredDescriptor && (
            <button 
              onClick={handleReset}
              className="mt-4 w-full text-xs text-slate-600 hover:text-slate-400 font-mono uppercase tracking-widest transition-colors"
            >
              Reset Biometric Data
            </button>
          )}
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Command Center' },
    { id: 'voice', icon: Mic, label: 'Voice Engine' },
    { id: 'files', icon: FolderOpen, label: 'File Manager' },
    { id: 'code', icon: Code2, label: 'Code Assist' },
    { id: 'gmail', icon: Mail, label: 'Gmail Assistant' },
    { id: 'security', icon: ShieldAlert, label: 'Security Module' },
    { id: 'vision', icon: ScanEye, label: 'Vision / OCR' },
    { id: 'logs', icon: Terminal, label: 'System Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderModule = () => {
    return (
      <Suspense fallback={
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Initializing Module...</span>
        </div>
      }>
        {(() => {
          switch (activeModule) {
            case 'dashboard': return <Dashboard />;
            case 'voice': return <VoiceEngine onModuleChange={(id) => setActiveModule(id as ModuleId)} />;
            case 'files': return <FileManager />;
            case 'code': return <CodeAssist />;
            case 'gmail': return <GmailAssistant />;
            case 'security': return <SecurityModule />;
            case 'vision': return <VisionModule />;
            case 'settings': return <SettingsModule />;
            case 'logs': return <SystemLogs />;
            default: return <Dashboard />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div className="flex h-screen bg-[#0a0c10] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative flex flex-col border-r border-slate-800 bg-[#0d1117] shadow-2xl z-50"
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-bold tracking-tight text-lg text-white">AEGIS</span>
              <span className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase">Command Center</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as ModuleId)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                activeModule === item.id 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", activeModule === item.id && "text-cyan-400")} />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              {activeModule === item.id && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Boss</span>
                <span className="text-[10px] text-slate-500">Administrator</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsVerified(false)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">Shutdown System</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/50 bg-[#0d1117]/50 backdrop-blur-md flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="w-5 h-0.5 bg-slate-400 mb-1" />
              <div className="w-5 h-0.5 bg-slate-400 mb-1" />
              <div className="w-5 h-0.5 bg-slate-400" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                {navItems.find(i => i.id === activeModule)?.label}
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                SYSTEM ONLINE // {systemTime.toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-slate-900/50 border border-slate-800 rounded-full text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-500">CPU</span> 12%
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="text-purple-500">RAM</span> 4.2GB
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="text-orange-500">NET</span> 120MB/s
              </div>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-full relative transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full border-2 border-[#0d1117]" />
            </button>
          </div>
        </header>

        {/* Module Container */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>

          {/* Notifications Overlay */}
          <div className="fixed bottom-8 right-8 z-[100] space-y-3 pointer-events-none">
            <AnimatePresence>
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className={cn(
                    "pointer-events-auto min-w-[300px] p-4 rounded-2xl border shadow-2xl flex items-center gap-4 backdrop-blur-md",
                    n.type === 'success' ? "bg-green-500/10 border-green-500/30 text-green-400" :
                    n.type === 'error' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                    "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    n.type === 'success' ? "bg-green-500 text-white" :
                    n.type === 'error' ? "bg-red-500 text-white" :
                    "bg-cyan-500 text-white"
                  )}>
                    {n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                     n.type === 'error' ? <ShieldAlert className="w-4 h-4" /> :
                     <Bell className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest">{n.type} Alert</p>
                    <p className="text-sm font-medium">{n.message}</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none -z-10" />
      </main>
    </div>
  );
}
