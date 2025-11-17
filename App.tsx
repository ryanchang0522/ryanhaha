import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FoodItem, Location, Urgency } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddItemModal from './components/AddItemModal';
import RecipeSuggestionModal from './components/RecipeSuggestionModal';
import SettingsModal from './components/SettingsModal';
import NotificationToast from './components/NotificationToast';
import BottomNavBar from './components/BottomNavBar';

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

interface AppSettings {
  enabled: boolean;
  days: number;
}

const App: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialItems);
  const [filter, setFilter] = useState<Location | 'all'>('all');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isRecipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedItemForRecipe, setSelectedItemForRecipe] = useState<FoodItem | null>(null);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({ enabled: true, days: 3 });
  const [expiringItems, setExpiringItems] = useState<FoodItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('keepEatSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (typeof parsedSettings.enabled === 'boolean' && typeof parsedSettings.days === 'number') {
          setSettings(parsedSettings);
        }
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);
  
  // Check for expiring items when foodItems or settings change
  useEffect(() => {
    if (settings.enabled && foodItems.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiring = foodItems.filter(item => {
        const expiry = new Date(item.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Notify for items expiring within the set days, including today (diffDays >= 0)
        return diffDays >= 0 && diffDays <= settings.days;
      });

      if (expiring.length > 0) {
        setExpiringItems(expiring.sort((a,b) => a.expiryDate.getTime() - b.expiryDate.getTime()));
        setShowNotification(true);
      } else {
        setShowNotification(false);
        setExpiringItems([]);
      }
    } else {
      setShowNotification(false);
      setExpiringItems([]);
    }
  }, [foodItems, settings]);

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
  
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('keepEatSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
    setSettingsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header onOpenSettings={() => setSettingsModalOpen(true)} />
      <main className="container mx-auto p-4 pb-28">
        <Dashboard
          items={filteredItems}
          onOpenRecipeModal={openRecipeModal}
          onRemoveItem={handleRemoveItem}
        />
      </main>

      <BottomNavBar
        filter={filter}
        setFilter={setFilter}
        onAddItemClick={() => setAddModalOpen(true)}
      />

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
      
      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setSettingsModalOpen(false)}
          onSave={handleSaveSettings}
          currentSettings={settings}
        />
      )}

      {showNotification && (
        <NotificationToast items={expiringItems} onClose={() => setShowNotification(false)} />
      )}
    </div>
  );
};

export default App;