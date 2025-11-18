import React from 'react';
import { AddIcon, ListIcon, CalendarIcon, ConnectIcon, UserCircleIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavBarProps {
  viewMode: 'dashboard' | 'calendar' | 'connect' | 'profile';
  setViewMode: (view: 'dashboard' | 'calendar' | 'connect' | 'profile') => void;
  onAddItemClick: () => void;
}

const NavButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}> = ({ isActive, onClick, children, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 w-[20%] h-full transition-colors duration-200 focus:outline-none ${
        isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'
      }`}
      aria-label={`${label} view`}
    >
      {children}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ viewMode, setViewMode, onAddItemClick }) => {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
      <div className="container mx-auto px-2 h-20 flex items-center justify-around relative">
        
        <NavButton isActive={viewMode === 'dashboard'} onClick={() => setViewMode('dashboard')} label={t('dashboard')}>
            <ListIcon className="h-6 w-6" />
        </NavButton>
        
        <NavButton isActive={viewMode === 'connect'} onClick={() => setViewMode('connect')} label={t('connect')}>
            <ConnectIcon className="h-6 w-6" />
        </NavButton>

        {/* This is a placeholder for the center button to maintain spacing */}
        <div className="w-[20%]" /> 

        <NavButton isActive={viewMode === 'profile'} onClick={() => setViewMode('profile')} label={t('profile')}>
            <UserCircleIcon className="h-6 w-6" />
        </NavButton>

        <NavButton isActive={viewMode === 'calendar'} onClick={() => setViewMode('calendar')} label={t('calendar')}>
            <CalendarIcon className="h-6 w-6" />
        </NavButton>

        {/* Absolutely positioned center button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-5">
            <button
              onClick={onAddItemClick}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 shadow-lg transform hover:scale-110 transition-transform duration-200 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              aria-label={t('addNewItem')}
            >
              <AddIcon className="h-8 w-8" />
            </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavBar;
