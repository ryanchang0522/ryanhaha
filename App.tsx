import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FoodItem, Location, Urgency, ShareEvent, UserProfile, UserRole, ShareType, CommunityPost, RecipeData, SavedRecipe, SharedRecipePost, AppSettings } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddItemModal from './components/AddItemModal';
import RecipeSuggestionModal from './components/RecipeSuggestionModal';
import SettingsModal from './components/SettingsModal';
import NotificationToast from './components/NotificationToast';
import BottomNavBar from './components/BottomNavBar';
import { ChefHatIcon } from './components/Icons';
import CalendarView from './components/CalendarView';
import FilterBar from './components/FilterBar';
import ConnectView from './components/ConnectView';
import ShareModal from './components/ShareModal';
import ChatModal from './components/ChatModal';
import ProfileView from './components/ProfileView';
import { useLanguage } from './contexts/LanguageContext';

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

// --- MOCK DATA ---
const initialItems: FoodItem[] = [
    { id: '1', name: 'Milk', expiryDate: new Date(new Date().setDate(new Date().getDate() + 5)), location: Location.Fridge, urgency: Urgency.PlanSoon },
    { id: '2', name: 'Chicken Breast', expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)), location: Location.Fridge, urgency: Urgency.UseNow },
    { id: '3', name: 'Frozen Peas', expiryDate: new Date(new Date().setDate(new Date().getDate() + 90)), location: Location.Freezer, urgency: Urgency.Safe },
    { id: '4', name: 'Bread', expiryDate: new Date(new Date().setDate(new Date().getDate() - 1)), location: Location.Pantry, urgency: Urgency.UseNow },
].map(item => ({ ...item, urgency: getUrgency(item.expiryDate) }));

const mockCurrentUser: UserProfile = { id: 'currentUser', name: '我', role: UserRole.Standard, friends: ['u1', 'u2', 'u3'] };
const mockUser: UserProfile = { id: 'u1', name: '王小明', role: UserRole.Standard, friends: [] };
const mockVolunteer: UserProfile = { id: 'u2', name: '陳志工', role: UserRole.Volunteer, friends: [] };
const mockSenior: UserProfile = { id: 'u3', name: '林奶奶', role: UserRole.Senior, friends: [] };

const initialCommunityPosts: CommunityPost[] = [
    { id: 's1', type: 'food', initiator: mockUser, item: {id: 'f1', name: '高麗菜', expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)), location: Location.Fridge, urgency: Urgency.UseNow }, shareType: ShareType.CoCook, description: '晚餐想炒個高麗菜，有人想一起搭伙嗎？我還有肉絲！', location: { latitude: 25.0330, longitude: 121.5654 }, createdAt: new Date() },
    { id: 's2', type: 'food', initiator: mockSenior, item: {id: 'f2', name: '雞蛋', expiryDate: new Date(new Date().setDate(new Date().getDate() + 2)), location: Location.Fridge, urgency: Urgency.UseNow }, shareType: ShareType.Assistance, description: '雞蛋快過期了，希望有志工能幫我做個蒸蛋，一起吃午餐聊聊天。', location: { latitude: 25.0450, longitude: 121.5450 }, createdAt: new Date() },
    { id: 's3', type: 'food', initiator: mockUser, item: {id: 'f3', name: '洋蔥', expiryDate: new Date(new Date().setDate(new Date().getDate() + 3)), location: Location.Pantry, urgency: Urgency.PlanSoon }, shareType: ShareType.Gift, description: '買太多洋蔥了，贈送給附近有需要的朋友，請自取！', location: { latitude: 25.0220, longitude: 121.5240 }, createdAt: new Date() },
];

