import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Folder, 
  Search, 
  Plus, 
  Trash2, 
  MoreVertical,
  Download,
  ExternalLink,
  AlertTriangle,
  X,
  FileImage
} from 'lucide-react';
import { aegisFS, AegisFile } from '../lib/fs';

export default function FileManager() {
  const [files, setFiles] = useState<AegisFile[]>(aegisFS.getFiles());
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<AegisFile | null>(null);

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (type: AegisFile['type']) => {
    const name = prompt('Enter file name:', 'New_Document');
    if (name) {
      const newFile = aegisFS.createFile(name, type);
      setFiles(aegisFS.getFiles());
    }
  };

  const handleDelete = (id: string) => {
    aegisFS.deleteFile(id);
    setFiles(aegisFS.getFiles());
    setShowConfirm(null);
  };

  const getIcon = (type: AegisFile['type']) => {
    switch (type) {
      case 'word': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'excel': return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'code': return <FileCode className="w-5 h-5 text-cyan-500" />;
      case 'image': return <FileImage className="w-5 h-5 text-purple-500" />;
      case 'folder': return <Folder className="w-5 h-5 text-yellow-500" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search local files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleCreate('word')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Word
          </button>
          <button 
            onClick={() => handleCreate('excel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      <div className="bg-[#0d1117] border border-slate-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Path</th>
              <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Size</th>
              <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Modified</th>
              <th className="px-6 py-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            <AnimatePresence mode="popLayout">
              {filteredFiles.map((file) => (
                <motion.tr 
                  key={file.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setPreviewFile(file)}
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getIcon(file.type)}
                      <span className="text-sm font-medium text-slate-200">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-500">{file.path}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400">{file.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400">{file.lastModified}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConfirm(file.id);
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredFiles.length === 0 && (
          <div className="py-20 text-center space-y-2">
            <Folder className="w-12 h-12 text-slate-800 mx-auto" />
            <p className="text-slate-500 text-sm">No files found in the local workspace, Boss.</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md p-8 rounded-3xl bg-[#0d1117] border border-slate-800 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4 text-red-500">
                <div className="p-3 rounded-2xl bg-red-500/10">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Are you sure you want to delete this file, Sir? This action is permanent and will be logged in the system records.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(showConfirm)}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl h-full max-h-[80vh] flex flex-col rounded-3xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-slate-800">
                    {getIcon(previewFile.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{previewFile.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{previewFile.path}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                {previewFile.type === 'image' ? (
                  <div className="h-full flex items-center justify-center">
                    <img 
                      src={previewFile.content} 
                      alt={previewFile.name} 
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">File Content Analysis</span>
                      <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Secure View Mode</span>
                    </div>
                    <pre className="p-6 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {previewFile.content || 'No content available for this file, Boss.'}
                    </pre>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Size</p>
                    <p className="text-xs font-bold text-white">{previewFile.size}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Last Modified</p>
                    <p className="text-xs font-bold text-white">{previewFile.lastModified}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      const blob = new Blob([previewFile.content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = previewFile.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button 
                    onClick={() => setPreviewFile(null)}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
