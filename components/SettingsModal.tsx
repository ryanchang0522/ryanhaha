import React, { useState } from 'react';
import { CloseIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { AppSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  currentSettings: AppSettings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave, currentSettings }) => {
  const [enabled, setEnabled] = useState(currentSettings.enabled);
  const [days, setDays] = useState(currentSettings.days);
  const [apiKey, setApiKey] = useState(currentSettings.apiKey || '');
  const { language, changeLanguage, t } = useLanguage();

  const handleSave = () => {
    onSave({ enabled, days: Math.max(0, days), apiKey });
  };
  
  const handleClearKey = () => {
    setApiKey('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('settingsTitle')}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                {t('language')}
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="w-full block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="zh-TW">繁體中文</option>
                <option value="en">English</option>
              </select>
            </div>

            <hr />
            
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                {t('apiKey')}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                 <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 border-gray-300 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder={t('apiKeyPlaceholder')}
                  />
                  <button onClick={handleClearKey} type="button" className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100">
                    {t('useDefaultKey')}
                  </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">{t('apiKeyHint')}</p>
            </div>

            <hr />

            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('enableNotifications')}</span>
              <label htmlFor="toggle" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="toggle" className="sr-only peer" checked={enabled} onChange={() => setEnabled(!enabled)} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className={`transition-opacity duration-300 ${enabled ? 'opacity-100' : 'opacity-50'}`}>
              <label htmlFor="days" className={`block text-sm font-medium mb-2 ${enabled ? 'text-gray-700' : 'text-gray-500'}`}>
                {t('remindMe')}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  id="days"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value, 10) || 0)}
                  disabled={!enabled}
                  className="w-20 text-center block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-50"
                  min="0"
                />
                <span className={enabled ? 'text-gray-700' : 'text-gray-500'}>{t('daysBeforeExpiration')}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;