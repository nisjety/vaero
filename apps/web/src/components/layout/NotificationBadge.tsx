// Description: Gives a notification badge that appears at the bottom of the screen
// when there is an issue, with a close button to dismiss it.


import React, { useState } from 'react';

export const NotificationBadge = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-3 shadow-lg">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span>1 Issue</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};