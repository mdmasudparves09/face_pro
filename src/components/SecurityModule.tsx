import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Webcam from 'react-webcam';
import { cn } from '../lib/utils';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  Scan,
  AlertTriangle,
  History,
  CheckCircle2
} from 'lucide-react';

export default function SecurityModule() {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef<any>(null);

  const startVerification = () => {
    setShowWebcam(true);
    setIsVerifying(true);
    
    // Simulate face recognition
    setTimeout(() => {
      setIsVerified(true);
      setIsVerifying(false);
      setShowWebcam(false);
    }, 3000);
  };

  const resetSecurity = () => {
    setIsVerified(false);
    setShowWebcam(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Card */}
        <div className="p-8 rounded-3xl bg-[#0d1117] border border-slate-800 space-y-8 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Biometric Access</h3>
              <p className="text-sm text-slate-500">Face ID & Identity Verification</p>
            </div>
            <div className={`p-3 rounded-2xl ${isVerified ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isVerified ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
            <div className="relative">
              <div className={cn(
                "w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500",
                isVerified ? "border-green-500 bg-green-500/5" : "border-slate-800 bg-slate-900",
                isVerifying && "border-cyan-500 animate-pulse"
              )}>
                {showWebcam ? (
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                      videoConstraints={{ facingMode: "user" }}
                      mirrored={false}
                      imageSmoothing={true}
                      forceScreenshotSourceSize={false}
                      disablePictureInPicture={true}
                      onUserMedia={() => {}}
                      onUserMediaError={() => {}}
                      screenshotQuality={1}
                    />
                    <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-full animate-scan" />
                  </div>
                ) : isVerified ? (
                  <Unlock className="w-16 h-16 text-green-500" />
                ) : (
                  <Lock className="w-16 h-16 text-slate-700" />
                )}
              </div>
              
              {isVerifying && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest"
                >
                  Scanning...
                </motion.div>
              )}
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-lg font-bold text-white">
                {isVerified ? 'Access Granted, Boss' : 'System Locked'}
              </h4>
              <p className="text-sm text-slate-500">
                {isVerified ? 'All secure modules are now accessible.' : 'Please verify your identity to continue.'}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            {!isVerified ? (
              <button 
                onClick={startVerification}
                disabled={isVerifying}
                className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Scan className="w-5 h-5" />
                Start Face ID
              </button>
            ) : (
              <button 
                onClick={resetSecurity}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Lock System
              </button>
            )}
          </div>
        </div>

        {/* Security Status & History */}
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-[#0d1117] border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Active Protection</h3>
              <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase">Real-time</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Folder Watch', status: 'Active', icon: Eye, color: 'text-cyan-500' },
                { label: 'Antivirus Engine', status: 'Healthy', icon: ShieldCheck, color: 'text-green-500' },
                { label: 'Network Firewall', status: 'Secure', icon: Lock, color: 'text-blue-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs text-slate-400">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#0d1117] border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-slate-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security Logs</h3>
            </div>
            <div className="space-y-4">
              {[
                { event: 'Biometric Login', time: '10:42 AM', status: 'Success' },
                { event: 'Suspicious File Blocked', time: '09:15 AM', status: 'Alert' },
                { event: 'System Scan', time: '08:00 AM', status: 'Clean' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-medium">{log.event}</span>
                    <span className="text-slate-500 font-mono">{log.time}</span>
                  </div>
                  <span className={cn(
                    "font-bold uppercase tracking-widest",
                    log.status === 'Success' ? 'text-green-500' : 
                    log.status === 'Alert' ? 'text-red-500' : 'text-blue-500'
                  )}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