const App: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialItems);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialCommunityPosts);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [filter, setFilter] = useState<Location | 'all'>('all');
  const [viewMode, setViewMode] = useState<'dashboard' | 'calendar' | 'connect' | 'profile'>('dashboard');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isRecipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedItemForRecipe, setSelectedItemForRecipe] = useState<FoodItem | null>(null);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({ enabled: true, days: 3 });
  const [expiringItems, setExpiringItems] = useState<FoodItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const { t } = useLanguage();
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState<FoodItem | null>(null);
  
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<ShareEvent | UserProfile | null>(null);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('keepEatSettings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  }, []);
  
  useEffect(() => {
    if (settings.enabled) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiring = foodItems.filter(item => {
        const expiry = new Date(item.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= settings.days;
      });
      setExpiringItems(expiring.length > 0 ? expiring.sort((a,b) => a.expiryDate.getTime() - b.expiryDate.getTime()) : []);
      setShowNotification(expiring.length > 0);
    } else {
      setShowNotification(false);
      setExpiringItems([]);
    }
  }, [foodItems, settings]);

  const filteredItems = useMemo(() => {
    const sorted = [...foodItems].sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
    return filter === 'all' ? sorted : sorted.filter(item => item.location === filter);
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
    localStorage.setItem('keepEatSettings', JSON.stringify(newSettings));
    setSettingsModalOpen(false);
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    setSelectedItemIds(new Set());
  };

  const handleSelectItem = (id: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleGenerateRecipeForSelected = () => {
    setSelectedItemForRecipe(null);
    setRecipeModalOpen(true);
  };
  
  const selectedItemsForRecipe = useMemo(() => {
    if (!isRecipeModalOpen) return [];
    if (selectedItemForRecipe) return [selectedItemForRecipe];
    if (selectedItemIds.size > 0) return foodItems.filter(item => selectedItemIds.has(item.id));
    return [];
  }, [isRecipeModalOpen, selectedItemForRecipe, selectedItemIds, foodItems]);
  
  const handleSaveRecipe = useCallback((recipe: RecipeData, imageUrl: string | null) => {
    setSavedRecipes(prev => {
      const newRecipe: SavedRecipe = {
        ...recipe,
        id: `recipe_${new Date().getTime()}`,
        imageUrl: imageUrl,
      };
      // Avoid duplicates
      if (prev.some(r => r.recipeName === newRecipe.recipeName)) {
        return prev;
      }
      return [newRecipe, ...prev];
    });
  }, []);

  const closeRecipeModal = () => {
    setRecipeModalOpen(false);
    setSelectedItemForRecipe(null);
    if (isSelectionMode) {
        setIsSelectionMode(false);
        setSelectedItemIds(new Set());
    }
  };

  const handleSetViewMode = (newView: 'dashboard' | 'calendar' | 'connect' | 'profile') => {
    if (newView !== 'dashboard' && isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedItemIds(new Set());
    }
    setViewMode(newView);
  };
  
  const handleOpenShareModal = (item: FoodItem) => {
    setItemToShare(item);
    setShareModalOpen(true);
  };
  
  const handleOpenChatModal = (target: ShareEvent | UserProfile) => {
    setChatTarget(target);
    setChatModalOpen(true);
  };

  const handlePostShare = ({ type: shareType, description }: { type: ShareType; description: string }) => {
    if (!itemToShare) return;
    const newShareEvent: ShareEvent = {
      id: `s_${new Date().getTime()}`,
      type: 'food',
      initiator: mockCurrentUser,
      item: itemToShare,
      shareType,
      description,
      location: { // Mock location near user
        latitude: 25.0330 + (Math.random() - 0.5) * 0.01,
        longitude: 121.5654 + (Math.random() - 0.5) * 0.01,
      },
      createdAt: new Date(),
      isOwn: true,
    };
    setCommunityPosts(prev => [newShareEvent, ...prev]);
    setShareModalOpen(false);
    setItemToShare(null);
    setViewMode('connect'); // Switch to connect view to see the new share
  };

  const handleShareRecipe = (recipe: SavedRecipe) => {
    const newRecipePost: SharedRecipePost = {
        id: `rp_${new Date().getTime()}`,
        type: 'recipe',
        initiator: mockCurrentUser,
        recipe: recipe,
        description: `我分享了一道「${recipe.recipeName}」的食譜，你也來試試看吧！`,
        location: {
            latitude: 25.0330 + (Math.random() - 0.5) * 0.01,
            longitude: 121.5654 + (Math.random() - 0.5) * 0.01,
        },
        createdAt: new Date(),
        isOwn: true,
    };
    setCommunityPosts(prev => [newRecipePost, ...prev]);
    setViewMode('connect');
  };

  const handleDeletePost = (postId: string) => {
    setCommunityPosts(prev => prev.filter(post => post.id !== postId));
  };


  const renderContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return (
          <>
            <FilterBar filter={filter} setFilter={setFilter} />
            <Dashboard
              items={filteredItems}
              onOpenRecipeModal={openRecipeModal}
              onRemoveItem={handleRemoveItem}
              onShare={handleOpenShareModal}
              isSelectionMode={isSelectionMode}
              selectedItemIds={selectedItemIds}
              onSelectItem={handleSelectItem}
            />
          </>
        );
      case 'calendar':
        return <CalendarView items={foodItems} />;
      case 'connect':
        return <ConnectView communityPosts={communityPosts} onOpenChat={handleOpenChatModal} onDeletePost={handleDeletePost} />;
      case 'profile':
        return <ProfileView savedRecipes={savedRecipes} onShareRecipe={handleShareRecipe} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header 
        onOpenSettings={() => setSettingsModalOpen(true)} 
        onToggleSelectionMode={handleToggleSelectionMode}
        isSelectionMode={isSelectionMode}
      />
      <main className="container mx-auto p-4 pb-28">
        {renderContent()}
      </main>

      <BottomNavBar
        viewMode={viewMode}
        setViewMode={handleSetViewMode}
        onAddItemClick={() => setAddModalOpen(true)}
      />
      
      {isSelectionMode && selectedItemIds.size > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
            <button
                onClick={handleGenerateRecipeForSelected}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center space-x-2 animate-fade-in-up"
            >
                <ChefHatIcon className="h-6 w-6" />
                <span>{t('cookWithItems', { count: selectedItemIds.size })}</span>
            </button>
        </div>
      )}

      {isAddModalOpen && <AddItemModal onClose={() => setAddModalOpen(false)} onAddItem={handleAddItem} />}
      {isShareModalOpen && itemToShare && <ShareModal item={itemToShare} onClose={() => setShareModalOpen(false)} onPost={handlePostShare} />}
      {isRecipeModalOpen && selectedItemsForRecipe.length > 0 && <RecipeSuggestionModal items={selectedItemsForRecipe} onClose={closeRecipeModal} onSave={handleSaveRecipe}/>}
      {isSettingsModalOpen && <SettingsModal onClose={() => setSettingsModalOpen(false)} onSave={handleSaveSettings} currentSettings={settings} />}
      {showNotification && <NotificationToast items={expiringItems} onClose={() => setShowNotification(false)} />}
      {isChatModalOpen && chatTarget && <ChatModal chatTarget={chatTarget} onClose={() => setChatModalOpen(false)} />}
    </div>
  );
};

export default App;