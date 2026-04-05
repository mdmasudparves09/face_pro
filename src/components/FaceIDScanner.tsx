import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Scan, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, ScanEye } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import { loadModels, getFaceData, compareFaces } from '../lib/face-api';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, User } from 'lucide-react';

interface FaceIDScannerProps {
  onUnlock: () => void;
  onRegister: (descriptor: Float32Array) => void;
  registeredDescriptor: Float32Array | null;
  mode: 'unlock' | 'register';
}

type RegistrationStep = 'center' | 'left' | 'right' | 'up' | 'down' | 'complete';

const FaceIDScanner: React.FC<FaceIDScannerProps> = ({ onUnlock, onRegister, registeredDescriptor, mode }) => {
  const webcamRef = useRef<Webcam>(null);
  const isScanningRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'scanning' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [regStep, setRegStep] = useState<RegistrationStep>('center');
  const [capturedDescriptors, setCapturedDescriptors] = useState<Float32Array[]>([]);
  const [poseFeedback, setPoseFeedback] = useState<'success' | 'none'>('none');
  const [stepTimer, setStepTimer] = useState(0);
  const [isStuck, setIsStuck] = useState(false);

  const stopScanning = useCallback(() => {
    isScanningRef.current = false;
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(() => {
    isScanningRef.current = true;
    setIsScanning(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      setStatus('loading');
      try {
        await loadModels();
        setStatus('idle');
      } catch (err) {
        setErrorMessage('Failed to load face recognition models.');
        setStatus('failed');
      }
    };
    init();
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  const handleScan = useCallback(async () => {
    if (status === 'loading' || !webcamRef.current) return;
    
    startScanning();
    setStatus('scanning');
    setProgress(0);
    setErrorMessage(null);
    setSimilarity(null);

    if (mode === 'register') {
      setRegStep('center');
      setCapturedDescriptors([]);
      
      const steps: RegistrationStep[] = ['center', 'left', 'right', 'up', 'down'];
      let currentStepIndex = 0;
      const descriptors: Float32Array[] = [];

      const scanLoop = async () => {
        if (!isScanningRef.current) return;

        setStepTimer(prev => {
          if (prev > 150) setIsStuck(true);
          return prev + 1;
        });

        if (currentStepIndex >= steps.length) {
          // Calculate average descriptor
          const avgDescriptor = new Float32Array(128);
          for (let i = 0; i < 128; i++) {
            let sum = 0;
            for (const d of descriptors) sum += d[i];
            avgDescriptor[i] = sum / descriptors.length;
          }
          onRegister(avgDescriptor);
          setStatus('success');
          stopScanning();
          setRegStep('complete');
          return;
        }

        const currentStep = steps[currentStepIndex];
        setRegStep(currentStep);
        setProgress((currentStepIndex / steps.length) * 100);

        const video = webcamRef.current?.video;
        if (!video) {
          requestAnimationFrame(scanLoop);
          return;
        }

        const faceData = await getFaceData(video);
        if (faceData) {
          const { pose, descriptor } = faceData;
          let stepMet = false;

          switch (currentStep) {
            case 'center':
              if (pose.yaw > 0.45 && pose.yaw < 0.55 && pose.pitch > 0.45 && pose.pitch < 0.55) stepMet = true;
              break;
            case 'left':
              if (pose.yaw < 0.45 || pose.yaw > 0.55) stepMet = true;
              break;
            case 'right':
              if (pose.yaw < 0.45 || pose.yaw > 0.55) stepMet = true;
              break;
            case 'up':
              if (pose.pitch < 0.45) stepMet = true;
              break;
            case 'down':
              if (pose.pitch > 0.55) stepMet = true;
              break;
          }

          // If stuck, accept any face detection to let them proceed
          if (isStuck && faceData) stepMet = true;

          if (stepMet) {
            setPoseFeedback('success');
            setStepTimer(0);
            setIsStuck(false);
            setTimeout(() => setPoseFeedback('none'), 500);
            descriptors.push(descriptor);
            currentStepIndex++;
            // Small delay for UX
            await new Promise(r => setTimeout(r, 1000));
          }
        }

        if (isScanningRef.current) {
          requestAnimationFrame(scanLoop);
        }
      };

      scanLoop();
    } else {
      // Unlock mode - Continuous scanning loop for faster unlock
      let attempts = 0;
      const maxAttempts = 50; // Roughly 5-10 seconds of scanning

      const unlockLoop = async () => {
        if (!isScanningRef.current) return;

        const video = webcamRef.current?.video;
        if (!video) {
          requestAnimationFrame(unlockLoop);
          return;
        }

        const faceData = await getFaceData(video);
        if (faceData && registeredDescriptor) {
          const matchScore = compareFaces(faceData.descriptor, registeredDescriptor);
          setSimilarity(matchScore);
          
          // Use a slightly more lenient threshold for fast unlock if pose is good
          // or stick to the user requested 0.25
          if (matchScore >= 0.25) {
            setStatus('success');
            stopScanning();
            setTimeout(() => onUnlock(), 500); // Faster transition
            return;
          }
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setErrorMessage('Face not recognized. Please try again.');
          setStatus('failed');
          stopScanning();
          return;
        }

        if (isScanningRef.current) {
          requestAnimationFrame(unlockLoop);
        }
      };

      unlockLoop();
    }
  }, [status, mode, registeredDescriptor, onRegister, onUnlock, stopScanning, startScanning]);

  const getStepInstruction = () => {
    switch (regStep) {
      case 'center': return 'Look directly at the camera';
      case 'left': return 'Turn your head slowly to the LEFT';
      case 'right': return 'Turn your head slowly to the RIGHT';
      case 'up': return 'Tilt your head UP';
      case 'down': return 'Tilt your head DOWN';
      case 'complete': return 'Registration Complete!';
      default: return 'Position your face';
    }
  };

  const getStepIcon = () => {
    switch (regStep) {
      case 'center': return <User className="w-8 h-8 text-blue-500" />;
      case 'left': return <ChevronLeft className="w-8 h-8 text-blue-500 animate-pulse" />;
      case 'right': return <ChevronRight className="w-8 h-8 text-blue-500 animate-pulse" />;
      case 'up': return <ChevronUp className="w-8 h-8 text-blue-500 animate-pulse" />;
      case 'down': return <ChevronDown className="w-8 h-8 text-blue-500 animate-pulse" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 space-y-8">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* iOS-style Scanning Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800" />
        
        <AnimatePresence>
          {isScanning && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </AnimatePresence>

        <div className="relative w-56 h-56 rounded-full overflow-hidden bg-black shadow-2xl border-2 border-white/10">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 400,
              height: 400,
              facingMode: "user"
            }}
            mirrored={true}
            imageSmoothing={true}
            forceScreenshotSourceSize={false}
            disablePictureInPicture={true}
            onUserMedia={() => {}}
            onUserMediaError={() => {}}
            screenshotQuality={0.92}
            className="w-full h-full object-cover"
          />
          
          {/* Scanning Overlay */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] z-10"
              />
            )}
          </AnimatePresence>

          {/* Status Overlays */}
          <AnimatePresence>
            {!isScanning && status === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center z-20 bg-black/20"
              >
                <ScanEye className="w-16 h-16 text-white/50" />
              </motion.div>
            )}
            {poseFeedback === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-40 bg-blue-500/20 backdrop-blur-[2px]"
              >
                <CheckCircle2 className="w-20 h-20 text-white shadow-2xl" />
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center z-20"
              >
                <CheckCircle2 className="w-20 h-20 text-green-500" />
              </motion.div>
            )}
            {status === 'failed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center z-20"
              >
                <AlertCircle className="w-20 h-20 text-red-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {mode === 'register' ? 'Register Face' : 'FaceID Unlock'}
        </h2>
        
        {mode === 'register' && isScanning && (
          <div className="flex flex-col items-center space-y-2 py-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
              {getStepIcon()}
            </div>
            <p className="text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
              {getStepInstruction()}
            </p>
            {isStuck && (
              <p className="text-[10px] text-amber-500 font-medium animate-bounce">
                Try moving your head slightly more...
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {status === 'loading' ? 'Initializing models...' : 
           status === 'scanning' ? (mode === 'register' ? 'Follow the instructions' : 'Scanning face...') :
           status === 'success' ? (mode === 'register' ? 'Face registered!' : 'Unlocked!') :
           status === 'failed' ? errorMessage :
           'Position your face in the circle'}
        </p>
        {similarity !== null && (
          <p className="text-xs font-mono text-blue-500">
            Match Confidence: {(similarity * 100).toFixed(1)}%
          </p>
        )}
      </div>

      <div className="w-full space-y-4">
        {isScanning && mode === 'register' && (
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
            <motion.div 
              className="bg-blue-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        <button
          onClick={handleScan}
          disabled={status === 'loading' || isScanning}
          className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-all active:scale-95 ${
            status === 'loading' || isScanning
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
          }`}
        >
          {status === 'loading' ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : mode === 'register' ? (
            <>
              <Scan className="w-5 h-5" />
              <span>Start Registration</span>
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5" />
              <span>Unlock with FaceID</span>
            </>
          )}
        </button>
        
        {isScanning && (
          <button
            onClick={() => {
              stopScanning();
              setStatus('idle');
            }}
            className="w-full py-2 text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Cancel Registration
          </button>
        )}

        {status === 'failed' && (
          <button
            onClick={() => setStatus('idle')}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Try Again
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <ShieldCheck className="w-4 h-4" />
        <span>Secure biometric verification active</span>
      </div>
    </div>
  );
};

export default FaceIDScanner;
