import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Code2, 
  Search, 
  Bug, 
  Zap, 
  FileCode, 
  AlertCircle, 
  CheckCircle2,
  Terminal,
  Play
} from 'lucide-react';

export default function CodeAssist() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any[] | null>(null);

  const runScan = () => {
    setIsScanning(true);
    setScanResults(null);
    
    // Simulate deep static analysis
    setTimeout(() => {
      setScanResults([
        { file: 'src/App.tsx', line: 42, type: 'error', msg: 'Unused import "useEffect"', code: 'import { useEffect } from "react";' },
        { file: 'src/lib/engine.ts', line: 12, type: 'warning', msg: 'Potential regex complexity issue', code: '/[অ-ঔক-য়]/.test(input)' },
        { file: 'src/components/Dashboard.tsx', line: 88, type: 'info', msg: 'Optimization: Use useMemo for chart data', code: 'const data = [...]' },
      ]);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">Code Intelligence</h2>
          <p className="text-slate-500 text-sm">Local static analysis and linting engine</p>
        </div>
        <button 
          onClick={runScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
        >
          {isScanning ? <Zap className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isScanning ? 'Analyzing Project...' : 'Start Full Project Scan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scan Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0d1117] border border-slate-800 space-y-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Project Health</h3>
            <div className="space-y-4">
              {[
                { label: 'Files Scanned', value: '42', icon: FileCode, color: 'text-blue-500' },
                { label: 'Critical Issues', value: scanResults ? '1' : '0', icon: Bug, color: 'text-red-500' },
                { label: 'Code Coverage', value: '88%', icon: Zap, color: 'text-yellow-500' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-slate-400">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-5 h-5 text-cyan-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Local Engine</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aegis Code Assist uses a proprietary local engine for static analysis. No code is transmitted to external servers, Boss.
            </p>
          </div>
        </div>

        {/* Results List */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-[#0d1117] border border-slate-800 min-h-[500px] relative">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                <span className="text-sm font-mono text-cyan-500 uppercase tracking-widest">Scanning Filesystem...</span>
              </motion.div>
            ) : scanResults ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Analysis Results</h3>
                  <span className="text-xs text-slate-500">{scanResults.length} issues found</span>
                </div>
                <div className="space-y-4">
                  {scanResults.map((issue, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${
                            issue.type === 'error' ? 'bg-red-500/10 text-red-500' : 
                            issue.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {issue.type === 'error' ? <Bug className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          </div>
                          <span className="text-sm font-bold text-slate-200">{issue.msg}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{issue.file}:{issue.line}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0d1117] border border-slate-800 font-mono text-xs text-slate-400 overflow-x-auto">
                        {issue.code}
                      </div>
                      <div className="flex gap-2">
                        <button className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider hover:underline">Quick Fix</button>
                        <button className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:underline">Ignore</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-600">
                <Code2 className="w-16 h-16 opacity-20" />
                <p className="text-sm">Ready for project analysis, Sir.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
