import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, TransactionType, TRANSLATIONS, PUBLIC_USER_ID } from '../types';
import { Trash2, Search, Edit2, TrendingUp, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import TransactionEditModal from './TransactionEditModal';

interface Props {
  lang: 'en' | 'bn';
  currency: string;
  exchangeRate: number;
}

export default function TransactionList({ lang, currency, exchangeRate }: Props) {
  const t = TRANSLATIONS[lang];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', PUBLIC_USER_ID),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTransactions = transactions.filter(tr => 
    (tr.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tr.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const incomeItems = filteredTransactions.filter(tr => tr.type === TransactionType.INCOME);
  const expenseItems = filteredTransactions.filter(tr => tr.type === TransactionType.EXPENSE);

  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(tr => [
      tr.date,
      tr.type.toUpperCase(),
      tr.category,
      (tr.amount / exchangeRate).toFixed(2),
      tr.note || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (error) {
        console.error('Error deleting transaction: ', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div id="transaction-list-container" className="glass p-5 md:p-6 border border-soft rounded-[32px] space-y-6 shadow-2xl">
      {/* Header & Export */}
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          History Log
        </label>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={exportToCSV}
          className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-brand hover:text-brand-light transition-colors bg-brand/10 px-3 py-1.5 rounded-xl border border-brand/20 shadow-[0_5px_15px_rgba(124,58,237,0.1)]"
        >
          <Download className="w-3 h-3" />
          {t.export}
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10 group-focus-within:text-brand transition-colors" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.search}
          className="w-full bg-white/2 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-[11px] font-medium outline-none focus:border-brand/40 focus:bg-white/5 transition-all placeholder:text-white/10 tracking-wide"
        />
      </div>

      <div className="space-y-4">
        <ListSection 
          items={filteredTransactions} 
          onDelete={handleDelete} 
          onEdit={(tr) => setEditingTransaction(tr)}
          lang={lang} 
          currency={currency} 
          exchangeRate={exchangeRate} 
        />
      </div>

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

function ListSection({ 
  items, 
  onDelete, 
  onEdit,
  lang, 
  currency, 
  exchangeRate 
}: { 
  items: Transaction[], 
  onDelete: (id: string) => void, 
  onEdit: (tr: Transaction) => void,
  lang: string, 
  currency: string, 
  exchangeRate: number 
}) {
  const t = TRANSLATIONS[lang as 'en' | 'bn'];
  return (
    <AnimatePresence mode="popLayout">
      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 glass border border-white/10 rounded-[32px] bg-[#081e22]/30"
        >
          <p className="text-white/10 font-black uppercase tracking-[0.2em] text-[9px]">{t.noData}</p>
        </motion.div>
      ) : (
        <div className="space-y-3 will-change-transform">
          {items.map((item) => (
              <motion.div
                key={item.id}
                layout="position"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.5 }}
                className="group relative overflow-hidden glass p-4 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all will-change-transform active:scale-[0.98]"
              >
                {/* Subtle row-level glow */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none",
                  item.type === TransactionType.INCOME ? "bg-accent" : "bg-rose-500"
                )} />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-lg",
                    item.type === TransactionType.INCOME 
                      ? "bg-accent/10 text-accent shadow-accent/5 border-accent/20" 
                      : "bg-rose-500/10 text-rose-400 shadow-rose-500/5 border-rose-500/20"
                  )}>
                    {item.type === TransactionType.INCOME ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-black text-[14px] tracking-tight text-white/90">{item.category}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-20">
                        {format(new Date(item.date), 'MMM dd')}
                      </span>
                      {item.note && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <p className="text-[9px] opacity-30 truncate max-w-[120px] font-medium italic">{item.note}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                  <span className={cn(
                    "font-black text-[16px] font-display tracking-tightest",
                    item.type === TransactionType.INCOME 
                      ? "text-accent drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]" 
                      : "text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                  )}>
                    {item.type === TransactionType.INCOME ? '+' : '-'}{currency}{(item.amount / exchangeRate).toLocaleString()}
                  </span>
                  <div className="flex gap-1 items-center">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => onEdit(item)}
                      className="p-2 text-white/10 hover:text-brand hover:bg-brand/10 rounded-xl transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

