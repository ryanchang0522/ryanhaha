import React, { useState, useMemo } from 'react';
import { FoodItem, Location, Urgency } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, FridgeIcon, FreezerIcon, PantryIcon } from './Icons';

interface CalendarViewProps {
    items: FoodItem[];
}

const urgencyConfig = {
    [Urgency.UseNow]: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-500',
    },
    [Urgency.PlanSoon]: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-500',
    },
    [Urgency.Safe]: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-500',
    },
};

const locationIcons: { [key in Location]: React.FC<{ className?: string }> } = {
  [Location.Fridge]: FridgeIcon,
  [Location.Freezer]: FreezerIcon,
  [Location.Pantry]: PantryIcon,
};

const CalendarView: React.FC<CalendarViewProps> = ({ items }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [modalItems, setModalItems] = useState<FoodItem[]>([]);

    const itemsByDate = useMemo(() => {
        const grouped: { [key: string]: FoodItem[] } = {};
        items.forEach(item => {
            const dateString = item.expiryDate.toISOString().split('T')[0];
            if (!grouped[dateString]) {
                grouped[dateString] = [];
            }
            grouped[dateString].push(item);
        });
        // Sort items within each day by urgency
        for (const date in grouped) {
            grouped[date].sort((a, b) => {
                const order = { [Urgency.UseNow]: 0, [Urgency.PlanSoon]: 1, [Urgency.Safe]: 2 };
                return order[a.urgency] - order[b.urgency];
            });
        }
        return grouped;
    }, [items]);

    const handleDateClick = (day: Date, itemsForDay: FoodItem[]) => {
        if (itemsForDay.length > 0) {
            setSelectedDate(day);
            setModalItems(itemsForDay);
        }
    }

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
    
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md animate-fade-in-down">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">
                    {currentDate.getFullYear()} 年 {currentDate.toLocaleString('zh-TW', { month: 'long' })}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronRightIcon className="w-6 h-6 text-gray-600" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 text-sm">
                {weekDays.map(d => <div key={d} className="py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map(d => {
                    const dateString = d.toISOString().split('T')[0];
                    const itemsForDay = itemsByDate[dateString] || [];
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();

                    return (
                        <div 
                            key={d.toString()} 
                            className={`relative min-h-[7rem] border border-gray-100 rounded-md p-1.5 flex flex-col transition-colors ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${itemsForDay.length > 0 ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                            onClick={() => handleDateClick(d, itemsForDay)}
                        >
                            <span className={`text-sm self-start ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'} ${isToday(d) ? 'font-bold text-white bg-green-600 rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                {d.getDate()}
                            </span>
                             <div className="mt-1 space-y-1 overflow-hidden">
                                {itemsForDay.slice(0, 2).map(item => (
                                    <div key={item.id} className={`py-0.5 px-1.5 text-xs rounded-full truncate ${urgencyConfig[item.urgency].bgColor} ${urgencyConfig[item.urgency].textColor}`}>
                                        {item.name}
                                    </div>
                                ))}
                                {itemsForDay.length > 2 && (
                                    <div className="py-0.5 px-1.5 text-xs rounded-full bg-gray-200 text-gray-600">
                                        + {itemsForDay.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedDate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in-down" onClick={() => setSelectedDate(null)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">{selectedDate.toLocaleDateString('zh-TW')} 到期品項</h3>
                            <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <ul className="p-4 max-h-80 overflow-y-auto">
                            {modalItems.map(item => {
                                const LocationIcon = locationIcons[item.location];
                                const config = urgencyConfig[item.urgency];
                                return (
                                    <li key={item.id} className={`p-3 rounded-md flex items-center mb-2 ${config.bgColor}`}>
                                        <div className={`w-2 h-2 rounded-full mr-3 ${config.borderColor} border-2`}></div>
                                        <div className="flex-grow">
                                            <p className={`font-semibold ${config.textColor}`}>{item.name}</p>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <LocationIcon className="w-3 h-3 mr-1" />
                                                <span>{item.location}</span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.textColor}`}>{item.urgency}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
