import React, { useState, useEffect } from 'react';
import { ShareEvent, UserProfile } from '../types';
import { CloseIcon, AddIcon, PaperAirplaneIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getChatResponse } from '../services/geminiService';
import Spinner from './Spinner';

interface ChatModalProps {
  chatTarget: ShareEvent | UserProfile;
  onClose: () => void;
}

interface ChatMessage {
  sender: string;
  text: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ chatTarget, onClose }) => {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const targetUser = 'initiator' in chatTarget ? chatTarget.initiator : chatTarget;
  const isAiFriend = targetUser.id === 'u1'; // '王小明' is our AI friend
  
  const initialMessage = 'initiator' in chatTarget 
    ? `你好！我對你分享的「${(chatTarget as ShareEvent).item.name}」有興趣。`
    : (isAiFriend ? '你好，我是王小明，很高興認識你！有什麼關於烹飪或食材的問題嗎？' : `嗨！想跟你聊聊。`);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: targetUser.name, text: initialMessage },
  ]);

  const handleSend = async () => {
    if (message.trim() && !isAiTyping) {
      const newUserMessage: ChatMessage = { sender: 'Me', text: message };
      const newChatHistory = [...chatHistory, newUserMessage];
      setChatHistory(newChatHistory);
      setMessage('');

      if (isAiFriend) {
        setIsAiTyping(true);
        try {
          const aiResponse = await getChatResponse(newChatHistory, newUserMessage.text);
          setChatHistory(prev => [...prev, { sender: targetUser.name, text: aiResponse }]);
        } catch (error: any) {
          console.error("AI chat failed:", error);
          let errorMessage = "抱歉，我好像斷線了...";
          if (error?.message?.includes("API key not found")) {
            errorMessage = "請在設定中設定您的 API 金鑰才能聊天。";
          }
          setChatHistory(prev => [...prev, { sender: targetUser.name, text: errorMessage }]);
        } finally {
          setIsAiTyping(false);
        }
      } else {
        // Mock a response for regular users for now
        setTimeout(() => {
           setChatHistory(prev => [...prev, { sender: targetUser.name, text: "好的，收到！" }]);
        }, 1000);
      }
    }
  };
  
  const handleAddFriend = () => {
    alert(t('friendRequestSent'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-down">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-lg">
          <h2 className="text-lg font-bold text-white">{t('chatWith', { name: targetUser.name })}</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleAddFriend} className="flex items-center space-x-1 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-full transition-colors">
                <AddIcon className="w-4 h-4" />
                <span>{t('addFriend')}</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Chat History */}
        <div className="p-4 flex-grow overflow-y-auto bg-gray-800">
          <div className="space-y-4">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.sender === 'Me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${chat.sender === 'Me' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                  <p className="text-sm">{chat.text}</p>
                </div>
              </div>
            ))}
            {isAiTyping && (
                 <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-700 text-gray-200">
                       <div className="flex items-center space-x-2">
                           <Spinner />
                           <span className="text-sm text-gray-400">正在輸入...</span>
                       </div>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('messagePlaceholder')}
              className="flex-grow block w-full bg-gray-700 border-gray-600 text-white rounded-full shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-2 placeholder-gray-400"
              style={{ color: '#E5E7EB' }} // Ensuring high contrast
            />
            <button onClick={handleSend} disabled={isAiTyping} className="bg-green-600 text-white rounded-full p-2 hover:bg-green-700 transition-colors disabled:bg-gray-500">
              <PaperAirplaneIcon className="w-6 h-6"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;