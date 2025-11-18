import React, { useState, useEffect } from 'react';
import { FoodItem } from '../types';
import { BellIcon, CloseIcon } from './Icons';

interface NotificationToastProps {
  items: FoodItem[];
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ items, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // When items change, ensure the toast is expanded to show the new notification.
  useEffect(() => {
    if (items.length > 0) {
      setIsExpanded(true);
    }
  }, [items]);

  // When the toast is expanded, set a timer to automatically shrink it.
  useEffect(() => {
    if (isExpanded && items.length > 0) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 7000); // Shrink after 7 seconds

      // Cleanup the timer if the component unmounts or if isExpanded becomes false.
      return () => clearTimeout(timer);
    }
  }, [isExpanded, items]);

  const message = `您有 ${items.length} 個食材即將到期：`;

  const getDaysLeftText = (expiryDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) return '今天到期';
    if (diffDays === 1) return '明天到期';
    return `${diffDays} 天後到期`;
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-[60]">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-green-600 text-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center relative animate-pulse-green"
          aria-label={`Show ${items.length} expiring item notifications`}
        >
          <BellIcon className="h-8 w-8" />
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
            {items.length}
          </span>
        </button>
      </div>
    );
  }

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
                <strong>{item.name}</strong> {getDaysLeftText(item.expiryDate)}
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