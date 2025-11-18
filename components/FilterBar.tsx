import React from 'react';
import { Location } from '../types';
import { FridgeIcon, FreezerIcon, PantryIcon, ListIcon } from './Icons';

interface FilterBarProps {
  filter: Location | 'all';
  setFilter: (filter: Location | 'all') => void;
}

const FilterButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}> = ({ isActive, onClick, children, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 sm:flex-none sm:px-4 py-2 flex items-center justify-center space-x-2 rounded-full text-sm font-medium transition-colors duration-200 ${
      isActive ? 'bg-green-600 text-white shadow' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
    }`}
  >
    {children}
    <span>{label}</span>
  </button>
);

const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter }) => {
  return (
    <div className="flex space-x-2 sm:space-x-3 bg-white p-2 rounded-full shadow-sm mb-4 sticky top-[85px] z-30">
      <FilterButton isActive={filter === 'all'} onClick={() => setFilter('all')} label="全部">
        <ListIcon className="h-5 w-5" />
      </FilterButton>
      <FilterButton isActive={filter === Location.Fridge} onClick={() => setFilter(Location.Fridge)} label="冰箱">
        <FridgeIcon className="h-5 w-5" />
      </FilterButton>
      <FilterButton isActive={filter === Location.Freezer} onClick={() => setFilter(Location.Freezer)} label="冷凍庫">
        <FreezerIcon className="h-5 w-5" />
      </FilterButton>
      <FilterButton isActive={filter === Location.Pantry} onClick={() => setFilter(Location.Pantry)} label="儲藏室">
        <PantryIcon className="h-5 w-5" />
      </FilterButton>
    </div>
  );
};

export default FilterBar;
