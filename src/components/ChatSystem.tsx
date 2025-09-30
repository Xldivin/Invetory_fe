import * as React from "react";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage, Conversation } from '../types';

// Mock conversations and messages
const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: ['3', '4'], // Warehouse manager and Shop manager
    title: 'Stock Request Discussion',
    lastMessage: {
      id: '3',
      conversationId: '1',
      senderId: '4',
      senderName: 'Sarah Shop',
      message: 'Thanks, I\'ll check the new stock levels tomorrow.',
      timestamp: new Date('2024-03-15T16:45:00'),
      isRead: true
    },
    createdAt: new Date('2024-03-15T10:00:00'),
    updatedAt: new Date('2024-03-15T16:45:00')
  },
  {
    id: '2',
    participants: ['2', '3'],
    title: 'Warehouse Operations',
    lastMessage: {
      id: '5',
      conversationId: '2',
      senderId: '2',
      senderName: 'John Admin',
      message: 'Can you provide the monthly inventory report?',
      timestamp: new Date('2024-03-15T14:30:00'),
      isRead: false
    },
    createdAt: new Date('2024-03-14T09:00:00'),
    updatedAt: new Date('2024-03-15T14:30:00')
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    conversationId: '1',
    senderId: '4',
    senderName: 'Sarah Shop',
    message: 'Hi Mike, I need to request additional stock for the laptop computers. We\'re running low.',
    timestamp: new Date('2024-03-15T10:30:00'),
    isRead: true
  },
  {
    id: '2',
    conversationId: '1',
    senderId: '3',
    senderName: 'Mike Warehouse',
    message: 'Sure Sarah! How many units do you need? I can prepare them for pickup this afternoon.',
    timestamp: new Date('2024-03-15T10:45:00'),
    isRead: true
  },
  {
    id: '3',
    conversationId: '1',
    senderId: '4',
    senderName: 'Sarah Shop',
    message: 'I need about 15 units. Also, could you check if we have any of the new office chairs in stock?',
    timestamp: new Date('2024-03-15T11:00:00'),
    isRead: true
  },
  {
    id: '4',
    conversationId: '1',
    senderId: '3',
    senderName: 'Mike Warehouse',
    message: 'Perfect! I have 20 laptop units available and 8 office chairs. I\'ll prepare both items for you.',
    timestamp: new Date('2024-03-15T11:15:00'),
    isRead: true
  },
  {
    id: '5',
    conversationId: '1',
    senderId: '4',
    senderName: 'Sarah Shop',
    message: 'Thanks, I\'ll check the new stock levels tomorrow.',
    timestamp: new Date('2024-03-15T16:45:00'),
    isRead: true
  }
];

export function ChatSystem() {
  const { user, logActivity } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChat, setShowChat] = useState(false);

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = messages
    .filter(m => m.conversationId === selectedConversation)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSelectedConversation('');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      conversationId: selectedConversation,
      senderId: user?.id || '',
      senderName: user?.name || '',
      message: newMessage.trim(),
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    
    // Update conversation with last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation
        ? { ...conv, lastMessage: message, updatedAt: new Date() }
        : conv
    ));

    logActivity('message_sent', 'chat', { 
      conversationId: selectedConversation,
      messageLength: newMessage.length 
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getParticipantNames = (conversation: Conversation) => {
    // Mock user names - in real app, would lookup from user data
    const userNames: Record<string, string> = {
      '1': 'Super Admin',
      '2': 'John Admin',
      '3': 'Mike Warehouse',
      '4': 'Sarah Shop'
    };
    
    return conversation.participants
      .filter(p => p !== user?.id)
      .map(p => userNames[p] || 'Unknown')
      .join(', ');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="h-[600px] md:h-[700px] border rounded-lg overflow-hidden bg-card">
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className={`${showChat ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 border-r flex-col`}>
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg">Messages</h2>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                      selectedConversation === conversation.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getParticipantNames(conversation).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm truncate">{conversation.title}</p>
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {getParticipantNames(conversation)}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {conversation.lastMessage.message}
                          </p>
                        )}
                      </div>
                      {conversation.lastMessage && !conversation.lastMessage.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${showChat ? 'flex' : 'hidden sm:flex'} flex-1 flex-col`}>
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="sm:hidden"
                      onClick={handleBackToList}
                    >
                      ←
                    </Button>
                    <Avatar>
                      <AvatarFallback>
                        {getParticipantNames(currentConversation).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm">{currentConversation.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {getParticipantNames(currentConversation)}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      <Users className="w-3 h-3 mr-1" />
                      {currentConversation.participants.length}
                    </Badge>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {conversationMessages.map((message) => {
                      const isOwnMessage = message.senderId === user?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {message.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`rounded-lg p-3 ${
                              isOwnMessage 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage 
                                  ? 'text-primary-foreground/70' 
                                  : 'text-muted-foreground'
                              }`}>
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="hidden sm:flex">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-12"
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="hidden sm:flex absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3>Select a conversation</h3>
                  <p className="hidden sm:block">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}