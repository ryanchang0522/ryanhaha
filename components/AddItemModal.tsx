import React, { useState, useRef, useEffect } from 'react';
import { Location, FoodItem } from '../types';
import { analyzeImageForFoodItem, parseTextForFoodItem } from '../services/geminiService';
import Spinner from './Spinner';
import { CameraIcon, ManualIcon, MicrophoneIcon } from './Icons';

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
    } catch(e) {
      setError('AI 分析時發生錯誤，請重試或手動輸入。');
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
    } catch (e) {
        setError('AI 分析時發生錯誤，請重試或手動輸入。');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">新增食材</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
