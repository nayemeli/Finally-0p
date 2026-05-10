import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, TransactionType, TRANSLATIONS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Tag, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  transaction: Transaction;
  lang: 'en' | 'bn';
  currency: string;
  exchangeRate: number;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Food', 'Rent', 'Transport', 'Shopping', 'Salary', 'Business', 'Investment', 'Misc'
];

export default function TransactionEditModal({ transaction, lang, currency, exchangeRate, isOpen, onClose }: Props) {
  const t = TRANSLATIONS[lang] as any;
  const [amount, setAmount] = useState((transaction.amount / exchangeRate).toString());
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(transaction.date);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || loading) return;

    setLoading(true);
    try {
      const baseAmount = Number(amount) * exchangeRate;
      const docRef = doc(db, 'transactions', transaction.id);
      await updateDoc(docRef, {
        amount: baseAmount,
        type,
        category,
        date,
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative z-10"
          >
            <header className="p-6 flex justify-between items-center border-b border-white/5 bg-white/2">
              <h3 className="text-lg font-black tracking-tighter uppercase">{t.edit}</h3>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5 opacity-40" />
              </motion.button>
            </header>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                {[TransactionType.EXPENSE, TransactionType.INCOME].map((tType) => (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={tType}
                    type="button"
                    onClick={() => setType(tType)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      type === tType 
                        ? (type === TransactionType.INCOME ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-rose-500 text-white shadow-lg shadow-rose-500/20")
                        : "opacity-40 hover:opacity-100"
                    )}
                  >
                    {tType === TransactionType.INCOME ? t.income : t.expense}
                  </motion.button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black opacity-10 group-focus-within:opacity-100 transition-all">{currency}</span>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/2 border border-white/5 rounded-2xl py-6 pl-16 pr-6 text-2xl font-black font-display outline-none focus:border-brand/50 focus:bg-white/5 transition-all placeholder:opacity-20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">{t.category}</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white/2 border border-white/5 rounded-2xl p-4 text-[10px] font-bold uppercase tracking-widest appearance-none outline-none focus:border-brand/40 focus:bg-white/5 transition-all cursor-pointer"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-10 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-2">{t.date}</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white/2 border border-white/5 rounded-2xl p-4 text-[10px] uppercase font-bold outline-none focus:border-brand/40 focus:bg-white/5 transition-all cursor-pointer invert dark:invert-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(255,255,255,0.05)]",
                  loading ? "opacity-50 cursor-not-allowed" : "bg-white text-black hover:bg-brand hover:text-white"
                )}
              >
                {loading ? '...' : t.update}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
