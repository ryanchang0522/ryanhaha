
import React from 'react';
import { FoodItem } from '../types';
import FoodItemCard from './FoodItemCard';

interface DashboardProps {
  items: FoodItem[];
  onOpenRecipeModal: (item: FoodItem) => void;
  onRemoveItem: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, onOpenRecipeModal, onRemoveItem }) => {
  return (
    <div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
          {items.map(item => (
            <FoodItemCard key={item.id} item={item} onOpenRecipeModal={onOpenRecipeModal} onRemove={onRemoveItem}/>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">No items found. Add something to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;