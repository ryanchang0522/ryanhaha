import React from 'react';
import { SharedRecipePost } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ChefHatIcon, TrashIcon } from './Icons';

interface SharedRecipeCardProps {
  post: SharedRecipePost;
  onDeletePost: (postId: string) => void;
  isHighlighted: boolean;
}

const SharedRecipeCard: React.FC<SharedRecipeCardProps> = ({ post, onDeletePost, isHighlighted }) => {
  const { t } = useLanguage();
  const styles = { badge: 'bg-teal-100 text-teal-800', border: 'border-teal-500' };

  return (
    <div className={`relative bg-white rounded-lg shadow-md p-4 border-l-4 ${styles.border} flex flex-col justify-between transition-all duration-300 ${isHighlighted ? 'scale-105 ring-2 ring-green-500' : ''}`}>
      {post.isOwn && (
        <div className="absolute top-2 right-2 text-xs bg-green-500 text-white font-bold px-2 py-0.5 rounded-full">{t('yourShare')}</div>
      )}
      <div>
        <div className="flex justify-between items-start">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles.badge}`}>{t('sharedRecipe')}</span>
        </div>
        <div className="flex items-start space-x-3 my-2">
            <div className="w-16 h-16 rounded-md bg-gray-100 flex-shrink-0">
                 {post.recipe.imageUrl ? (
                    <img src={post.recipe.imageUrl} alt={post.recipe.recipeName} className="w-full h-full object-cover rounded-md" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ChefHatIcon className="w-8 h-8 text-gray-400" />
                    </div>
                 )}
            </div>
            <div>
                 <p className="text-lg font-bold text-gray-800">{post.recipe.recipeName}</p>
                 <p className="text-gray-600 text-sm">{post.description}</p>
            </div>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
        <span>{t('initiatorLabel')}{post.initiator.name}</span>
        {post.isOwn ? (
          <button onClick={() => onDeletePost(post.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full transition-colors flex items-center space-x-1">
            <TrashIcon className="w-3 h-3" />
            <span>{t('delete')}</span>
          </button>
        ) : (
          <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-1 px-3 rounded-full transition-colors">
            {t('viewRecipe')}
          </button>
        )}
      </div>
    </div>
  );
};

export default SharedRecipeCard;
