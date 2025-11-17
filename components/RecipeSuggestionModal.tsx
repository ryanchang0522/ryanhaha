
import React, { useState, useEffect } from 'react';
import { getRecipeSuggestion } from '../services/geminiService';
import { FoodItem } from '../types';
import Spinner from './Spinner';

interface RecipeSuggestionModalProps {
  item: FoodItem;
  onClose: () => void;
}

const RecipeSuggestionModal: React.FC<RecipeSuggestionModalProps> = ({ item, onClose }) => {
  const [recipe, setRecipe] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const suggestion = await getRecipeSuggestion(item.name);
        setRecipe(suggestion);
      } catch (e) {
        setError('Could not fetch a recipe suggestion. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipe();
  }, [item.name]);

  const formatRecipe = (text: string) => {
    return text
        .replace(/### (.*)/g, '<h3 class="text-xl font-bold mb-2">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\* (.*)/g, '<li class="ml-4 list-disc">$1</li>')
        .replace(/(\d+)\. (.*)/g, '<li class="ml-4 list-decimal">$1. $2</li>')
        .replace(/\n/g, '<br />');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Eat {item.name} Together!</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Spinner />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-8">{error}</p>
          ) : (
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: formatRecipe(recipe) }} />
          )}
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Sounds Delicious!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeSuggestionModal;
