import React, { useState, useMemo } from 'react';
import { CommunityPost, ShareEvent, ShareType, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TrashIcon } from './Icons';
import SharedRecipeCard from './SharedRecipeCard';

interface MapAndSharesViewProps {
    communityPosts: CommunityPost[];
    onOpenChat: (target: ShareEvent | UserProfile) => void;
    onDeletePost: (postId: string) => void;
}

const getShareTypeStyle = (type: ShareType) => {
    switch(type) {
        case ShareType.Gift: return { badge: 'bg-blue-100 text-blue-800', border: 'border-blue-500', pin: 'bg-blue-500' };
        case ShareType.CoCook: return { badge: 'bg-orange-100 text-orange-800', border: 'border-orange-500', pin: 'bg-orange-500' };
        case ShareType.CoEat: return { badge: 'bg-purple-100 text-purple-800', border: 'border-purple-500', pin: 'bg-purple-500' };
        case ShareType.Assistance: return { badge: 'bg-pink-100 text-pink-800', border: 'border-pink-500', pin: 'bg-pink-500' };
        default: return { badge: 'bg-gray-100 text-gray-800', border: 'border-gray-500', pin: 'bg-gray-500' };
    }
}

const ShareEventCard: React.FC<{ event: ShareEvent, onOpenChat: (event: ShareEvent) => void, onDeletePost: (postId: string) => void, isHighlighted: boolean }> = ({ event, onOpenChat, onDeletePost, isHighlighted }) => {
    const styles = getShareTypeStyle(event.shareType);
    const { t } = useLanguage();
    
    return (
        <div className={`relative bg-white rounded-lg shadow-md p-4 border-l-4 ${styles.border} flex flex-col justify-between transition-all duration-300 ${isHighlighted ? 'scale-105 ring-2 ring-green-500' : ''}`}>
             {event.isOwn && (
                <div className="absolute top-2 right-2 text-xs bg-green-500 text-white font-bold px-2 py-0.5 rounded-full">{t('yourShare')}</div>
            )}
            <div>
                <div className="flex justify-between items-start">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles.badge}`}>{event.shareType}</span>
                    <span className="text-xs text-gray-400">1.2 km</span>
                </div>
                <p className="text-lg font-bold text-gray-800 my-2">{t('shareLabel')}{event.item.name}</p>
                <p className="text-gray-600 text-sm mb-3">{event.description}</p>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
                <span>{t('initiatorLabel')}{event.initiator.name}</span>
                {event.isOwn ? (
                    <button onClick={() => onDeletePost(event.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full transition-colors flex items-center space-x-1">
                        <TrashIcon className="w-3 h-3"/>
                        <span>{t('delete')}</span>
                    </button>
                ) : (
                    <button onClick={() => onOpenChat(event)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-full transition-colors">
                        {t('joinButton')}
                    </button>
                )}
            </div>
        </div>
    );
}


const MapAndSharesView: React.FC<MapAndSharesViewProps> = ({ communityPosts, onOpenChat, onDeletePost }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { t } = useLanguage();

  const mapBounds = useMemo(() => {
    if (communityPosts.length === 0) return null;
    const latitudes = communityPosts.map(e => e.location.latitude);
    const longitudes = communityPosts.map(e => e.location.longitude);
    return {
      minLat: Math.min(...latitudes), maxLat: Math.max(...latitudes),
      minLon: Math.min(...longitudes), maxLon: Math.max(...longitudes),
    };
  }, [communityPosts]);

  const getPinPosition = (post: CommunityPost) => {
    if (!mapBounds) return { top: '50%', left: '50%' };
    const latRange = mapBounds.maxLat - mapBounds.minLat;
    const lonRange = mapBounds.maxLon - mapBounds.minLon;
    const top = latRange === 0 ? 50 : 10 + (((mapBounds.maxLat - post.location.latitude) / latRange) * 80);
    const left = lonRange === 0 ? 50 : 10 + (((post.location.longitude - mapBounds.minLon) / lonRange) * 80);
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div>
      <div className="relative h-64 bg-gradient-to-br from-green-100 to-blue-200 rounded-lg flex items-center justify-center text-gray-500 mb-6 overflow-hidden shadow-inner">
        <div className="absolute w-full h-px bg-white/50 top-1/4"></div>
        <div className="absolute w-full h-px bg-white/50 top-1/2"></div>
        <div className="absolute w-full h-px bg-white/50 top-3/4"></div>
        <div className="absolute h-full w-px bg-white/50 left-1/4"></div>
        <div className="absolute h-full w-px bg-white/50 left-1/2"></div>
        <div className="absolute h-full w-px bg-white/50 left-3/4"></div>
        
        {communityPosts.map(post => {
            const pos = getPinPosition(post);
            const isSelected = selectedEventId === post.id;
            const pinColor = post.type === 'food' ? getShareTypeStyle(post.shareType).pin : 'bg-teal-500';

            return (
                <div 
                    key={post.id}
                    className={`absolute w-4 h-4 rounded-full ${pinColor} cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 border-2 border-white shadow-lg ${isSelected ? 'scale-[1.7] ring-2 ring-white z-20' : 'z-10'}`}
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setSelectedEventId(post.id)}
                    title={`${post.initiator.name} ${t('shares')} ${post.type === 'food' ? post.item.name : post.recipe.recipeName}`}
                />
            );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communityPosts.map(post => (
            <div key={post.id} onMouseEnter={() => setSelectedEventId(post.id)} onMouseLeave={() => setSelectedEventId(null)}>
                {post.type === 'food' ? (
                     <ShareEventCard 
                        event={post} 
                        onOpenChat={onOpenChat}
                        onDeletePost={onDeletePost}
                        isHighlighted={selectedEventId === post.id}
                    />
                ) : (
                    <SharedRecipeCard
                        post={post}
                        onDeletePost={onDeletePost}
                        isHighlighted={selectedEventId === post.id}
                    />
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

export default MapAndSharesView;
