import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TransactionType, CATEGORIES, TRANSLATIONS, PUBLIC_USER_ID } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface Props {
  lang: 'en' | 'bn';
  currency: string;
  exchangeRate: number;
  onComplete?: () => void;
}

export default function TransactionForm({ lang, currency, exchangeRate, onComplete }: Props) {
  const t = TRANSLATIONS[lang];
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState(CATEGORIES[TransactionType.EXPENSE][0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    setLoading(true);
    try {
      const baseAmount = Number(amount) * exchangeRate;

      await addDoc(collection(db, 'transactions'), {
        amount: baseAmount,
        type,
        category,
        date,
        note,
        userId: PUBLIC_USER_ID,
        createdAt: serverTimestamp(),
      });
      setAmount('');
      setNote('');
      onComplete?.();
    } catch (error) {
      console.error('Error adding transaction: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-1"
      id="transaction-form-container"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[#0a1a1f] p-1.5 rounded-[24px] border border-white/5 relative flex shadow-inner backdrop-blur-xl will-change-transform">
          {(['expense', 'income'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                const newType = mode === 'expense' ? TransactionType.EXPENSE : TransactionType.INCOME;
                setType(newType);
                setCategory(CATEGORIES[newType][0]);
              }}
              className={cn(
                "relative flex-1 py-2.5 rounded-[18px] text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-200 z-10 touch-none",
                type === (mode === 'expense' ? TransactionType.EXPENSE : TransactionType.INCOME)
                  ? (mode === 'expense' ? "text-rose-500" : "text-emerald-500")
                  : "text-white/20 hover:text-white/40"
              )}
            >
              {mode === 'expense' ? t.expense : t.income}
              {type === (mode === 'expense' ? TransactionType.EXPENSE : TransactionType.INCOME) && (
                <motion.div
                  layoutId="active-toggle"
                  className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-[18px] -z-10"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 ml-4">AMOUNT</label>
          <div className={cn(
            "relative flex items-center justify-center p-6 rounded-[28px] border transition-all duration-500 bg-[#0a1a1f]/80 shadow-inner overflow-hidden will-change-[border-color,box-shadow]",
            type === TransactionType.EXPENSE ? "border-rose-500/10 shadow-[0_10px_40px_rgba(244,63,94,0.05)]" : "border-emerald-500/10 shadow-[0_10px_40px_rgba(16,185,129,0.05)]"
          )}>
            <div className={cn(
              "absolute inset-0 opacity-10 blur-3xl transition-colors duration-700",
              type === TransactionType.EXPENSE ? "bg-rose-500" : "bg-emerald-500"
            )} />
            <span className={cn(
              "text-xl font-black mr-3 relative z-10 transition-colors duration-500",
              type === TransactionType.EXPENSE ? "text-rose-500" : "text-emerald-500"
            )}>{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-4xl font-black font-display tracking-tightest outline-none w-full text-center placeholder:text-white/5 text-white"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-4">{t.category}</label>
            <div className="relative group">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0a1a1f]/80 border border-white/5 rounded-[20px] px-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white/20 transition-all text-white/80 appearance-none shadow-inner"
              >
                {CATEGORIES[type].map((cat) => (
                  <option key={cat} value={cat} className="bg-[#051114] py-3 capitalize">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-white rotate-45" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-4">{t.date}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0a1a1f]/80 border border-white/5 rounded-[20px] px-4 py-4 text-[10px] font-bold outline-none focus:border-white/20 transition-all text-white/80 shadow-inner"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-4">{t.notes} (OPTIONAL)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was this for?"
            className="w-full bg-[#0a1a1f]/80 border border-white/5 rounded-[20px] px-5 py-4 text-[10px] font-medium outline-none focus:border-white/20 transition-all placeholder:text-white/10 shadow-inner"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onComplete?.()}
            className="flex-1 py-4 rounded-[20px] bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all shadow-xl"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={cn(
              "flex-[1.5] py-4 rounded-[20px] font-black uppercase tracking-[0.4em] text-[11px] transition-all shadow-2xl relative overflow-hidden group",
              type === TransactionType.EXPENSE 
                ? "bg-rose-500 text-white shadow-[0_15px_40px_rgba(244,63,94,0.4)]" 
                : "bg-emerald-500 text-black shadow-[0_15px_40px_rgba(16,185,129,0.4)]"
            )}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">{loading ? '...' : t.save}</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
