import React, { useState } from 'react';
import { CommunityPost, ShareEvent, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import MapAndSharesView from './MapAndSharesView';
import FriendsList from './FriendsList';
import GroupsView from './GroupsView';
import { MapIcon, UsersIcon, ChatBubbleBottomCenterTextIcon } from './Icons';

interface ConnectViewProps {
    communityPosts: CommunityPost[];
    onOpenChat: (target: ShareEvent | UserProfile) => void;
    onDeletePost: (postId: string) => void;
}

type ConnectTab = 'shares' | 'friends' | 'groups';

const ConnectView: React.FC<ConnectViewProps> = ({ communityPosts, onOpenChat, onDeletePost }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ConnectTab>('shares');

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'shares':
        return <MapAndSharesView communityPosts={communityPosts} onOpenChat={onOpenChat} onDeletePost={onDeletePost} />;
      case 'friends':
        return <FriendsList onOpenChat={onOpenChat} />;
      case 'groups':
        return <GroupsView />;
      default:
        return null;
    }
  }

  const TabButton = ({ tab, label, icon }: { tab: ConnectTab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
        activeTab === tab
          ? 'border-green-500 text-green-600'
          : 'border-transparent text-gray-500 hover:text-green-500'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="animate-fade-in-down">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('communityConnect')}</h1>
        <p className="text-gray-500 mt-1">{t('communitySlogan')}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b border-gray-200">
          <TabButton tab="shares" label={t('mapShare')} icon={<MapIcon className="w-5 h-5" />} />
          <TabButton tab="friends" label={t('friends')} icon={<UsersIcon className="w-5 h-5" />} />
          <TabButton tab="groups" label={t('groups')} icon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5" />} />
        </div>
        <div className="p-4">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default ConnectView;
