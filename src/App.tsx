import React, { useState } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCharts from './components/SummaryCharts';
import SettingsModal from './components/SettingsModal';
import PullToRefresh from './components/PullToRefresh';
import { LayoutDashboard, History, Plus, Bell, MoreVertical, PieChart, Wallet, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { TRANSLATIONS } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'history'>('dashboard');
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [currency, setCurrency] = useState('৳');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  const handleRefresh = async () => {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In a real app, this would re-fetch from Firestore or LocalStorage
    console.log('Data refreshed');
  };

  const CURRENCY_RATES: Record<string, number> = {
    '৳': 1,
    '$': 117,
    '﷼': 31
  };

  const currentRate = CURRENCY_RATES[currency] || 1;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-surface-bg text-white' : 'bg-[#fcfcfa] text-[#1a1a1a]'} transition-colors duration-500 flex flex-col font-sans overflow-x-hidden relative`}>
      {/* Deep Background Glows */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[100px] rounded-full pointer-events-none z-0" />
          <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[90px] rounded-full pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.015] pointer-events-none mix-blend-overlay" />
        </>
      )}

      <header className="max-w-4xl mx-auto w-full flex justify-between items-center mb-8 relative z-50 pt-8 px-8">
        <div className="flex flex-col">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[13px] font-black tracking-[0.6em] uppercase opacity-40 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40"
          >
            {t.title}
          </motion.div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSettingsOpen(true)}
          className="relative group flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-brand/40 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="flex items-center gap-3 px-6 py-3 glass bg-white/5 border border-white/10 rounded-[24px] shadow-2xl hover:bg-white/10 transition-all duration-300 relative z-20 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-brand/10 via-transparent to-brand/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             <Settings2 className="w-5 h-5 text-white/70 group-hover:text-brand-light group-hover:rotate-180 transition-all duration-700" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">SET</span>
             <div className="w-1.5 h-1.5 rounded-full bg-brand/60 group-hover:bg-brand transition-colors" />
          </div>
        </motion.button>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full relative z-10 pb-40">
        <AnimatePresence mode="wait">
          {!isSettingsOpen && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="w-full h-full px-6 will-change-[transform,opacity,filter]"
            >
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
                    className="will-change-transform"
                  >
                    <PullToRefresh onRefresh={handleRefresh} pullLabel={t.pullToRefresh} refreshLabel={t.refreshing}>
                      <SummaryCharts lang={lang} currency={currency} exchangeRate={currentRate} />
                    </PullToRefresh>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
                    className="will-change-transform"
                  >
                    <PullToRefresh onRefresh={handleRefresh} pullLabel={t.pullToRefresh} refreshLabel={t.refreshing}>
                      <div className="space-y-8">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-8 bg-accent rounded-full shadow-[0_10px_20px_rgba(16,185,129,0.2)]" />
                          <h2 className="text-3xl font-black font-display tracking-tight text-white/90">{t.historyShort || 'Transaction Logs'}</h2>
                        </div>
                        <TransactionList lang={lang} currency={currency} exchangeRate={currentRate} />
                      </div>
                    </PullToRefresh>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Persistent Bottom Navigation - Combined all tabs */}
      <AnimatePresence>
        {!isSettingsOpen && (
          <motion.nav 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 180 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          >
            <div className="flex items-center gap-1 glass bg-[#081e22]/90 border border-white/10 rounded-[40px] p-1 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              {(['dashboard', 'history', 'add'] as const).map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 px-4 rounded-[32px] transition-all relative overflow-hidden group min-w-[65px] touch-none",
                    activeTab === tab 
                      ? (tab === 'add' ? "text-accent bg-accent/20" : "text-brand bg-white/5 shadow-inner")
                      : "text-white/20 hover:text-white/40"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 transition-all duration-300",
                    activeTab === tab ? "scale-110" : "group-hover:scale-110"
                  )}>
                    {tab === 'dashboard' && <LayoutDashboard strokeWidth={2.5} className="w-full h-full" />}
                    {tab === 'history' && <History strokeWidth={2.5} className="w-full h-full" />}
                    {tab === 'add' && <Plus strokeWidth={4} className={cn("w-full h-full transition-transform duration-500", activeTab === 'add' && "rotate-45")} />}
                  </div>
                  <span className={cn(
                    "text-[6px] font-black tracking-[0.2em] uppercase transition-all duration-300",
                    activeTab === tab ? "opacity-100" : "opacity-20 group-hover:opacity-40"
                  )}>
                    {tab === 'dashboard' ? t.dashboardShort || 'Dash' : tab === 'history' ? t.historyShort || 'Logs' : t.addShort || 'Post'}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Add Fund Overlay Modal (if activeTab is 'add') */}
      <AnimatePresence>
        {activeTab === 'add' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTab('dashboard')}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.7 }}
              className="relative w-full max-w-[360px] glass bg-gradient-to-br from-[#0a262b] via-[#051418] to-[#020a0d] border border-white/10 rounded-[44px] p-7 overflow-hidden shadow-[0_50px_120px_-20px_rgba(0,0,0,1)] will-change-[transform,opacity]"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full -mr-32 -mt-32 opacity-40" />
              
              <div className="flex flex-col gap-5 relative z-10 text-center">
                <div className="flex flex-col items-center gap-1">
                   <h2 className="text-sm font-black font-display tracking-[0.4em] text-white/80 uppercase">
                    Post Transaction
                   </h2>
                   <div className="w-12 h-1 bg-brand/30 rounded-full blur-[1px]" />
                </div>

                <TransactionForm 
                  lang={lang} 
                  currency={currency} 
                  exchangeRate={currentRate} 
                  onComplete={() => setActiveTab('dashboard')}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simplified Footer */}
      <footer className="max-w-4xl mx-auto w-full py-20 text-center opacity-5">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">{t.title} © 2024</p>
      </footer>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all group",
        active ? "text-brand" : "text-white/20"
      )}
    >
      <div className={cn(
        "w-5 h-5 transition-transform group-hover:scale-110",
        active ? "text-brand" : "text-white/20"
      )}>
        {React.cloneElement(icon, { strokeWidth: 2.5, className: 'w-full h-full' })}
      </div>
      <span className={cn(
        "text-[7px] font-black tracking-[0.2em] uppercase",
        active ? "text-brand" : "text-white/10"
      )}>
        {label}
      </span>
    </button>
  );
}

function TabItem({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  // Keeping fallback for mobile web browsers that still might use it
  return null;
}
