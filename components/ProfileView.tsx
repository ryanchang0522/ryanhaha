import React from 'react';
import { SavedRecipe } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ChefHatIcon, ShareIcon } from './Icons';

interface ProfileViewProps {
  savedRecipes: SavedRecipe[];
  onShareRecipe: (recipe: SavedRecipe) => void;
}

const RecipeCard: React.FC<{ recipe: SavedRecipe; onShare: (recipe: SavedRecipe) => void }> = ({ recipe, onShare }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105">
      <div className="relative">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
            <ChefHatIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">{recipe.recipeName}</h3>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">{recipe.description}</p>
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 text-sm bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition-colors">
            {t('viewRecipe')}
          </button>
          <button 
            onClick={() => onShare(recipe)}
            className="px-4 py-2 text-sm bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors flex items-center space-x-1.5"
          >
            <ShareIcon className="w-4 h-4" />
            <span>{t('shareRecipe')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileView: React.FC<ProfileViewProps> = ({ savedRecipes, onShareRecipe }) => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in-down">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('myKeepEat')}</h1>
        <p className="text-gray-500 mt-1">{t('myKeepEatSlogan')}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('myRecipes')}</h2>
        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} onShare={onShareRecipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <ChefHatIcon className="w-16 h-16 mx-auto text-gray-300" />
            <p className="mt-4 text-lg font-semibold text-gray-700">{t('noSavedRecipes')}</p>
            <p className="text-gray-500 mt-1">{t('noSavedRecipesHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
