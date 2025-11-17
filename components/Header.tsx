
import React from 'react';
import { LogoIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LogoIcon className="h-10 w-10 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">KeepEat</h1>
            <p className="text-sm text-gray-500">Keep it fresh. Eat it together.</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
