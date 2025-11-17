
import React, { useState, useMemo, useCallback } from 'react';
import { FoodItem, Location, Urgency } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddItemModal from './components/AddItemModal';
import RecipeSuggestionModal from './components/RecipeSuggestionModal';
import { AddIcon } from './components/Icons';

const getUrgency = (expiryDate: Date): Urgency => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return Urgency.UseNow;
  if (diffDays <= 7) return Urgency.PlanSoon;
  return Urgency.Safe;
};

const initialItems: FoodItem[] = [
    { id: '1', name: 'Milk', expiryDate: new Date(new Date().setDate(new Date().getDate() + 5)), location: Location.Fridge, urgency: Urgency.PlanSoon },
    { id: '2', name: 'Chicken Breast', expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)), location: Location.Fridge, urgency: Urgency.UseNow },
    { id: '3', name: 'Frozen Peas', expiryDate: new Date(new Date().setDate(new Date().getDate() + 90)), location: Location.Freezer, urgency: Urgency.Safe },
    { id: '4', name: 'Bread', expiryDate: new Date(new Date().setDate(new Date().getDate() - 1)), location: Location.Pantry, urgency: Urgency.UseNow },
    { id: '5', name: 'Cheddar Cheese', expiryDate: new Date(new Date().setDate(new Date().getDate() + 14)), location: Location.Fridge, urgency: Urgency.Safe },
    { id: '6', name: 'Apples', expiryDate: new Date(new Date().setDate(new Date().getDate() + 6)), location: Location.Pantry, urgency: Urgency.PlanSoon },
].map(item => ({ ...item, urgency: getUrgency(item.expiryDate) }));


const App: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialItems);
  const [filter, setFilter] = useState<Location | 'all'>('all');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isRecipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedItemForRecipe, setSelectedItemForRecipe] = useState<FoodItem | null>(null);

  const filteredItems = useMemo(() => {
    const sorted = [...foodItems].sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
    if (filter === 'all') {
      return sorted;
    }
    return sorted.filter(item => item.location === filter);
  }, [foodItems, filter]);

  const handleAddItem = (item: Omit<FoodItem, 'id' | 'urgency'>) => {
    const newItem: FoodItem = {
      ...item,
      id: new Date().toISOString(),
      urgency: getUrgency(item.expiryDate),
    };
    setFoodItems(prev => [...prev, newItem]);
    setAddModalOpen(false);
  };
  
  const handleRemoveItem = useCallback((id: string) => {
    setFoodItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const openRecipeModal = (item: FoodItem) => {
    setSelectedItemForRecipe(item);
    setRecipeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto p-4 pb-24">
        <Dashboard
          items={filteredItems}
          filter={filter}
          setFilter={setFilter}
          onOpenRecipeModal={openRecipeModal}
          onRemoveItem={handleRemoveItem}
        />
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform duration-200 ease-in-out flex items-center justify-center"
          aria-label="Add new food item"
        >
          <AddIcon className="h-8 w-8" />
        </button>
      </div>

      {isAddModalOpen && (
        <AddItemModal
          onClose={() => setAddModalOpen(false)}
          onAddItem={handleAddItem}
        />
      )}

      {isRecipeModalOpen && selectedItemForRecipe && (
        <RecipeSuggestionModal
          item={selectedItemForRecipe}
          onClose={() => setRecipeModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
