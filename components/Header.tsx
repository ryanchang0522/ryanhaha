import React from 'react';
import { LogoIcon, SettingsIcon, ChefHatIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
    onOpenSettings: () => void;
    onToggleSelectionMode: () => void;
    isSelectionMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onToggleSelectionMode, isSelectionMode }) => {
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LogoIcon className="h-10 w-10 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">KeepEat</h1>
            <p className="text-sm text-gray-500">{t('slogan')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleSelectionMode}
            className={`p-2 rounded-full transition-colors ${isSelectionMode ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'}`}
            aria-label={t('toggleRecipeMode')}
          >
            <ChefHatIcon className="h-6 w-6" />
          </button>
          <button
            onClick={onOpenSettings}
            className="text-gray-500 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label={t('openSettings')}
          >
            <SettingsIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
