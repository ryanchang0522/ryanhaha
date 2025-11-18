import React from 'react';
import { UserProfile, UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ChatBubbleLeftRightIcon, TrashIcon } from './Icons';

interface FriendsListProps {
  onOpenChat: (target: UserProfile) => void;
}

const mockFriends: UserProfile[] = [
  { id: 'u1', name: '王小明', role: UserRole.Standard, friends: [], onlineStatus: 'online' },
  { id: 'u2', name: '陳志工', role: UserRole.Volunteer, friends: [], onlineStatus: 'offline' },
  { id: 'u3', name: '林奶奶', role: UserRole.Senior, friends: [], onlineStatus: 'online' },
  { id: 'u4', name: '李大廚', role: UserRole.Standard, friends: [], onlineStatus: 'offline' },
];

const FriendsList: React.FC<FriendsListProps> = ({ onOpenChat }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      {mockFriends.map(friend => (
        <div key={friend.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between transition-shadow hover:shadow-md">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300 to-blue-400 flex items-center justify-center text-white font-bold text-xl">
                {friend.name.charAt(0)}
              </div>
              <span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-gray-50 ${friend.onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} title={friend.onlineStatus === 'online' ? t('online') : t('offline')}></span>
            </div>
            <div className="ml-4">
              <p className="font-bold text-gray-800">{friend.name}</p>
              <p className="text-sm text-gray-500">{friend.role}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenChat(friend)}
              className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              aria-label={`${t('chatWith', { name: friend.name })}`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              aria-label={`${t('removeFriend')} ${friend.name}`}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendsList;