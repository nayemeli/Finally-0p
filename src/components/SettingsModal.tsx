import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun, Globe, DollarSign, Palette, Settings2, Sparkles, Bell, Cloud, ShieldCheck, Wallet } from 'lucide-react';
import { TRANSLATIONS } from '../types';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  lang,
  setLang,
  currency,
  setCurrency,
  theme,
  setTheme
}: Props) {
  const t = TRANSLATIONS[lang] as any;
  const [showProPopup, setShowProPopup] = React.useState(false);
  const [proOptions, setProOptions] = React.useState({
    vara: true,
    amel: false,
    instalments: true
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg glass bg-gradient-to-br from-[#061e22] to-[#020a0d] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,1)]"
          >
            {/* Header */}
            <header className="p-8 pb-4 flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Configuration</span>
                </div>
                <h2 className="text-3xl font-black font-display tracking-tight uppercase flex items-center gap-3 text-white">
                  {t.settings} <Settings2 className="w-6 h-6 text-brand/60" />
                </h2>
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
              >
                <X className="w-5 h-5 text-white/40" />
              </motion.button>
            </header>

            <div className="p-8 pt-0 max-h-[70vh] overflow-y-auto scrollbar-hide space-y-8 relative z-10">
              {/* Core Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-brand opacity-60" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.language}</label>
                  </div>
                  <div className="flex gap-2 p-1.5 bg-white/2 rounded-2xl border border-white/5">
                    {['en', 'bn'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l as any)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          lang === l ? 'bg-brand text-white shadow-lg' : 'text-white/20 hover:text-white/40'
                        }`}
                      >
                        {l === 'en' ? 'ENG' : 'বাংলা'}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Currency */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-brand opacity-60" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.currency}</label>
                  </div>
                  <div className="flex gap-2 p-1.5 bg-white/2 rounded-2xl border border-white/5">
                    {['﷼', '৳', '$'].map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${
                          currency === curr ? 'bg-brand text-white shadow-lg' : 'text-white/20 hover:text-white/40'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Appearance */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-brand opacity-60" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.appearance}</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-3xl flex items-center gap-3 transition-all border ${
                      theme === 'dark' ? 'bg-brand/10 border-brand/40 text-white' : 'bg-white/2 border-white/5 text-white/20'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-brand text-white' : 'bg-white/5'}`}>
                      <Moon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">{t.dark}</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-3xl flex items-center gap-3 transition-all border ${
                      theme === 'light' ? 'bg-white/10 border-black/10 text-black' : 'bg-white/2 border-white/5 text-white/20'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-black text-white' : 'bg-white/5'}`}>
                      <Sun className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">{t.light}</span>
                  </motion.button>
                </div>
              </section>

              {/* Pro Section Entry */}
              <section className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-accent opacity-80" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-accent/80">{t.additionalOp}</label>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(16,185,129,0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProPopup(true)}
                    className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-br from-accent via-emerald-600 to-teal-500 border border-white/20 rounded-[14px] cursor-pointer transition-all shadow-[0_15px_40px_-10px_rgba(16,185,129,0.6)]"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                    <span className="relative text-[11px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
                       ELITE
                    </span>
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <OptionItem icon={<Cloud />} label="Cloud Backup" active desc="Keep your data synced across devices" />
                  <OptionItem icon={<Bell />} label="Push Notifications" desc="Get daily reminders for tracking" />
                  <OptionItem icon={<ShieldCheck />} label="Biometric Lock" desc="Secure your financial logs" />
                </div>
              </section>
            </div>
            
            <footer className="p-8 pt-0">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-5 bg-white text-black rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-brand hover:text-white transition-all"
              >
                {t.close}
              </motion.button>
            </footer>

            {/* Premium Control Center - Swipes from Left */}
            <AnimatePresence>
              {showProPopup && (
                <motion.div
                  initial={{ opacity: 0, x: '-100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: '-100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                  className="absolute inset-0 z-50 bg-[#020a0d] flex flex-col backdrop-blur-3xl"
                >
                  <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                    <header className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/60">Elite Control</span>
                        </div>
                        <h3 className="text-3xl font-black font-display tracking-tight uppercase text-white/90">Premium Add-ons</h3>
                      </div>
                      <motion.button 
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowProPopup(false)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all shadow-xl"
                      >
                        <X className="w-5 h-5 text-white/60" />
                      </motion.button>
                    </header>

                    {/* Financial Toggles */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-accent opacity-50" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Module Configuration</span>
                      </div>
                      <ProToggle 
                        label="VARA PRO" 
                        active={proOptions.vara} 
                        onClick={() => setProOptions(p => ({ ...p, vara: !p.vara }))} 
                        desc="Advanced logic for leasing & assets"
                        icon={<Wallet className="w-5 h-5" />}
                      />
                      <ProToggle 
                        label="AMEL AI" 
                        active={proOptions.amel} 
                        onClick={() => setProOptions(p => ({ ...p, amel: !p.amel }))} 
                        desc="Predictive pattern recognition"
                        icon={<Sparkles className="w-5 h-5" />}
                      />
                      <ProToggle 
                        label="INSTALMENTS" 
                        active={proOptions.instalments} 
                        onClick={() => setProOptions(p => ({ ...p, instalments: !p.instalments }))} 
                        desc="Complex payment schedules"
                        icon={<Cloud className="w-5 h-5" />}
                      />
                    </div>

                    {/* Meta Section */}
                    <div className="pt-10 border-t border-white/5">
                       <div className="glass bg-white/2 p-6 rounded-[32px] border border-white/5 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-accent" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Status: Verified</span>
                          </div>
                          <p className="text-[9px] text-white/20 font-medium leading-relaxed italic">
                            System encryption active. All premium modules are secured via end-to-end proprietary synchronization protocols.
                          </p>
                       </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0">
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowProPopup(false)}
                      className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-[0_20px_40px_rgba(16,185,129,0.3)]"
                    >
                      Apply Configuration
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ProToggle({ label, active, onClick, desc, icon }: { label: string, active: boolean, onClick: () => void, desc: string, icon: any }) {
  return (
    <div className="group relative overflow-hidden p-5 bg-white/2 border border-white/5 rounded-[36px] flex items-center justify-between hover:bg-white/5 transition-all shadow-inner">
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity",
        active ? "bg-accent" : "bg-white"
      )} />
      
      <div className="flex items-center gap-5 relative z-10">
        <div className={cn(
          "w-12 h-12 rounded-[22px] flex items-center justify-center transition-all",
          active ? "bg-accent/10 border border-accent/20 text-accent" : "bg-white/5 border border-white/5 text-white/20"
        )}>
          {React.cloneElement(icon, { strokeWidth: 2.5 })}
        </div>
        <div className="space-y-0.5">
          <span className="text-[15px] font-black font-display tracking-tight text-white/90">{label}</span>
          <p className="text-[9px] text-white/20 uppercase font-bold tracking-[0.05em] max-w-[160px] leading-tight">{desc}</p>
        </div>
      </div>

      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "w-14 h-7 rounded-full relative transition-all duration-500 p-1 shadow-inner",
          active ? "bg-accent/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-white/5"
        )}
      >
        <motion.div 
          animate={{ x: active ? 28 : 0 }}
          className={cn(
            "w-5 h-5 rounded-full shadow-2xl flex items-center justify-center",
            active ? "bg-accent" : "bg-white/20"
          )}
        >
          {active && <ShieldCheck className="w-3 h-3 text-black/80" />}
        </motion.div>
      </motion.button>
    </div>
  );
}

function OptionItem({ icon, label, desc, active = false }: { icon: any, label: string, desc: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-3xl hover:bg-white/5 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 glass bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-brand transition-colors">
          {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-widest text-white/80">{label}</span>
          <span className="text-[9px] text-white/20 font-medium">{desc}</span>
        </div>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-brand' : 'bg-white/10'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  );
}

