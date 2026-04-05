import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Terminal, 
  Search, 
  Filter, 
  Download, 
  Trash2,
  Clock,
  Shield,
  Zap,
  Info
} from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const initialLogs = [
      { id: 1, type: 'system', msg: 'Aegis Core initialized successfully', time: '07:00:01', status: 'OK' },
      { id: 2, type: 'security', msg: 'Face ID verification successful', time: '07:05:12', status: 'SECURE' },
      { id: 3, type: 'voice', msg: 'Command received: "akta excel file create koro"', time: '07:08:45', status: 'PROC' },
      { id: 4, type: 'fs', msg: 'File created: New_Document.xlsx', time: '07:08:46', status: 'DONE' },
      { id: 5, type: 'vision', msg: 'OCR processing started for screenshot_1.png', time: '07:10:22', status: 'BUSY' },
      { id: 6, type: 'gmail', msg: 'Inbox sync completed. 3 new items found.', time: '07:12:05', status: 'OK' },
    ];
    setLogs(initialLogs);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-500';
      case 'SECURE': return 'text-cyan-500';
      case 'PROC': return 'text-yellow-500';
      case 'DONE': return 'text-blue-500';
      case 'BUSY': return 'text-purple-500';
      default: return 'text-slate-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-3 h-3 text-red-500" />;
      case 'system': return <Zap className="w-3 h-3 text-yellow-500" />;
      case 'voice': return <Clock className="w-3 h-3 text-cyan-500" />;
      default: return <Info className="w-3 h-3 text-slate-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">System Event Logs</h2>
          <p className="text-slate-500 text-sm">Real-time audit trail of all assistant actions</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Download className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 bg-[#0d1117] border border-slate-800 rounded-3xl overflow-hidden flex flex-col font-mono">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-[10px] text-slate-400">
              <Filter className="w-3 h-3" /> ALL EVENTS
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-[10px] text-slate-400">
              <Search className="w-3 h-3" /> SEARCH
            </div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest">
            Total Entries: {logs.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          {logs.map((log) => (
            <div key={log.id} className="group flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-slate-800/30 transition-colors">
              <span className="text-[10px] text-slate-600 w-20 shrink-0">{log.time}</span>
              <div className="flex items-center gap-2 w-24 shrink-0">
                {getTypeIcon(log.type)}
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{log.type}</span>
              </div>
              <span className="flex-1 text-xs text-slate-300 truncate">{log.msg}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest w-16 text-right ${getStatusColor(log.status)}`}>
                {log.status}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-4 py-2 px-4">
            <span className="text-[10px] text-cyan-500 animate-pulse">_</span>
            <span className="text-[10px] text-slate-600 italic">Listening for new events...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
