import React from 'react';
import { FoodItem } from '../types';
import { BellIcon, CloseIcon } from './Icons';

interface NotificationToastProps {
  items: FoodItem[];
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ items, onClose }) => {
  const message = `您有 ${items.length} 個食材即將到期：`;

  const getDaysLeftText = (expiryDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '明天';
    return `${diffDays} 天後`;
  };

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-sm bg-white rounded-lg shadow-lg p-4 z-[60] animate-fade-in-up">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <BellIcon className="h-6 w-6 text-yellow-500" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          <ul className="mt-1 text-sm text-gray-600 space-y-1">
            {items.slice(0, 3).map(item => (
              <li key={item.id} className="truncate">
                <strong>{item.name}</strong> 將於 {getDaysLeftText(item.expiryDate)} 到期
              </li>
            ))}
             {items.length > 3 && (
                <li className="font-medium text-gray-700">以及其他 {items.length - 3} 個...</li>
            )}
          </ul>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label="Close notification"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;