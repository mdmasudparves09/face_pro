import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Download, 
  Languages, 
  Zap,
  Play,
  Square,
  AlertCircle,
  Check,
  X as XIcon,
  MessageSquare,
  Send,
  Settings2,
  Repeat,
  User
} from 'lucide-react';
import { parseCommand } from '../lib/engine';
import { aegisVoice } from '../lib/voice';
import { aegisFS, AegisFile } from '../lib/fs';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";

interface VoiceEngineProps {
  onModuleChange?: (moduleId: string) => void;
}

export default function VoiceEngine({ onModuleChange }: VoiceEngineProps) {
  const [isListening, setIsListening] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [intentDisplay, setIntentDisplay] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<{ type: string; data: any } | null>(null);
  const [interactionMode, setInteractionMode] = useState<'voice' | 'chat'>('voice');
  const [chatInput, setChatInput] = useState('');

  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  const handleCommand = useCallback(async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    const result = parseCommand(text);
    setIntentDisplay(result);
    setIsThinking(true);
    
    let reply = '';

    // Handle Confirmation Flow
    if (pendingAction) {
      if (result.intent === 'confirm') {
        if (pendingAction.type === 'delete_file') {
          const file = pendingAction.data as AegisFile;
          aegisFS.deleteFile(file.id);
          reply = `Action confirmed, Boss. I have permanently deleted ${file.name} from the system.`;
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#ef4444', '#dc2626'] });
        }
        setPendingAction(null);
      } else if (result.intent === 'cancel') {
        reply = `Understood, Sir. Operation aborted. The file is safe.`;
        setPendingAction(null);
      } else {
        reply = `Boss, I am waiting for your confirmation to delete the file. Please say "yes" or "no".`;
      }
      setResponse(reply);
      speak(reply);
      setIsThinking(false);
      isProcessingRef.current = false;
      return;
    }

    // Real System Actions
    if (result.intent === 'open_module' && result.target) {
      const target = result.target.toLowerCase();
      let moduleId = '';
      if (target.includes('vision') || target.includes('ocr')) moduleId = 'vision';
      else if (target.includes('file') || target.includes('manager')) moduleId = 'files';
      else if (target.includes('code') || target.includes('assist')) moduleId = 'code';
      else if (target.includes('gmail') || target.includes('mail')) moduleId = 'gmail';
      else if (target.includes('security')) moduleId = 'security';
      else if (target.includes('dashboard') || target.includes('center')) moduleId = 'dashboard';
      else if (target.includes('settings')) moduleId = 'settings';
      else if (target.includes('log')) moduleId = 'logs';

      if (moduleId && onModuleChange) {
        onModuleChange(moduleId);
        reply = `Opening the ${target} module now, Sir. System resources allocated.`;
        setResponse(reply);
        speak(reply);
        setIsThinking(false);
        isProcessingRef.current = false;
        return;
      }
    }

    // Use Gemini for professional responses and clarification
    let shouldSpeakAtEnd = true;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const stream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: `You are Aegis, a highly professional, empathetic, and sophisticated AI command center assistant. 
          You understand English, Bengali, and Banglish (Bengali written in English script) perfectly.
          The user is your "Boss" or "Sir". 
          Your tone should be elite, professional, and warm (like a highly advanced human assistant).
          Acknowledge that the user has been biometrically verified as the authorized administrator.
          
          When responding in Bengali, use formal and polite language (Shuddho Bangla).
          If the user uses Banglish, you can respond in Banglish or Bengali as appropriate for a high-end assistant.
          
          Current Intent Detected: ${result.intent}
          Current Target: ${result.target || 'None'}
          
          CRITICAL: If you don't understand the command or if information is missing (like which file to delete), ASK for clarification politely. Do NOT guess or say you are working on it if you can't.
          
          If the intent is 'create_file', confirm you are initiating file creation with a professional touch.
          If the intent is 'delete_file' and a target is found, ask for confirmation warmly but firmly.
          If the intent is 'scan_folder', confirm you are scanning with technical precision.
          If the intent is 'check_gmail', confirm you are checking the inbox and mention you are prioritizing their time.
          If the intent is 'open_module', confirm you are switching modules.
          
          If the user is just talking to you, respond like a human-like AI companion—intelligent, helpful, and sophisticated.
          Keep responses concise but elite.`,
        },
      });

      let fullText = '';
      let hasStartedSpeaking = false;
      for await (const chunk of stream) {
        const chunkText = chunk.text || '';
        fullText += chunkText;
        setResponse(fullText);
        // Start speaking as soon as we have a decent chunk for speed
        if (fullText.length > 30 && !hasStartedSpeaking) {
          hasStartedSpeaking = true;
          speak(fullText);
        }
      }
      reply = fullText;
      // If we haven't started speaking yet (short response), speak now
      if (!hasStartedSpeaking) {
        speak(reply);
      }
      shouldSpeakAtEnd = false;
    } catch (error) {
      console.error("Gemini Error:", error);
      // Fallback logic if Gemini fails
      if (result.intent === 'create_file') {
        reply = `Done, Boss. I have initiated the creation of your ${result.target || 'requested'} file.`;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#06b6d4', '#3b82f6'] });
      } else if (result.intent === 'delete_file') {
        const files = aegisFS.getFiles();
        const targetName = result.target?.toLowerCase() || '';
        const fileToDelete = files.find(f => f.name.toLowerCase().includes(targetName) || f.type.toLowerCase().includes(targetName));

        if (fileToDelete) {
          reply = `Sir, are you sure you want to delete ${fileToDelete.name}? Please confirm with "yes" or "no".`;
          setPendingAction({ type: 'delete_file', data: fileToDelete });
        } else {
          reply = `I couldn't find any file matching "${result.target || 'that description'}" in the local workspace, Boss.`;
        }
      } else {
        reply = `I understand, Boss. Processing your request for ${text}.`;
      }
    }

    // Post-processing for specific intents (like confetti)
    if (result.intent === 'create_file' && !reply.includes('error')) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#06b6d4', '#3b82f6'] });
    } else if (result.intent === 'delete_file' && !pendingAction) {
      const files = aegisFS.getFiles();
      const targetName = result.target?.toLowerCase() || '';
      const fileToDelete = files.find(f => f.name.toLowerCase().includes(targetName) || f.type.toLowerCase().includes(targetName));
      if (fileToDelete) {
        setPendingAction({ type: 'delete_file', data: fileToDelete });
      }
    }

    setResponse(reply);
    if (shouldSpeakAtEnd) {
      speak(reply);
    }
    setIsThinking(false);
    isProcessingRef.current = false;
  }, [onModuleChange, pendingAction, gender]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = isContinuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'bn-BD';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.results[event.results.length - 1][0].transcript;
        setTranscript(current);
        if (event.results[event.results.length - 1].isFinal) {
          handleCommand(current);
        }
      };

      recognitionRef.current.onend = () => {
        if (isContinuous && isListening) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started
          }
        } else {
          setIsListening(false);
        }
      };

      return () => {
        recognitionRef.current?.stop();
      };
    }
  }, [isContinuous, isListening, handleCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      setIntentDisplay(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = async (text: string) => {
    setIsSpeaking(true);
    const aiVoice = gender === 'female' ? 'Kore' : 'Puck';
    const success = await aegisVoice.speakAI(text, aiVoice);
    
    if (!success) {
      const utterance = aegisVoice.speak(text, gender);
      utterance.onend = () => setIsSpeaking(false);
    } else {
      setIsSpeaking(false);
    }
  };

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      handleCommand(chatInput);
      setChatInput('');
    }
  };

  const downloadAudio = () => {
    if (response) {
      aegisVoice.downloadAudio(response);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">Aegis Interaction Engine</h2>
          <p className="text-slate-500 text-sm">Professional Command Interface // Multilingual</p>
        </div>
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button 
            onClick={() => setInteractionMode('voice')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              interactionMode === 'voice' ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Mic className="w-3.5 h-3.5" /> Voice
          </button>
          <button 
            onClick={() => setInteractionMode('chat')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              interactionMode === 'chat' ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </button>
        </div>
      </div>

      {/* Pending Action Alert */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-500/20 text-red-500">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Awaiting Confirmation</h4>
                <p className="text-xs text-slate-400">
                  Delete <span className="text-red-400 font-mono">{(pendingAction.data as AegisFile).name}</span>?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => handleCommand('no')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-2"
              >
                <XIcon className="w-3 h-3" /> Cancel
              </button>
              <button 
                onClick={() => handleCommand('yes')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Check className="w-3 h-3" /> Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {interactionMode === 'voice' ? (
        <div className="space-y-8">
          {/* Visualizer Area */}
          <div className="relative h-64 rounded-3xl bg-[#0d1117] border border-slate-800 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
            
            <AnimatePresence>
              {isListening ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: [15, 70, 15],
                        backgroundColor: ['#06b6d4', '#3b82f6', '#06b6d4']
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.6, 
                        delay: i * 0.04,
                        ease: "easeInOut"
                      }}
                      className="w-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/10 blur-2xl rounded-full animate-pulse" />
                    <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative z-10 shadow-2xl">
                      <Mic className="w-10 h-10 text-slate-600 transition-colors group-hover:text-cyan-500" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">Aegis Core Idle</span>
                    <p className="text-xs text-slate-600 italic">Standing by for administrative input...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isSpeaking && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-8 flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full"
              >
                <Volume2 className="w-4 h-4 text-cyan-500 animate-pulse" />
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Aegis Speaking...</span>
              </motion.div>
            )}

            {isThinking && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-8 flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full"
              >
                <Zap className="w-4 h-4 text-purple-500 animate-spin" />
                <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Aegis Thinking...</span>
              </motion.div>
            )}

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button 
                onClick={() => setIsContinuous(!isContinuous)}
                className={cn(
                  "p-2 rounded-xl transition-all border",
                  isContinuous ? "bg-cyan-500/20 border-cyan-500 text-cyan-500" : "bg-slate-800 border-slate-700 text-slate-500"
                )}
                title="Toggle Continuous Mode"
              >
                <Repeat className={cn("w-4 h-4", isContinuous && "animate-spin-slow")} />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Input Stream</span>
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-mono text-slate-500">AUTO-DETECT</span>
                  </div>
                </div>
                <div className="min-h-[80px] p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-lg text-white italic">
                  {transcript || 'Waiting for command, Boss...'}
                </div>
              </div>

              <AnimatePresence>
                {response && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Aegis Response</span>
                      <button 
                        onClick={downloadAudio}
                        className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors group"
                      >
                        <Download className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                    <div className="text-lg text-slate-200 leading-relaxed">
                      {response}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-6">
              <button
                onClick={toggleListening}
                className={cn(
                  "w-full aspect-square rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 border-2",
                  isListening 
                    ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" 
                    : "bg-cyan-500/10 border-cyan-500 text-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:scale-[1.02]"
                )}
              >
                {isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
                <span className="text-sm font-bold uppercase tracking-widest">
                  {isListening ? 'Stop Listening' : 'Push to Talk'}
                </span>
                {isContinuous && <span className="text-[10px] uppercase tracking-tighter text-cyan-500/60 font-mono">Continuous Mode Active</span>}
              </button>

              <div className="p-6 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Voice Settings</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setGender('female')}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-colors",
                      gender === 'female' ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    Female
                  </button>
                  <button 
                    onClick={() => setGender('male')}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-colors",
                      gender === 'male' ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    Male
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="h-[500px] bg-[#0d1117] border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Secure Chat Link</span>
              </div>
              <Settings2 className="w-4 h-4 text-slate-500" />
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6">
              {response && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 max-w-[80%]"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-800 text-slate-200 text-sm leading-relaxed border border-slate-700">
                    {response}
                  </div>
                </motion.div>
              )}
              {transcript && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="p-4 rounded-2xl bg-cyan-500 text-white text-sm leading-relaxed shadow-lg shadow-cyan-500/10">
                    {transcript}
                  </div>
                </motion.div>
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="p-6 border-t border-slate-800 bg-slate-900/50">
              <div className="relative">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your command here, Boss..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors pr-16"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intent Analysis */}
      <AnimatePresence>
        {intentDisplay && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Intent</span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                {intentDisplay.intent}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Target</span>
              <div className="text-sm font-bold text-white uppercase">{intentDisplay.target || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Language</span>
              <div className="text-sm font-bold text-white uppercase">{intentDisplay.language}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Confidence</span>
              <div className="text-sm font-bold text-green-500">98.4%</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
