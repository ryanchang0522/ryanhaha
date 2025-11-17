
import React from 'react';
import { FoodItem, Location } from '../types';
import FoodItemCard from './FoodItemCard';
import { FridgeIcon, FreezerIcon, PantryIcon } from './Icons';

interface DashboardProps {
  items: FoodItem[];
  filter: Location | 'all';
  setFilter: (filter: Location | 'all') => void;
  onOpenRecipeModal: (item: FoodItem) => void;
  onRemoveItem: (id: string) => void;
}

const FilterButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
        isActive
          ? 'bg-green-600 text-white shadow'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ items, filter, setFilter, onOpenRecipeModal, onRemoveItem }) => {
  return (
    <div>
      <div className="py-4 sticky top-[77px] bg-gray-50 z-30">
        <div className="flex space-x-2 sm:space-x-4">
          <FilterButton isActive={filter === 'all'} onClick={() => setFilter('all')}>
            <span>All</span>
          </FilterButton>
          <FilterButton isActive={filter === Location.Fridge} onClick={() => setFilter(Location.Fridge)}>
            <FridgeIcon className="h-5 w-5" /> <span>Fridge</span>
          </FilterButton>
          <FilterButton isActive={filter === Location.Freezer} onClick={() => setFilter(Location.Freezer)}>
            <FreezerIcon className="h-5 w-5" /> <span>Freezer</span>
          </FilterButton>
          <FilterButton isActive={filter === Location.Pantry} onClick={() => setFilter(Location.Pantry)}>
            <PantryIcon className="h-5 w-5" /> <span>Pantry</span>
          </FilterButton>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
