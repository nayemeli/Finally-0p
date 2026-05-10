import React, { useMemo, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, TransactionType, TRANSLATIONS, PUBLIC_USER_ID } from '../types';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Cell, ComposedChart } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO, subDays, subMonths, eachMonthOfInterval, startOfYear, endOfYear, subYears } from 'date-fns';
import { Calendar, X, ChevronRight, History, TrendingUp, BarChart3, Clock, Edit2, Wallet, Plus, Sparkles, Palette } from 'lucide-react';
import { cn } from '../lib/utils';
import TransactionList from './TransactionList';
import TransactionEditModal from './TransactionEditModal';

interface Props {
  lang: 'en' | 'bn';
  currency: string;
  exchangeRate: number;
}

export default function SummaryCharts({ lang, currency, exchangeRate }: Props) {
  const t = TRANSLATIONS[lang] as any;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [timeRange, setTimeRange] = useState<'D' | 'W' | 'M' | 'Y'>('M');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', PUBLIC_USER_ID)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(data);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const convert = (amt: number) => amt / exchangeRate;

    const now = new Date();
    let start, end, days: Date[] = [];
    let isMonthly = false;

    switch (timeRange) {
      case 'D':
        start = subDays(now, 6);
        end = now;
        days = eachDayOfInterval({ start, end });
        break;
      case 'W':
        start = subDays(now, 13);
        end = now;
        days = eachDayOfInterval({ start, end });
        break;
      case 'M':
        start = startOfMonth(now);
        end = endOfMonth(now);
        days = eachDayOfInterval({ start, end });
        break;
      case 'Y':
        start = startOfYear(now);
        end = endOfYear(now);
        days = eachMonthOfInterval({ start, end });
        isMonthly = true;
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
        days = eachDayOfInterval({ start, end });
    }

    const filteredTransactions = transactions.filter(tr => {
      const trDate = parseISO(tr.date);
      return isWithinInterval(trDate, { start, end });
    });

    const totalIncome = filteredTransactions
      .filter(tr => tr.type === TransactionType.INCOME)
      .reduce((sum, tr) => sum + convert(tr.amount), 0);

    const totalExpense = filteredTransactions
      .filter(tr => tr.type === TransactionType.EXPENSE)
      .reduce((sum, tr) => sum + convert(tr.amount), 0);

    const trendData = days.map(day => {
      let dateLabel = '';
      let dateKey = '';
      let periodTransactions = [];

      if (isMonthly) {
        dateLabel = format(day, 'MMM');
        dateKey = format(day, 'yyyy-MM');
        periodTransactions = transactions.filter(tr => tr.date.startsWith(dateKey));
      } else {
        dateLabel = format(day, 'dd MMM');
        dateKey = format(day, 'yyyy-MM-dd');
        periodTransactions = transactions.filter(tr => tr.date === dateKey);
      }

      const income = periodTransactions
        .filter(tr => tr.type === TransactionType.INCOME)
        .reduce((sum, tr) => sum + convert(tr.amount), 0);

      const expense = periodTransactions
        .filter(tr => tr.type === TransactionType.EXPENSE)
        .reduce((sum, tr) => sum + convert(tr.amount), 0);

      return {
        date: dateKey,
        displayDate: dateLabel,
        income: Number(income.toFixed(2)),
        expense: Number(expense.toFixed(2))
      };
    });

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, trendData };
  }, [transactions, exchangeRate, timeRange]);

  const selectedDayTransactions = useMemo(() => {
    if (!selectedDay) return [];
    return transactions.filter(tr => tr.date === selectedDay);
  }, [transactions, selectedDay]);

  return (
    <div className="space-y-6" id="summary-charts-container">
      {/* Greeting Header */}
      <div className="pt-2 pb-2">
        <h2 className="text-2xl font-black font-display tracking-tight flex items-center gap-2">
          Hello, Nayem <span className="animate-bounce-slow">👋</span>
        </h2>
        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 mt-1">
          Track your financial growth today
        </p>
      </div>

      {/* Main Balance Card - Premium Gradient */}
      <motion.section 
        key={stats.balance}
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative overflow-hidden p-9 rounded-[48px] bg-gradient-to-br from-[#082c31] via-[#051a1d] to-[#020a0d] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] will-change-transform"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] rounded-full -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 blur-[60px] rounded-full -ml-24 -mb-24 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="w-full flex justify-between items-center opacity-40">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master Ledger</span>
             </div>
             <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFullHistory(true)}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-all"
              >
                <History className="w-3 h-3" />
                History
              </motion.button>
          </div>

          <div className="flex flex-col items-center">
            <label className="text-[12px] font-black uppercase tracking-[0.5em] text-white/20 block mb-4">Total Assets</label>
            <h1 className="text-6xl md:text-7xl font-black font-display tracking-tightest text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <span className="opacity-20 text-3xl font-medium mr-1.5">{currency}</span>
              {Math.abs(stats.balance).toLocaleString()}
            </h1>
          </div>
          
          <div className="flex gap-4">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/5 border border-white/5 rounded-full backdrop-blur-xl shadow-xl">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Live Balance</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Cash Flow Overview - More colorful stats with comparison bar */}
      <section className="glass bg-[#082c31]/80 p-8 border border-white/10 rounded-[44px] space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-4 bg-brand rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30">Cash Flow Overview</h3>
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest text-white/20">
            Current Period
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 relative">
          <div className="relative group">
            <div className="absolute -inset-2 bg-accent/5 blur-2xl group-hover:bg-accent/10 transition-all rounded-full" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-accent" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Income</span>
              </div>
              <div className="text-3xl font-black font-display tracking-tight text-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <span className="text-base mr-1 opacity-40 font-bold">+</span>
                {currency}{stats.totalIncome.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="relative group pl-4 border-l border-white/5">
            <div className="absolute -inset-2 bg-rose-500/5 blur-2xl group-hover:bg-rose-500/10 transition-all rounded-full" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-rose-500 rotate-180" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Expense</span>
              </div>
              <div className="text-3xl font-black font-display tracking-tight text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <span className="text-base mr-1 opacity-40 font-bold">-</span>
                {currency}{stats.totalExpense.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Comparison Bar - User requested indicator */}
        <div className="space-y-4 pt-2">
           <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] px-1">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-accent" />
               <span className={cn("transition-opacity", stats.totalIncome >= stats.totalExpense ? "text-accent opacity-100" : "opacity-30")}>
                 Strength
               </span>
             </div>
             <div className="flex items-center gap-2">
               <span className={cn("transition-opacity", stats.totalExpense > stats.totalIncome ? "text-rose-400 opacity-100" : "opacity-30")}>
                 Drainage
               </span>
               <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
             </div>
           </div>

           <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner group">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${stats.totalIncome || stats.totalExpense ? (stats.totalIncome / (stats.totalIncome + stats.totalExpense)) * 100 : 50}%` }}
               transition={{ type: 'spring', damping: 20 }}
               className="h-full bg-accent shadow-[0_0_20px_rgba(16,185,129,0.4)] relative"
             >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             </motion.div>
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${stats.totalIncome || stats.totalExpense ? (stats.totalExpense / (stats.totalIncome + stats.totalExpense)) * 100 : 50}%` }}
               transition={{ type: 'spring', damping: 20 }}
               className="h-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] opacity-40 relative"
             >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             </motion.div>
             
             {/* Center Marker Line */}
             <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 z-10 blur-[1px]" />
           </div>

           <div className="flex justify-between items-center px-1">
             <p className="text-[9px] font-black uppercase tracking-widest text-white/10">0%</p>
             {stats.totalIncome > stats.totalExpense ? (
               <motion.p 
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2"
               >
                 <Sparkles className="w-3 h-3" /> Surplus Detected
               </motion.p>
             ) : stats.totalExpense > stats.totalIncome ? (
               <motion.p 
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-[9px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-2"
               >
                 Attention Required <ChevronRight className="w-3 h-3" />
               </motion.p>
             ) : (
               <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Balanced Flow</p>
             )}
             <p className="text-[9px] font-black uppercase tracking-widest text-white/10">100%</p>
           </div>
        </div>
      </section>

      {/* Trend Graph */}
      <div className="space-y-3 pt-2" id="trend-chart-anchor">
        <div className="glass bg-[#082c31]/40 p-7 border border-white/10 rounded-[44px] min-h-[300px] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20 block mb-1">Performance</label>
              <h3 className="text-base font-black tracking-tight text-white/90">Finance Trend</h3>
            </div>
            <div className="flex gap-1.5 p-1.5 glass bg-white/5 rounded-2xl border border-white/5">
              {['D', 'W', 'M', 'Y'].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r as any)}
                  className={cn(
                    "w-9 h-9 rounded-[14px] text-[9px] font-black transition-all",
                    timeRange === r 
                      ? "bg-brand text-white shadow-[0_10px_20px_rgba(124,58,237,0.3)]" 
                      : "text-white/20 hover:text-white/40 hover:bg-white/5"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={stats.trendData}
                onMouseDown={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedDay(e.activePayload[0].payload.date);
                  }
                }}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.1)', fontSize: 7, fontWeight: 800}}
                  dy={10}
                />
                <Bar 
                  dataKey="income" 
                  fill="#4ade80" 
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
                <Bar 
                  dataKey="expense" 
                  fill="#f43f5e" 
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[8px] font-black uppercase tracking-widest text-white/10 text-center mt-6">Tap bars for day insights</p>
        </div>
      </div>

      {/* Allocation Card - Moved to the bottom */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden glass bg-gradient-to-br from-[#082c31] to-[#051a1d] p-6 border border-white/10 rounded-[44px] group cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[40px] rounded-full -mr-10 -mt-10 group-hover:bg-brand/15 transition-all" />
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 rounded-2xl border border-brand/20">
              <Palette className="w-5 h-5 text-brand-light shadow-[0_0_15px_rgba(167,139,250,0.5)]" />
            </div>
            <h3 className="text-sm font-black tracking-tight text-white/90">Allocation</h3>
          </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowFullHistory(true);
              }}
              className="w-10 h-10 glass bg-white/5 rounded-full flex items-center justify-center border border-white/10"
            >
              <History className="w-4 h-4 text-white/40" />
            </motion.button>
        </div>
      </motion.div>

        {/* Selected Day Details */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass p-6 border border-white/10 rounded-[32px] space-y-5 shadow-2xl relative">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand block mb-1">Ledger Entry</span>
                    <h2 className="text-xl font-black font-display tracking-tight">{format(parseISO(selectedDay), 'dd MMMM yyyy')}</h2>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDay(null)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                  >
                    <X className="w-4 h-4 opacity-40" />
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {selectedDayTransactions.length === 0 ? (
                    <div className="py-10 text-center opacity-20 text-[10px] font-black uppercase tracking-widest">No Activity Recorded</div>
                  ) : (
                    selectedDayTransactions.map((tr) => (
                      <div key={tr.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-1 h-8 rounded-full",
                            tr.type === TransactionType.INCOME ? "bg-emerald-500" : "bg-rose-500"
                          )} />
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{tr.category}</div>
                            <div className="text-sm font-bold">{tr.note || 'No description'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "text-lg font-black tracking-tighter",
                            tr.type === TransactionType.INCOME ? "text-emerald-400" : "text-rose-400"
                          )}>
                            {tr.type === TransactionType.INCOME ? '+' : '-'} {currency}{(tr.amount / exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </div>
                          <button
                            onClick={() => setEditingTransaction(tr)}
                            className="p-2 bg-white/5 hover:bg-orange-500/20 hover:text-orange-500 rounded-xl transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Full History Overlay */}
      <AnimatePresence>
        {showFullHistory && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-[#020a0d]/95 backdrop-blur-xl overflow-y-auto p-4 md:p-10 will-change-[opacity,transform]"
          >
            <div className="max-w-7xl mx-auto w-full space-y-12 pb-20">
              <header className="flex justify-between items-center border-b border-soft pb-6">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand mb-1">Financial Archive</label>
                  <h1 className="text-3xl font-black font-display tracking-tight uppercase">{t.history}</h1>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowFullHistory(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                >
                  <X className="w-5 h-5 opacity-40" />
                </motion.button>
              </header>
              <TransactionList lang={lang} currency={currency} exchangeRate={exchangeRate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {editingTransaction && (
        <TransactionEditModal
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          lang={lang}
          currency={currency}
          exchangeRate={exchangeRate}
        />
      )}
    </div>
  );
}
