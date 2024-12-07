import { formatMessageTime, Messages } from '@/types/extraTypes';
import React from 'react';

interface MessageProps {
  message: Partial<Messages>;
  time?: string | undefined | number;
  isOwnMessage: boolean;
  setIsUpdated?:React.Dispatch<React.SetStateAction<boolean>>;
}

const Message: React.FC<MessageProps> = ({ message, time, isOwnMessage = false }) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} space-x-2 mb-4`}>
      <div className={`
      max-w-xs px-4 py-2 rounded-lg 
      ${isOwnMessage
          ? 'bg-black text-white'
          : 'bg-gray-200 text-black'}
    `}>
        <p className="text-sm">{message?.text}</p>
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-gray-300 text-right' : 'text-gray-500'}`}>
          {formatMessageTime(time)}
        </div>
      </div>
    </div>
  );
};

export default Message;