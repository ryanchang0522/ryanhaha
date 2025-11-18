import React, { useState, useEffect, useCallback } from 'react';
import { getRecipeSuggestion, generateRecipeImage } from '../services/geminiService';
import { FoodItem, RecipeData } from '../types';
import Spinner from './Spinner';
import { CloseIcon, CameraIcon, RefreshIcon, AlertTriangleIcon, InfoIcon, StarIcon } from './Icons';

interface RecipeSuggestionModalProps {
  items: FoodItem[];
  onClose: () => void;
  onSave: (recipe: RecipeData, imageUrl: string | null) => void;
}

const RecipeSuggestionModal: React.FC<RecipeSuggestionModalProps> = ({ items, onClose, onSave }) => {
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);
  const [isLoadingMainImage, setIsLoadingMainImage] = useState(false);
  
  const [error, setError] = useState('');
  
  const fetchRecipe = useCallback(async () => {
    const itemNames = items.map(item => item.name);
    // Reset states for regeneration
    setIsLoadingRecipe(true);
    setRecipe(null);
    setMainImageUrl(null);
    setIsLoadingMainImage(false);
    setError('');
    setIsSaved(false);

    if (items.length === 0) {
      setError("沒有選擇任何食材。");
      setIsLoadingRecipe(false);
      return;
    }

    try {
      const suggestion = await getRecipeSuggestion(itemNames);
      setRecipe(suggestion);
      
      // Kick off main image generation
      setIsLoadingMainImage(true);
      generateRecipeImage(suggestion.recipeName).then(url => {
          setMainImageUrl(url);
      }).finally(() => {
          setIsLoadingMainImage(false);
      });

    } catch (e: any) {
      if (e?.message?.includes("API key not found")) {
        setError("請在設定中提供您的 Gemini API 金鑰才能取得建議。");
      } else {
        setError('無法取得食譜建議，請稍後再試或換個組合。');
      }
    } finally {
      setIsLoadingRecipe(false);
    }
  }, [items]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  const handleSaveClick = () => {
    if (recipe) {
      onSave(recipe, mainImageUrl);
      setIsSaved(true);
    }
  };
  
  const itemNamesString = items.map(i => i.name).join('、');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-down">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate pr-4">用 {itemNamesString} 做菜！</h2>
            <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSaveClick} 
                  disabled={isLoadingRecipe || !recipe || isSaved} 
                  className={`p-2 rounded-full transition-colors ${isSaved ? 'text-yellow-400 bg-yellow-100' : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                  aria-label={isSaved ? "已收藏" : "收藏食譜"}
                >
                    <StarIcon className="h-6 w-6" />
                </button>
                <button onClick={fetchRecipe} disabled={isLoadingRecipe} className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <RefreshIcon className={`h-6 w-6 ${isLoadingRecipe ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
          {isLoadingRecipe ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <Spinner />
              <p className="text-gray-600">AI 廚師正在發揮創意...</p>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-8">{error}</p>
          ) : recipe && (
            <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{recipe.recipeName}</h3>
                
                {isLoadingMainImage ? (
                    <div className="w-full aspect-video bg-gray-200 rounded-lg flex flex-col items-center justify-center animate-pulse">
                        <CameraIcon className="w-10 h-10 text-gray-400 mb-2"/>
                        <p className="text-gray-500 text-sm">AI 正在繪製成品圖...</p>
                    </div>
                ) : mainImageUrl ? (
                    <img src={mainImageUrl} alt={`AI 生成的 ${recipe.recipeName} 圖片`} className="w-full aspect-video object-cover rounded-lg shadow-md"/>
                ) : (
                    <div className="w-full aspect-video bg-gray-100 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-4">
                        <AlertTriangleIcon className="w-8 h-8 text-yellow-500 mb-2"/>
                        <p className="text-yellow-700 font-semibold text-sm">無法生成圖片</p>
                        <p className="text-yellow-600 text-xs mt-1">這可能是由於 API 用量限制或網路問題。</p>
                    </div>
                )}


                <p className="text-gray-600">{recipe.description}</p>
                
                <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">食材</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                </div>

                <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">步驟</h4>
                    <div className="space-y-4">
                        {recipe.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full flex items-center justify-center">
                                    {index + 1}
                                </div>
                                <p className="flex-grow text-gray-700 pt-1">{step.instruction}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertTriangleIcon className="h-6 w-6 text-yellow-500 mr-3"/>
                            <h5 className="font-semibold text-yellow-800">過敏原提醒</h5>
                        </div>
                        <p className="text-yellow-700 mt-2 text-sm">{recipe.allergens}</p>
                    </div>
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <InfoIcon className="h-6 w-6 text-blue-500 mr-3"/>
                            <h5 className="font-semibold text-blue-800">營養標示 (預估值)</h5>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-blue-700">
                           <span>熱量: <strong>{recipe.nutrition.calories}</strong></span>
                           <span>蛋白質: <strong>{recipe.nutrition.protein}</strong></span>
                           <span>碳水化合物: <strong>{recipe.nutrition.carbs}</strong></span>
                           <span>脂肪: <strong>{recipe.nutrition.fat}</strong></span>
                        </div>
                    </div>
                </div>

            </div>
          )}
        </div>
        <div className="p-4 mt-auto border-t bg-gray-50">
            <div className="flex justify-end">
                <button onClick={onClose} className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">
                    關閉
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeSuggestionModal;