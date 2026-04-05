import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Globe, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { time: '00:00', load: 12 },
  { time: '04:00', load: 18 },
  { time: '08:00', load: 45 },
  { time: '12:00', load: 32 },
  { time: '16:00', load: 55 },
  { time: '20:00', load: 28 },
  { time: '23:59', load: 15 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* System Status Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-[#0d1117] to-slate-900 border border-slate-800 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Administrative Command Center</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium max-w-md">
            Welcome back, Boss. All systems are operating within optimal parameters. 
            Biometric security is active and monitoring for unauthorized access.
          </p>
        </div>
        <div className="relative z-10 flex gap-4">
          <div className="px-6 py-3 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Uptime</span>
            <span className="text-lg font-bold text-white">142:12:04</span>
          </div>
          <div className="px-6 py-3 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono text-purple-500 uppercase tracking-widest">Threats</span>
            <span className="text-lg font-bold text-white">0</span>
          </div>
        </div>
        {/* Decorative Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-cyan-500/20 transition-all duration-1000" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'System Integrity', value: '99.9%', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Active Processes', value: '142', icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Memory Usage', value: '4.2 GB', icon: Database, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Global Latency', value: '24 ms', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-[#0d1117] border border-slate-800 hover:border-slate-700 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="h-1.5 w-12 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${stat.bg.replace('/10', '')} w-2/3`} />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-[#0d1117] border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">System Load Distribution</h3>
              <p className="text-sm text-slate-500">Real-time performance metrics</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">Live Feed</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Area type="monotone" dataKey="load" stroke="#06b6d4" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-8 rounded-3xl bg-[#0d1117] border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-6">Recent Operations</h3>
          <div className="space-y-6">
            {[
              { type: 'success', msg: 'Full system scan completed', time: '2m ago', icon: CheckCircle2 },
              { type: 'alert', msg: 'Unauthorized access blocked', time: '15m ago', icon: AlertCircle },
              { type: 'info', msg: 'New security patch applied', time: '1h ago', icon: Clock },
              { type: 'success', msg: 'Backup sync successful', time: '3h ago', icon: CheckCircle2 },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                  item.type === 'success' ? 'bg-green-500/10 text-green-500' : 
                  item.type === 'alert' ? 'bg-red-500/10 text-red-500' : 
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-200 font-medium">{item.msg}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border border-slate-800 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
}
