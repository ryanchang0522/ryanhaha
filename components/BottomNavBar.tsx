import React from 'react';
import { Location } from '../types';
import { AddIcon, FridgeIcon, FreezerIcon, PantryIcon, ListIcon } from './Icons';

interface BottomNavBarProps {
  filter: Location | 'all';
  setFilter: (filter: Location | 'all') => void;
  onAddItemClick: () => void;
}

const NavButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}> = ({ isActive, onClick, children, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 w-20 transition-colors duration-200 focus:outline-none ${
        isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'
      }`}
      aria-label={`Filter by ${label}`}
    >
      {children}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};


const BottomNavBar: React.FC<BottomNavBarProps> = ({ filter, setFilter, onAddItemClick }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
      <div className="container mx-auto px-2 h-20 flex items-center justify-around">
        <NavButton isActive={filter === 'all'} onClick={() => setFilter('all')} label="All">
            <ListIcon className="h-6 w-6" />
        </NavButton>

        <NavButton isActive={filter === Location.Fridge} onClick={() => setFilter(Location.Fridge)} label="Fridge">
            <FridgeIcon className="h-6 w-6" />
        </NavButton>

        <div className="relative -top-5">
            <button
              onClick={onAddItemClick}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 shadow-lg transform hover:scale-110 transition-transform duration-200 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              aria-label="Add new food item"
            >
              <AddIcon className="h-8 w-8" />
            </button>
        </div>

        <NavButton isActive={filter === Location.Freezer} onClick={() => setFilter(Location.Freezer)} label="Freezer">
            <FreezerIcon className="h-6 w-6" />
        </NavButton>

        <NavButton isActive={filter === Location.Pantry} onClick={() => setFilter(Location.Pantry)} label="Pantry">
            <PantryIcon className="h-6 w-6" />
        </NavButton>
      </div>
    </nav>
  );
};

export default BottomNavBar;
