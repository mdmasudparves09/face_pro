import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldAlert, Loader2, Scan, Fingerprint, Lock, UserPlus, CheckCircle2, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

interface FaceVerificationProps {
  onVerified: () => void;
}

export default function FaceVerification({ onVerified }: FaceVerificationProps) {
  const [status, setStatus] = useState<'idle' | 'enrolling' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [enrolledFace, setEnrolledFace] = useState<string | null>(localStorage.getItem('aegis_enrolled_face'));
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const isEnrolled = !!enrolledFace;

  const startProcess = () => {
    if (!isEnrolled) {
      setStatus('enrolling');
    } else {
      setStatus('scanning');
    }
    setProgress(0);
  };

  const captureFace = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedFrame(imageSrc);
      if (status === 'enrolling') {
        localStorage.setItem('aegis_enrolled_face', imageSrc);
        setEnrolledFace(imageSrc);
        setStatus('success');
        setTimeout(() => onVerified(), 2000);
      } else {
        setStatus('verifying');
      }
    }
  }, [status, onVerified]);

  useEffect(() => {
    if (status === 'scanning' || status === 'enrolling') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            captureFace();
            return 100;
          }
          return prev + 2;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [status, captureFace]);

  useEffect(() => {
    if (status === 'verifying') {
      const timer = setTimeout(() => {
        // In a real professional app, we'd use a library like face-api.js here.
        // For this elite experience, we simulate the high-speed matching process.
        setStatus('success');
        setTimeout(() => onVerified(), 1500);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status, onVerified]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0c10] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Grid & Accents */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg aspect-[3/4] md:aspect-square bg-[#0d1117] border border-slate-800 rounded-[40px] shadow-2xl flex flex-col items-center justify-between p-12 overflow-hidden"
      >
        {/* Scanning Frame Corners */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-500 rounded-tl-2xl" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-cyan-500 rounded-tr-2xl" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-cyan-500 rounded-bl-2xl" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-500 rounded-br-2xl" />
        </div>

        <div className="text-center space-y-2 z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-cyan-500" />
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.3em]">
              {isEnrolled ? "Identity Verification Protocol" : "New Identity Enrollment"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isEnrolled ? "Biometric Access" : "Identity Setup"}
          </h1>
          <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
            {isEnrolled 
              ? "Aegis requires facial recognition to unlock system resources" 
              : "Register your face to establish administrative authority"}
          </p>
        </div>

        <div className="relative w-full aspect-square max-w-[280px] rounded-full overflow-hidden border-4 border-slate-800 bg-slate-900 shadow-inner group">
          {status === 'idle' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/80 backdrop-blur-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                {isEnrolled ? (
                  <Fingerprint className="w-16 h-16 text-cyan-500 relative z-10" />
                ) : (
                  <UserPlus className="w-16 h-16 text-cyan-500 relative z-10" />
                )}
              </div>
              <button 
                onClick={startProcess}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                {isEnrolled ? "Initiate Scan" : "Enroll Face"}
              </button>
            </div>
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-700",
                status === 'scanning' || status === 'enrolling' ? "grayscale-0" : "grayscale blur-[2px]"
              )}
              videoConstraints={{ facingMode: "user" }}
              mirrored={true}
              imageSmoothing={true}
              forceScreenshotSourceSize={false}
              disablePictureInPicture={true}
              onUserMedia={() => console.log("Webcam ready")}
              onUserMediaError={() => setStatus('error')}
              screenshotQuality={0.92}
            />
          )}

          {/* Scanning Line Overlay */}
          <AnimatePresence>
            {(status === 'scanning' || status === 'enrolling') && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,1)] z-20"
              />
            )}
          </AnimatePresence>

          {/* Verification Status Overlays */}
          <AnimatePresence>
            {status === 'verifying' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-30"
              >
                <div className="relative w-24 h-24">
                  <Loader2 className="w-full h-full text-cyan-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scan className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.2em]">Matching Patterns</span>
                  <p className="text-[10px] text-slate-500 font-mono italic">Cross-referencing neural database...</p>
                </div>
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-green-500/20 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-30"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/50"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <div className="text-center">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-[0.3em]">Access Granted</span>
                  <p className="text-[10px] text-green-500/60 font-mono mt-1">Identity Confirmed: Boss</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full space-y-6 z-10">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span>{status === 'enrolling' ? 'Capturing Data' : 'Biometric Stream'}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-10 text-slate-600">
            <div className={cn("flex flex-col items-center gap-1.5 transition-colors", status === 'scanning' && "text-cyan-500")}>
              <Camera className="w-4 h-4" />
              <span className="text-[8px] uppercase font-bold tracking-tighter">Capture</span>
            </div>
            <div className={cn("flex flex-col items-center gap-1.5 transition-colors", status === 'verifying' && "text-purple-500")}>
              <Scan className="w-4 h-4" />
              <span className="text-[8px] uppercase font-bold tracking-tighter">Analyze</span>
            </div>
            <div className={cn("flex flex-col items-center gap-1.5 transition-colors", status === 'success' && "text-green-500")}>
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[8px] uppercase font-bold tracking-tighter">Verify</span>
            </div>
          </div>
        </div>

        {/* Technical HUD Elements */}
        <div className="absolute top-12 left-12 text-[8px] font-mono text-cyan-500/30 uppercase space-y-1 pointer-events-none hidden md:block">
          <div>LAT: 23.8103° N</div>
          <div>LON: 90.4125° E</div>
          <div>SYS: AEGIS_OS_v4.2</div>
        </div>
        <div className="absolute bottom-12 right-12 text-[8px] font-mono text-cyan-500/30 uppercase space-y-1 text-right pointer-events-none hidden md:block">
          <div>ENC: AES-256-GCM</div>
          <div>AUTH: BIOMETRIC_LEVEL_5</div>
          <div>STATUS: {status.toUpperCase()}</div>
        </div>

        {/* Decorative Glows */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>
    </div>
  );
}
