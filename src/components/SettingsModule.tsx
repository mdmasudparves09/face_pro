import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Settings, 
  Volume2, 
  Languages, 
  ShieldCheck, 
  FolderOpen, 
  Bell, 
  Cpu,
  Database,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState('general');
  const [autoVoice, setAutoVoice] = useState(true);
  const [continuousListening, setContinuousListening] = useState(false);
  const [outputPath, setOutputPath] = useState('C:/Users/Boss/Documents/Aegis_Output');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
    { id: 'language', label: 'Language & Locale', icon: Languages },
    { id: 'security', label: 'Security & Privacy', icon: ShieldCheck },
    { id: 'storage', label: 'Storage & Paths', icon: FolderOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="space-y-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id 
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="p-8 rounded-3xl bg-[#0d1117] border border-slate-800 space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white capitalize">{activeTab.replace('_', ' ')} Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Auto-Voice Reply</p>
                    <p className="text-xs text-slate-500">Assistant will automatically speak responses</p>
                  </div>
                  <div 
                    onClick={() => setAutoVoice(!autoVoice)}
                    className={cn(
                      "w-12 h-6 rounded-full relative cursor-pointer transition-colors",
                      autoVoice ? "bg-cyan-500" : "bg-slate-800"
                    )}
                  >
                    <motion.div 
                      animate={{ x: autoVoice ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Continuous Listening</p>
                    <p className="text-xs text-slate-500">Always listen for "Hey Aegis" (Safe Mode)</p>
                  </div>
                  <div 
                    onClick={() => setContinuousListening(!continuousListening)}
                    className={cn(
                      "w-12 h-6 rounded-full relative cursor-pointer transition-colors",
                      continuousListening ? "bg-cyan-500" : "bg-slate-800"
                    )}
                  >
                    <motion.div 
                      animate={{ x: continuousListening ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Output Path</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={outputPath}
                      onChange={(e) => setOutputPath(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-colors">Change</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Hardware Integration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-500">
                    <Cpu className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Processor</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">Intel Core i9-14900K</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-purple-500">
                    <Database className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Memory</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">64GB DDR5 6000MHz</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Biometric Identity</h4>
                  <p className="text-xs text-slate-500">Manage your enrolled facial recognition data</p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('faceid_descriptor');
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-red-500/20 transition-all"
                >
                  Reset FaceID
                </button>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                isSaved 
                  ? "bg-green-600 text-white shadow-green-500/20" 
                  : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20"
              )}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Configuration Saved
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
