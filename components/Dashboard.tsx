import React from 'react';
import { FoodItem } from '../types';
import FoodItemCard from './FoodItemCard';

interface DashboardProps {
  items: FoodItem[];
  onOpenRecipeModal: (item: FoodItem) => void;
  onRemoveItem: (id: string) => void;
  onShare: (item: FoodItem) => void;
  isSelectionMode: boolean;
  selectedItemIds: Set<string>;
  onSelectItem: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, onOpenRecipeModal, onRemoveItem, onShare, isSelectionMode, selectedItemIds, onSelectItem }) => {
  return (
    <div>
      {isSelectionMode && (
        <div className="text-center py-3 bg-green-50 border border-green-200 rounded-lg mb-4 animate-fade-in-down">
            <p className="font-semibold text-green-700">食譜模式</p>
            <p className="text-sm text-green-600">請選擇食材來產生食譜</p>
        </div>
      )}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
          {items.map(item => (
            <FoodItemCard 
              key={item.id} 
              item={item} 
              onOpenRecipeModal={onOpenRecipeModal} 
              onRemove={onRemoveItem}
              onShare={onShare}
              isSelectionMode={isSelectionMode}
              isSelected={selectedItemIds.has(item.id)}
              onSelect={onSelectItem}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">沒有食材。點擊下方「+」按鈕新增吧！</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;