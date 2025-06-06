import React from 'react';

export const SunAvatar = () => {
  return (
    <div className="fixed bottom-8 right-8 z-20">
      <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:transform hover:scale-110 transition-all cursor-pointer">
        <span className="text-2xl">☀️</span>
      </div>
    </div>
  );
};