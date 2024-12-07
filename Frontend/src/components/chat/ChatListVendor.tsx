import { axiosInstance } from "@/config/api/axiosInstance";
import { Chats, formatMessageTime } from "@/types/extraTypes";
import { UserData } from "@/types/userTypes";
import { Avatar } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { VendorData } from "@//types/vendorTypes";

interface ConversationsProps {
    conversation: Chats;
    currentUser: Partial<VendorData | null>;
    isActive: boolean;
    currentchat: Chats | null;
    unreadMessages?: { [key: string]: number };
}

const ChatListVendor: React.FC<ConversationsProps> = ({
    conversation, currentUser, isActive, currentchat, unreadMessages = {}
}) => {
    const [user, setUser] = useState<UserData>();

    const friendId = conversation.members.find((m) => m !== currentUser?._id);


    useEffect(() => {

        const getUser = async () => {
            try {
                const response = await axiosInstance.get(`/getUser?userId=${friendId}`)
                setUser(response.data.data)
            } catch (error) {
                console.log(error);
            }
        };
        getUser();

    }, [currentUser, conversation, isActive, currentchat, friendId]);
    return (
        <div
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer 
          ${currentchat?._id === conversation._id ? 'bg-gray-200' : 'bg-gray-50'}`}
        >
            <div className="relative">

                <Avatar
                    size="md"
                    src={user?.imageUrl || "/images/default-avatar.png"}
                    className={`rounded-full ${currentchat?._id === conversation._id ? 'border-2 border-green-500' : ''}`}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <p className="font-medium truncate text-black">{user?.name || ''}</p>
                    <span className="text-xs text-gray-500">{formatMessageTime(conversation?.updatedAt)}</span>
                </div>
                {unreadMessages[conversation._id] > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {unreadMessages[conversation._id]}
                    </span>
                )}
                {conversation.recentMessage && (
                    <p className="text-sm text-gray-500 truncate">
                        {conversation.recentMessage}
                        
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatListVendor