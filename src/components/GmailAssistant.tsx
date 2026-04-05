import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Mail, 
  RefreshCw, 
  Search, 
  Star, 
  Reply, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Send,
  User
} from 'lucide-react';

export default function GmailAssistant() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

  const syncEmails = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setEmails([
        { id: '1', from: 'John Doe', subject: 'Project Alpha Update', body: 'Boss, the latest build is ready for your review. Please check the local workspace.', time: '10:30 AM', priority: true },
        { id: '2', from: 'Sarah Smith', subject: 'Meeting Rescheduled', body: 'Sir, the meeting with the investors has been moved to 2 PM tomorrow.', time: '09:15 AM', priority: false },
        { id: '3', from: 'System Alert', subject: 'Security Patch Available', body: 'A new security patch is available for the local firewall engine.', time: 'Yesterday', priority: true },
      ]);
      setIsSyncing(false);
    }, 1500);
  };

  useEffect(() => {
    syncEmails();
  }, []);

  const handleReply = () => {
    alert(`Reply sent to ${selectedEmail.from}, Sir.`);
    setReplyDraft('');
    setSelectedEmail(null);
  };

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">Gmail Assistant</h2>
          <p className="text-slate-500 text-sm">Controlled internet access for secure communication</p>
        </div>
        <button 
          onClick={syncEmails}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          {isSyncing ? 'Syncing...' : 'Sync Inbox'}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Inbox List */}
        <div className="lg:col-span-1 bg-[#0d1117] border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search emails..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={cn(
                  "w-full p-4 border-b border-slate-800/50 text-left transition-colors flex gap-3",
                  selectedEmail?.id === email.id ? "bg-cyan-500/5 border-l-2 border-l-cyan-500" : "hover:bg-slate-800/30"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate">{email.from}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{email.time}</span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-300 truncate mb-1">{email.subject}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{email.body}</p>
                </div>
                {email.priority && <Star className="w-3 h-3 text-yellow-500 shrink-0 mt-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* Email Content */}
        <div className="lg:col-span-2 bg-[#0d1117] border border-slate-800 rounded-3xl overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
            {selectedEmail ? (
              <motion.div 
                key={selectedEmail.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedEmail.from}</h3>
                      <p className="text-xs text-slate-500">to: boss@aegis.local</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Star className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-6">{selectedEmail.subject}</h2>
                <div className="flex-1 text-slate-300 leading-relaxed whitespace-pre-wrap mb-8">
                  {selectedEmail.body}
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <textarea 
                      placeholder="Draft your reply, Boss..."
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-200 resize-none min-h-[100px]"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-white">Bangla</button>
                        <button className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-white">English</button>
                      </div>
                      <button 
                        onClick={handleReply}
                        className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all"
                      >
                        <Send className="w-4 h-4" /> Send Reply
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic text-center">
                    Aegis will process this reply locally and request approval before transmission.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-600">
                <Mail className="w-16 h-16 opacity-20" />
                <p className="text-sm">Select an email to read, Sir.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
