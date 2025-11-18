import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UsersIcon } from './Icons';

const GroupsView: React.FC = () => {
    const { t } = useLanguage();

    const mockGroups = [
        { name: '信義區烘焙愛好者', members: 24, description: '分享麵包、甜點食譜與成果！' },
        { name: '週末共煮團', members: 12, description: '每週末選一道菜，大家一起煮一起吃。' },
        { name: '銀髮健康餐桌', members: 8, description: '專為長者設計的健康、簡單料理交流。' },
    ];

    return (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
            <UsersIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-bold text-gray-800">{t('groupsComingSoon')}</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">{t('groupsDescription')}</p>

            <div className="mt-8 text-left">
                <h3 className="text-md font-semibold text-gray-700 mb-4">預覽未來社群：</h3>
                <div className="space-y-3 opacity-50 select-none pointer-events-none">
                    {mockGroups.map((group, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-800">{group.name}</p>
                                <p className="text-sm text-gray-500">{group.members} 位成員</p>
                            </div>
                            <button disabled className="px-3 py-1 text-sm bg-gray-200 text-gray-500 font-semibold rounded-full">
                                加入
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroupsView;