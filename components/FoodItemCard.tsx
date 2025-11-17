
import React from 'react';
import { FoodItem, Location, Urgency } from '../types';
import { FridgeIcon, FreezerIcon, PantryIcon, TrashIcon } from './Icons';

interface FoodItemCardProps {
  item: FoodItem;
  onOpenRecipeModal: (item: FoodItem) => void;
  onRemove: (id: string) => void;
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

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onOpenRecipeModal, onRemove }) => {
  const config = urgencyConfig[item.urgency];
  const LocationIcon = locationIcons[item.location];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(item.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getDaysLeftText = () => {
    if (diffDays < 0) return `Expired ${-diffDays} day(s) ago`;
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  return (
    <div className={`relative rounded-lg shadow-md p-4 flex flex-col justify-between transition-transform transform hover:scale-105 ${config.bgColor} border-l-4 ${config.borderColor}`}>
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
            <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1">
                <TrashIcon className="w-5 h-5"/>
            </button>
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
        {item.urgency === Urgency.UseNow && (
          <button
            onClick={() => onOpenRecipeModal(item)}
            className="w-full mt-3 bg-red-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-600 transition-colors shadow"
          >
            Eat It Together!
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodItemCard;
