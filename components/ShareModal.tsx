import React, { useState } from 'react';
import { FoodItem, ShareType } from '../types';
import { CloseIcon } from './Icons';

interface ShareModalProps {
  item: FoodItem;
  onClose: () => void;
  onPost: (shareDetails: { type: ShareType; description: string }) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ item, onClose, onPost }) => {
  const [shareType, setShareType] = useState<ShareType>(ShareType.Gift);
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    onPost({ type: shareType, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-down">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">分享 {item.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">分享方式</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {Object.values(ShareType).map((type) => (
                  <button
                    key={type}
                    onClick={() => setShareType(type)}
                    className={`px-4 py-2 text-sm rounded-md border text-left transition-colors ${
                      shareType === type
                        ? 'bg-green-100 border-green-500 text-green-800 font-semibold'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                補充說明
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="例如：晚餐想煮個湯，有人想一起嗎？"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              發佈分享
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;