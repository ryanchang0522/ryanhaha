import React, { useState, useRef, useEffect } from 'react';
import { Location, FoodItem } from '../types';
import { analyzeImageForFoodItem, parseTextForFoodItem } from '../services/geminiService';
import Spinner from './Spinner';
import { CameraIcon, ManualIcon, MicrophoneIcon, CloseIcon } from './Icons';

// Fix for SpeechRecognition API types which are not part of standard TypeScript DOM library.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

interface AddItemModalProps {
  onClose: () => void;
  onAddItem: (item: Omit<FoodItem, 'id' | 'urgency'>) => void;
}

type Tab = 'manual' | 'photo' | 'voice';

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex-1 flex items-center justify-center py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
            isActive
                ? 'border-green-400 text-green-400'
                : 'border-transparent text-gray-400 hover:text-white'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);


const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAddItem }) => {
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [location, setLocation] = useState<Location>(Location.Fridge);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-TW';

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        setError('');
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError('語音辨識失敗，請重試。');
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    } else {
      setIsSpeechSupported(false);
    }
  }, []);
  
  const handleListen = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };
  
  const handleAnalyzeText = async () => {
    if (!transcript) {
      setError("請先錄製語音。");
      return;
    }
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      const result = await parseTextForFoodItem(transcript);
      if(result.name) setName(result.name);
      if(result.expiryDate) setExpiryDate(result.expiryDate);
      if(result.location) setLocation(result.location);
      
      if(!result.name && !result.expiryDate) {
        setError("AI 無法辨識食材或日期，請手動輸入。");
      } else {
        setInfo("AI 已填入辨識結果，請確認後儲存。");
      }
      setActiveTab('manual');
    } catch(e: any) {
        if (e?.message?.includes("API key not found")) {
            setError("請在設定中提供您的 Gemini API 金鑰。");
        } else {
            setError('AI 分析時發生錯誤，請重試或手動輸入。');
        }
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate) {
      setError('請填寫所有欄位。');
      return;
    }
    setError('');
    setInfo('');
    onAddItem({ name, expiryDate: new Date(expiryDate), location });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
      setInfo('');
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
        setError("請先選擇圖片檔案。");
        return;
    };
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
        const result = await analyzeImageForFoodItem(imageFile, location);
        if (result.name) setName(result.name);
        if (result.expiryDate) setExpiryDate(result.expiryDate);

        if (result.dateSource === 'estimated') {
            setInfo("AI 已估計有效日期，請確認後儲存。");
        }
        
        if(!result.name && !result.expiryDate) {
            setError("AI 無法辨識食材或有效日期，請手動輸入。");
        }
        setActiveTab('manual');
    } catch (e: any) {
        if (e?.message?.includes("API key not found")) {
            setError("請在設定中提供您的 Gemini API 金鑰。");
        } else {
            setError('AI 分析時發生錯誤，請重試或手動輸入。');
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-down">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">新增食材</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-700">
            <TabButton icon={<ManualIcon className="h-5 w-5 mr-2"/>} label="手動輸入" isActive={activeTab === 'manual'} onClick={() => setActiveTab('manual')} />
            <TabButton icon={<CameraIcon className="h-5 w-5 mr-2"/>} label="照片辨識" isActive={activeTab === 'photo'} onClick={() => setActiveTab('photo')} />
            {isSpeechSupported && <TabButton icon={<MicrophoneIcon className="h-5 w-5 mr-2"/>} label="語音輸入" isActive={activeTab === 'voice'} onClick={() => setActiveTab('voice')} />}
        </div>

        <div className="p-6 overflow-y-auto">
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          {info && <p className="text-green-400 text-sm mb-4 text-center">{info}</p>}
          
          <div className={`${activeTab === 'manual' ? 'block' : 'hidden'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">名稱</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="例如：牛奶"
                />
              </div>
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300">有效日期</label>
                <input
                  type="date"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300">存放位置</label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value as Location)}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value={Location.Fridge}>冰箱</option>
                  <option value={Location.Freezer}>冷凍庫</option>
                  <option value={Location.Pantry}>儲藏室</option>
                </select>
              </div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500">
                {isLoading ? <Spinner /> : '儲存'}
              </button>
            </form>
          </div>

          <div className={`${activeTab === 'photo' ? 'block' : 'hidden'}`}>
             <div className="space-y-4">
                <div>
                  <label htmlFor="location-photo" className="block text-sm font-medium text-gray-300 mb-1">存放位置</label>
                  <select
                    id="location-photo"
                    value={location}
                    onChange={(e) => setLocation(e.target.value as Location)}
                    className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    <option value={Location.Fridge}>冰箱</option>
                    <option value={Location.Freezer}>冷凍庫</option>
                    <option value={Location.Pantry}>儲藏室</option>
                  </select>
                </div>

                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-gray-500"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-32 rounded-md"/>
                  ) : (
                    <>
                      <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-400">點擊上傳照片</span>
                    </>
                  )}
                </button>
                <button onClick={handleAnalyzeImage} disabled={!imageFile || isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500">
                   {isLoading ? <Spinner /> : '分析照片'}
                </button>
             </div>
          </div>
          
          {isSpeechSupported && (
            <div className={`${activeTab === 'voice' ? 'block' : 'hidden'}`}>
                <div className="text-center space-y-4">
                    <p className="text-gray-400">按下麥克風開始錄音</p>
                    <p className="text-gray-400 text-sm">例如：「牛奶放到冰箱，後天到期」</p>
                    <button onClick={handleListen} className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`}>
                        <MicrophoneIcon className="h-10 w-10 text-white" />
                    </button>
                    {transcript && (
                        <div className="text-left bg-gray-700 p-3 rounded-md">
                            <p className="text-white">{transcript}</p>
                        </div>
                    )}
                    <button onClick={handleAnalyzeText} disabled={!transcript || isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500">
                        {isLoading ? <Spinner /> : '分析語音'}
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;