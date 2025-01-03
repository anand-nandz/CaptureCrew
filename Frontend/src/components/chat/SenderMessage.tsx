import { formatMessageTime, Messages } from '@/types/extraTypes';
// import { Check } from 'lucide-react';
import React from 'react';

interface MessageProps {
  message: Partial<Messages>;
  time?: string | undefined | number;
  isOwnMessage: boolean;
  setIsUpdated?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Message: React.FC<MessageProps> = ({ message, time, isOwnMessage = false }) => {
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} space-x-2 mb-4`}>
      <div className={`
      max-w-xs px-4 py-2 rounded-lg relative
      ${isOwnMessage
          ? 'bg-black text-white'
          : 'bg-gray-200 text-black'}
    `}>
        {message?.imageUrl ? (
          <img
            src={message.imageUrl}
            alt={message.imageName || 'Image'}
            className="w-40 h-30"
          />
        ) : (
          <p className="text-sm">{message?.text}</p>
        )}

        <div className={`flex text-xs mt-1 ${isOwnMessage ? 'text-gray-300 text-right' : 'text-gray-500'}`}>
        <span>{formatMessageTime(time)}</span>
       
          {/* <div className='flex'>
            <Check size={12} className={`${message?.isRead ? '-mr-1' : ''}`}/>
            {message?.isRead && <Check size={12}/>}
          </div> */}
      
        </div>
      </div>
    </div>
  );
};

export default Message;