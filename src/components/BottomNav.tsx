import React from 'react';
import { Home, Clock, Zap, Wallet, User as UserIcon } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'history', label: 'Riwayat', icon: Clock },
    { id: 'order', label: 'Order AM', icon: Zap, isProminent: true },
    { id: 'deposit', label: 'Saldo', icon: Wallet },
    { id: 'profile', label: 'Profil', icon: UserIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060a17]/95 backdrop-blur-2xl border-t border-blue-500/20 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          if (item.isProminent) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="relative -top-3 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white shadow-[0_0_25px_rgba(59,130,246,0.65)] scale-105'
                      : 'bg-gradient-to-tr from-blue-900 to-slate-900 text-cyan-300 border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:scale-102'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight ${
                    isActive ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center w-14 py-1 relative group cursor-pointer focus:outline-none"
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-cyan-300 bg-blue-950/60 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                  isActive ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_4px_#22d3ee]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
