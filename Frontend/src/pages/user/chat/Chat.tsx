import { SetStateAction, useEffect, useRef, useState } from 'react';
import { Avatar, Button } from "@nextui-org/react";
import { Phone, Video, MoreVertical, Loader } from 'lucide-react';
import Sidebar from '@/layout/user/Sidebar';
import SidebarVendor from '@/layout/vendor/SidebarProfileVendor';
import { useLocation, useNavigate } from "react-router-dom";
import Message from '@/components/chat/SenderMessage';
import { ActiveUser, Chats, Messages } from '@/types/extraTypes';
import { useSelector } from 'react-redux';
import UserRootState from '@/redux/rootstate/UserState';
import { VendorData } from '@/types/vendorTypes';
import { io, Socket } from "socket.io-client";
import { axiosInstance, axiosInstanceChat, axiosInstanceMessage } from '@/config/api/axiosInstance';
import ChatList from '@/components/chat/ChatList';
import { Textarea } from '@material-tailwind/react';
import { USER } from '@/config/constants/constants';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const user = useSelector((state: UserRootState) => state.user.userData);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [conversation, setConversation] = useState<Chats[]>([])
  const [currentChat, setCurrentChat] = useState<Chats | null>(null)
  const [messages, setMessages] = useState<Partial<Messages>[]>([]);
  const [arrivalMessage, setArrivalMessage] = useState<Partial<Messages> | null>(null)
  const [newMessage, setnewMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [vendor, setVendor] = useState<VendorData>();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const socket = useRef<Socket>()

  const handleConversationSelect = async (selectedConversation: Chats) => {
    try {
      setCurrentChat(selectedConversation);
      const friendId = selectedConversation.members.find((m) => m !== user?._id);
      const response = await axiosInstance.get(`/getVendor?vendorId=${friendId}`)
      setVendor(response.data.data)
      console.log(vendor,'vendor');
      

    } catch (error) {
      console.log('Error in handleConversationSelect', error);

    }
  }

  useEffect(() => {
    socket.current?.on('conversationUpdated', (data) => {
      setConversation((prevConversations) =>
        prevConversations.map((conv) =>
          conv._id === data.conversationId
            ? { ...conv, recentMessage: data.recentMessage, updatedAt: data.updatedAt }
            : conv
        )
      );
    });

    return () => {
      socket.current?.off('conversationUpdated');
    };
  }, []);


  useEffect(() => {
    const handleMessage = (data: { senderId: string; text: string }) => {
      setArrivalMessage({
        senderId: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    };

    socket.current = io(BASE_URL);
    socket.current.on('getMessage', handleMessage);

    return () => {
      socket.current?.off('getMessage', handleMessage);
      socket.current?.disconnect();
    };
  }, []);


  useEffect(() => {
    if (arrivalMessage && currentChat) {
      const isInCurrentChat = currentChat.members.includes(arrivalMessage.senderId!);
      if (isInCurrentChat) {
        setMessages((prev) => [...prev, arrivalMessage])
      }
    }
  }, [arrivalMessage, currentChat])

  useEffect(() => {
    socket.current?.emit("addUser", user?._id);
    socket.current?.on("getUsers", (users: ActiveUser[]) => {
      setActiveUsers(users);

    });

  }, [user]);

  const getConversation = async () => {
    try {
      const response = await axiosInstanceChat.get(`/?userId=${user?._id}`);
      console.log(response.data, 'getconverstion');
      setConversation(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getConversation();
  }, [user?._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await axiosInstanceMessage.get(`/?conversationId=${currentChat?._id}`)
        setMessages(response.data)
        setIsUpdated(false)
      } catch (error) {
        console.log(error);
      }
    }
    getMessages()
  }, [currentChat, isUpdated])



  const receiverId = currentChat?.members.find(
    (member) => member !== user?._id
  );

  const handleInputChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setnewMessage(e.target.value);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {

    if (!currentChat?._id || !user?._id || !newMessage.trim()) {
      console.error('Missing required fields for sending message');
      return;
    }
    e.preventDefault();
    const message = {
      senderId: user?._id,
      text: newMessage,
      image: '',
      imageUrl: '',
      conversationId: currentChat?._id
    }

    socket.current?.emit('sendMessage', {
      senderId: user?._id,
      receiverId,
      text: newMessage,
      image: '',
      imageUrl: '',
    })

    try {
      const response = await axiosInstanceMessage.post('/', message)
      setMessages([...messages, response.data])
      setnewMessage('')
    } catch (error) {
      console.log(error);

    }
    if (user?._id) {
      getConversation();
    }
  }

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);


  // useEffect(() => {
  //   socket.current?.on("activeStatus", (users) => {
  //     setActiveUsers(users);
  //   });
  // }, []);

  const changeIsRead = async (chatId: string) => {
    try {
      const data = { chatId, senderId: user?._id }
      await axiosInstanceMessage.patch('/changeIsRead', data, { withCredentials: true })

    } catch (error) {
      console.log(error);

    }
  }



  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block">
        {location.pathname === '/vendor/chat' ? <SidebarVendor /> : <Sidebar />}
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center flex-1">

            <h1 className="text-xl font-semibold">Chat</h1>
          </div>
          <div className="flex items-center" onClick={() => navigate(`${USER.PROFILE}`)} >
            <Avatar
              src={user?.imageUrl || "/default-avatar.png"}
              alt={user?.name}
              size="md"
              className={`rounded-full border-2 border-green-500`}
            />
            <span className="ml-2 text-sm font-medium hidden sm:inline">{user?.name}</span>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List */}
          <div className="w-full sm:w-72 md:w-80 border-r bg-white overflow-y-auto hidden sm:block">
            <div className="p-4">
              {conversation.length === 0 ? (
                <>
                  <div className="flex justify-center mb-4">
                    <Loader className="text-gray-500" />
                  </div>
                  <p className="text-center text-gray-500">No conversations found</p>
                </>
              ) : (

                <div className="space-y-2">
                  {conversation.map(conv => (
                    <div
                      onClick={() => {
                        handleConversationSelect(conv);
                        changeIsRead(conv._id);
                      }}
                    >
                      <ChatList
                        conversation={conv}
                        currentUser={user}
                        currentchat={currentChat}
                        isActive={activeUsers.some(
                          (u) => u.clientId === receiverId
                        )}
                        
                      // unreadMessages={unreadMessages}

                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Screen */}
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {currentChat ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b flex items-center justify-between px-4 lg:px-6">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      size="md"
                      src={vendor?.imageUrl || "/default-avatar.png"}
                    />
                    <div>
                      <h3 className="font-medium">{vendor ? vendor?.name : ''}</h3>
                      <p className="text-sm text-gray-500">
                        {activeUsers.some(
                          (u) => u.clientId === receiverId
                        ) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button isIconOnly variant="light">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button isIconOnly variant="light">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button isIconOnly variant="light">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                {currentChat ? (
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        ref={index === messages.length - 1 ? scrollRef : null}
                      >
                        <Message
                          message={msg}
                          time={msg.createdAt }
                          isOwnMessage={msg.senderId === user?._id}
                          setIsUpdated={setIsUpdated}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                  </>
                )}


                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Textarea
                      rows={1}
                      resize={true}
                      placeholder="Type your message..."
                      onChange={handleInputChange}
                      className="flex-1"
                      labelProps={{
                        className:
                          "before:content-none after:content-none",
                      }}
                      aria-label="Message input"
                      value={newMessage}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <Button
                      className="bg-black text-white rounded-md px-4 py-2"
                      onClick={handleSubmit}
                      type='submit'
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <h6 className="text-gray-500 mb-2">Welcome to Chat</h6>
                  <p className="text-sm text-gray-400">Select a conversation to start messaging!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;