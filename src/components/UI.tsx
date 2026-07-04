import React from 'react';
import { LucideIcon } from 'lucide-react';

// --- PILL BUTTON ---
interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark';
  showArrow?: boolean;
}
export const PillButton: React.FC<PillButtonProps> = ({ 
  children, 
  variant = 'primary', 
  showArrow = true, 
  className = '', 
  ...props 
}) => {
  const baseStyle = "w-full py-4 px-6 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md text-sm cursor-pointer";
  const variants = {
    primary: "bg-[#E8462A] text-white hover:bg-[#D0361C]",
    secondary: "bg-[#FAFAF7] text-[#0D0D0D] border-2 border-[#0D0D0D]/10 hover:bg-[#F2F2EC]",
    dark: "bg-[#171717] text-white hover:bg-[#262626] border border-[#262626]"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      <span>{children}</span>
      {showArrow && <span className="text-base font-black">→</span>}
    </button>
  );
};

// --- LANGUAGE ROW ---
interface LanguageRowProps {
  flag: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}
export const LanguageRow: React.FC<LanguageRowProps> = ({ flag, name, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border-2 text-left cursor-pointer ${
        selected 
          ? 'bg-gradient-to-r from-[#E8462A] to-[#F55F44] border-transparent text-white scale-[1.02] shadow-lg' 
          : 'bg-[#171717] border-[#262626] text-gray-300 hover:border-gray-700'
      }`}
    >
      <span className="font-bold text-base">{name}</span>
      <span className="text-2xl">{flag}</span>
    </button>
  );
};

// --- BADGE CARD ---
interface BadgeCardProps {
  name: string;
  description: string;
  icon?: string;
  earned: boolean;
  earnedAt?: string;
  criteria?: string;
}
export const BadgeCard: React.FC<BadgeCardProps> = ({ name, description, icon = '🏆', earned, earnedAt, criteria }) => {
  return (
    <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-40 relative overflow-hidden ${
      earned 
        ? 'bg-[#171717] border-[#E8462A] text-white shadow-[0_0_15px_rgba(232,70,42,0.15)]' 
        : 'bg-[#171717]/60 border-[#262626] text-gray-500 opacity-60'
    }`}>
      {earned && <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#E8462A]/10 rounded-full blur-xl" />}
      <div className="flex justify-between items-start">
        <span className={`text-3xl ${earned ? '' : 'grayscale'}`}>{icon}</span>
        {earned && <span className="text-[10px] bg-[#E8462A] text-white px-2 py-0.5 rounded-full font-bold">Earned</span>}
      </div>
      <div>
        <h4 className="font-bold text-xs mt-2 text-gray-100">{name}</h4>
        <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{description}</p>
        {!earned && criteria && (
          <span className="text-[9px] text-[#F59E0B] font-semibold mt-1 block">Requires: {criteria}</span>
        )}
        {earned && earnedAt && (
          <span className="text-[9px] text-[#E8462A] font-semibold mt-1 block">Unlocked: {new Date(earnedAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

// --- SESSION CARD ---
interface SessionCardProps {
  studentName: string;
  tutorName: string;
  scheduledAt: string;
  subject: string;
  status: string;
  notes?: string;
}
export const SessionCard: React.FC<SessionCardProps> = ({ 
  studentName, 
  tutorName, 
  scheduledAt, 
  subject, 
  status,
  notes 
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#171717] border border-[#262626] space-y-3 text-left">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{subject}</span>
          <h4 className="font-bold text-sm text-gray-250 mt-1">Session with {tutorName}</h4>
        </div>
        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase ${
          status === 'confirmed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
          status === 'completed' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
          'bg-amber-950 text-amber-400 border border-amber-800'
        }`}>
          {status.replace(/_/g, ' ')}
        </span>
      </div>
      <div className="text-xs text-gray-400 flex items-center gap-2">
        <span>📅 {new Date(scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
      </div>
      {notes && <p className="text-[11px] text-gray-400 italic bg-[#1E1E1E] p-2 rounded-lg">"{notes}"</p>}
    </div>
  );
};

// --- AVATAR CIRCLE ---
interface AvatarCircleProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}
export const AvatarCircle: React.FC<AvatarCircleProps> = ({ name, size = 'md' }) => {
  const dimensions = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg"
  };
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div className={`${dimensions[size]} rounded-full bg-gradient-to-br from-[#E8462A] to-[#F59E0B] text-white font-extrabold flex items-center justify-center shadow-md border-2 border-[#FAFAF7]/10`}>
      {initials}
    </div>
  );
};

// --- BOTTOM NAVIGATION ---
interface BottomNavProps {
  currentTab: string;
  onChange: (tab: string) => void;
  tabs: { id: string; label: string; icon: LucideIcon }[];
}
export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChange, tabs }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D]/90 backdrop-blur-md border-t border-[#262626] py-3.5 px-4 z-40">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isSelected = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-1 flex-1 cursor-pointer"
            >
              <div className={`p-1.5 px-4 rounded-full transition-all duration-300 ${
                isSelected ? 'bg-[#E8462A] text-white scale-105' : 'text-gray-500 hover:text-gray-300'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold ${
                isSelected ? 'text-[#E8462A]' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

// --- ONBOARDING SLIDE ---
interface OnboardingSlideProps {
  title: string;
  description: string;
  illustration: React.ReactNode;
}
export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({ title, description, illustration }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 space-y-6 h-full select-none">
      <div className="w-full h-56 flex items-center justify-center">
        {illustration}
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">{title}</h2>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
