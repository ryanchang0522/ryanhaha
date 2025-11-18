import React from 'react';
import { FoodItem, Location, Urgency } from '../types';
import { FridgeIcon, FreezerIcon, PantryIcon, TrashIcon, CheckCircleIcon, ShareIcon } from './Icons';

interface FoodItemCardProps {
  item: FoodItem;
  onOpenRecipeModal: (item: FoodItem) => void;
  onRemove: (id: string) => void;
  onShare: (item: FoodItem) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const urgencyConfig = {
  [Urgency.UseNow]: {
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500',
  },
  [Urgency.PlanSoon]: {
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  [Urgency.Safe]: {
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500',
  },
};

const locationIcons: { [key in Location]: React.FC<{ className?: string }> } = {
  [Location.Fridge]: FridgeIcon,
  [Location.Freezer]: FreezerIcon,
  [Location.Pantry]: PantryIcon,
};

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onOpenRecipeModal, onRemove, onShare, isSelectionMode, isSelected, onSelect }) => {
  const config = urgencyConfig[item.urgency];
  const LocationIcon = locationIcons[item.location];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(item.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getDaysLeftText = () => {
    if (diffDays < 0) return `已過期 ${-diffDays} 天`;
    if (diffDays === 0) return '今天到期';
    if (diffDays === 1) return '明天到期';
    return `${diffDays} 天後到期`;
  };
  
  const handleCardClick = () => {
    if (isSelectionMode) {
      onSelect(item.id);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`relative rounded-lg shadow-md p-4 flex flex-col justify-between transition-all duration-200 ${config.bgColor} border-l-4 ${config.borderColor} ${isSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-4 ring-green-500 scale-105' : 'hover:scale-105'}`}
    >
      {isSelected && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center pointer-events-none">
            <CheckCircleIcon className="w-12 h-12 text-white opacity-90" />
        </div>
      )}
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
            {!isSelectionMode && (
                <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
          <LocationIcon className="h-4 w-4" />
          <span>{item.location}</span>
        </div>
      </div>
      <div className="mt-4">
        <div className={`flex items-center space-x-2 text-sm font-medium ${config.textColor}`}>
          <div className={`h-2.5 w-2.5 rounded-full ${config.dotColor}`}></div>
          <span>{item.urgency}</span>
        </div>
        <p className={`text-sm mt-1 ${config.textColor}`}>{getDaysLeftText()}</p>
        {!isSelectionMode && item.urgency !== Urgency.Safe && (
          <div className="flex items-center space-x-2 mt-3">
            <button
                onClick={() => onOpenRecipeModal(item)}
                className={`flex-1 text-white text-sm font-semibold py-2 rounded-lg transition-colors shadow ${
                item.urgency === Urgency.UseNow 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
            >
                食譜建議
            </button>
            <button
              onClick={() => onShare(item)}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors shadow flex items-center justify-center space-x-1.5"
            >
              <ShareIcon className="w-4 h-4" />
              <span>分享</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodItemCard;