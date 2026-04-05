import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../lib/utils';
import { 
  ScanEye, 
  Upload, 
  FileText, 
  Copy, 
  CheckCircle2, 
  Zap,
  Image as ImageIcon,
  Loader2,
  Download
} from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function VisionModule() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const processImage = async (imgData: string) => {
    setIsProcessing(true);
    setExtractedText('');
    setProgress(0);

    try {
      const worker = await Tesseract.createWorker('eng+ben', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const { data: { text } } = await worker.recognize(imgData);
      setExtractedText(text);
      await worker.terminate();
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Boss, there was an error processing the image locally.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    alert('Text copied to clipboard, Sir.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Upload Area */}
        <div className="flex-1 space-y-6">
          <div 
            {...getRootProps()} 
            className={cn(
              "h-80 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden relative",
              isDragActive ? "border-cyan-500 bg-cyan-500/5" : "border-slate-800 bg-[#0d1117] hover:border-slate-700"
            )}
          >
            <input {...getInputProps()} />
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-contain p-4" />
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-slate-800/50">
                  <Upload className="w-8 h-8 text-slate-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Drop screenshot or image here</p>
                  <p className="text-xs text-slate-500 mt-1">Local OCR processing (Eng/Ben)</p>
                </div>
              </>
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-cyan-500"
                  />
                </div>
                <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Analyzing Content... {progress}%</span>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Local Vision Engine</h4>
              <p className="text-xs text-slate-500">Powered by Tesseract.js. No cloud transmission, Sir.</p>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 flex flex-col bg-[#0d1117] border border-slate-800 rounded-3xl overflow-hidden min-h-[400px]">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Extracted Text</h3>
            </div>
            {extractedText && (
              <div className="flex gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy Text
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob([extractedText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'extracted_text.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 p-8 text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto custom-scrollbar">
            {extractedText || (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-600 italic">
                <ScanEye className="w-12 h-12 opacity-20" />
                <p>Waiting for input, Boss...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
