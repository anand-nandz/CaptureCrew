import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Button, Input } from "@nextui-org/react";
import { Loader, Search } from 'lucide-react';
import Sidebar from '@/layout/user/Sidebar';
import SidebarVendor from '@/layout/vendor/SidebarProfileVendor';
import { useLocation, useNavigate } from "react-router-dom";
import Message from '@/components/chat/SenderMessage';
import { ActiveUser, Chats, Messages } from '@/types/extraTypes';
import { useSelector } from 'react-redux';
import { io, Socket } from "socket.io-client";
import { axiosInstanceChat, axiosInstanceMessage, axiosInstanceVendor } from '@/config/api/axiosInstance';
import { Textarea } from '@material-tailwind/react';
import VendorRootState from '@/redux/rootstate/VendorState';
import { UserData } from '@/types/userTypes';
import ChatListVendor from '@/components/chat/ChatListVendor';
import { VENDOR } from '@/config/constants/constants';
import { BackspaceIcon } from '@heroicons/react/24/solid';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const vendor = useSelector((state: VendorRootState) => state.vendor.vendorData);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [conversation, setConversation] = useState<Chats[]>([])
  const [currentChat, setCurrentChat] = useState<Chats | null>(null)
  const [messages, setMessages] = useState<Partial<Messages>[]>([]);
  const [arrivalMessage, setArrivalMessage] = useState<Partial<Messages> | null>(null)
  const [newMessage, setnewMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [user, setUser] = useState<UserData>();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const socket = useRef<Socket>();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<Chats[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filterConversations = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setFilteredConversations(conversation);
      return;
    }

    const filtered = await Promise.all(
      conversation.map(async (conv) => {
        const friendId = conv.members.find((m) => m !== vendor?._id);
        try {
          const response = await axiosInstanceVendor.get(`/getUser?userId=${friendId}`)
          const user = response.data.data;
          return {
            conv,
            user
          };
        } catch (error) {
          console.error('Error fetching user:', error);
          return {
            conv,
            user: null
          };
        }
      })
    );

    const matchingConversations = filtered
      .filter(({ user }) =>
        user?.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
      .map(({ conv }) => conv);

    setFilteredConversations(matchingConversations);
  }, [debouncedQuery, conversation, vendor?._id]);

  useEffect(() => {
    filterConversations();
  }, [debouncedQuery, filterConversations]);

  const userCache = useRef<Map<string, UserData>>(new Map());

  const handleConversationSelect = async (selectedConversation: Chats) => {
    try {
      setCurrentChat(selectedConversation);
      const friendId = selectedConversation.members.find((m) => m !== vendor?._id);
      if (friendId && userCache.current.has(friendId)) {
        setUser(userCache.current.get(friendId));
      } else if (friendId) {
        const response = await axiosInstanceVendor.get(`/getUser?userId=${friendId}`)
        const userData = response.data.data;
        userCache.current.set(friendId, userData);
        setUser(response.data.data)
      }

    } catch (error) {
      console.error('Error in handleConversationSelect', error);

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


  // useEffect(() => {
  //   socket.current = io(BASE_URL);
  //   socket.current.on('getMessage', (data) => {
  //     setArrivalMessage({
  //       senderId: data.senderId,
  //       text: data.text,
  //       createdAt: Date.now()
  //     })


  //   })

  // }, [arrivalMessage]);
  // console.log(arrivalMessage, 'arrival');

  useEffect(() => {

    socket.current = io(BASE_URL);
    socket.current.on('getMessage', (data) => {
      setArrivalMessage({
        senderId: data.senderId,
        text: data.text,
        createdAt: Date.now()
      })


    })
    if (
      arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.senderId!)
    ) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);


  useEffect(() => {
    socket.current?.emit("addUser", vendor?._id);
    socket.current?.on("getUsers", (users: ActiveUser[]) => {
      setActiveUsers(users)
    });

  }, [vendor]);


  const getConversation = async () => {
    try {
      const response = await axiosInstanceChat.get(`/?userId=${vendor?._id}`);
      setConversation(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (vendor?._id) {
      getConversation();
    }
  }, [vendor?._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await axiosInstanceMessage.get(`/?conversationId=${currentChat?._id}`)
        setMessages(response.data)
        setIsUpdated(false)
      } catch (error) {
        console.error(error);
      }
    }
    getMessages()
  }, [currentChat, isUpdated])

  const receiverId = currentChat?.members.find(
    (member) => member !== vendor?._id
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setnewMessage(e.target.value);
  };

  const sendMessage = async () => {
    if (!currentChat?._id || !vendor?._id || !newMessage.trim()) {
      console.error('Missing required fields for sending message');
      return;
    }

    const message = {
      senderId: vendor._id,
      text: newMessage,
      image: '',
      imageUrl: '',
      conversationId: currentChat._id
    };

    socket.current?.emit('sendMessage', {
      senderId: vendor._id,
      receiverId,
      text: newMessage,
      image: '',
      imageUrl: '',
    });

    try {
      const response = await axiosInstanceMessage.post('/', message);
      setMessages([...messages, response.data]);
      setnewMessage('');
    } catch (error) {
      console.error(error);
    }

    if (vendor._id) {
      getConversation();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


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
      const data = { chatId, senderId: vendor?._id }
      await axiosInstanceMessage.patch('/changeIsRead', data, { withCredentials: true })

    } catch (error) {
      console.error(error);

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
          <div className="flex items-center">

            <h1 className="text-xl font-semibold">Chat</h1>
          </div>
          <div className="flex items-center" onClick={() => navigate(`${VENDOR.PROFILE}`)}>
            <Avatar
              src={vendor?.imageUrl || "/default-avatar.png"}
              alt={vendor?.name}
              size="md"
              className={`rounded-full border-2 border-green-500`}
            />
            <span className="ml-2 text-sm font-medium hidden sm:inline">{vendor?.name}</span>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List */}
          <div className="w-full sm:w-72 md:w-80 border-r bg-white overflow-y-auto hidden sm:block">
            <div className="p-4">
            <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Search className="text-gray-400" size={20} />}
                  className="w-full"
                />
              </div>
              {filteredConversations.length === 0 ? (
                <>
                  <div className="flex justify-center mb-4">
                    {debouncedQuery ? (
                      <p className="text-center text-gray-500">No matching users found</p>
                    ) : (
                      <Loader className="text-gray-500" />
                    )}
                  </div>
                  {!debouncedQuery && <p className="text-center text-gray-500">No conversations found</p>}
                </>
              ) : (

                <div className="space-y-2">
                  {filteredConversations.map(conv => (
                    <div
                      onClick={() => {
                        handleConversationSelect(conv);
                        changeIsRead(conv._id);
                      }}
                    >
                      <ChatListVendor
                        conversation={conv}
                        currentUser={vendor}
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
                      src={user?.imageUrl || "/default-avatar.png"}
                    />
                    <div>
                      <h3 className="font-medium">{user ? user?.name : ''}</h3>
                      <p className="text-sm text-gray-500">
                        {activeUsers.some(
                          (u) => u.clientId === receiverId
                        ) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* <Button isIconOnly variant="light">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button isIconOnly variant="light">
                      <Video className="h-5 w-5" />
                    </Button> */}
                    <Button isIconOnly variant="light" onClick={()=>setCurrentChat(null)}>
                      <BackspaceIcon className="h-5 w-5" />
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
                          time={msg.createdAt}
                          isOwnMessage={msg.senderId === vendor?._id}
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
                      onKeyDown={handleKeyDown}
                    />
                    <Button
                      className="bg-black text-white rounded-md px-4 py-2"
                      onClick={sendMessage}
                      type='button'
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