'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Send, MessageSquare, Archive } from 'lucide-react';

interface Message {
  id: string;
  threadId: string;
  sender: string;
  senderAvatar?: string;
  content: string;
  sentAt: string;
  read: boolean;
}

interface Thread {
  id: string;
  participantName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'archived';
}

// Mock data for demo
const mockThreads: Thread[] = [
  {
    id: 'thread-1',
    participantName: 'John Smith',
    lastMessage: 'We can proceed with the shipment',
    lastMessageTime: '2 hours ago',
    unreadCount: 2,
    status: 'active',
  },
  {
    id: 'thread-2',
    participantName: 'Sarah Johnson',
    lastMessage: 'Please confirm the delivery time',
    lastMessageTime: '1 day ago',
    unreadCount: 0,
    status: 'active',
  },
  {
    id: 'thread-3',
    participantName: 'Mike Davis',
    lastMessage: 'Invoice has been sent',
    lastMessageTime: '3 days ago',
    unreadCount: 0,
    status: 'active',
  },
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    sender: 'John Smith',
    content: 'Hi, we need to schedule pickup for load #12345',
    sentAt: '10:30 AM',
    read: true,
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    sender: 'You',
    content: 'Sure, I can arrange pickup tomorrow morning',
    sentAt: '10:45 AM',
    read: true,
  },
  {
    id: 'msg-3',
    threadId: 'thread-1',
    sender: 'John Smith',
    content: 'We can proceed with the shipment',
    sentAt: '2 hours ago',
    read: false,
  },
];

export default function CommunicationCenter() {
  const [selectedThreadId, setSelectedThreadId] = useState<string>(
    mockThreads[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');

  const selectedThread = mockThreads.find((t) => t.id === selectedThreadId);
  const threadMessages = mockMessages.filter(
    (m) => m.threadId === selectedThreadId
  );
  const filteredThreads = mockThreads.filter(
    (t) =>
      t.status === (activeTab === 'archived' ? 'archived' : 'active') &&
      t.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Send message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Communication Center</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="inbox">Inbox ({mockThreads.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent
          value="inbox"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Thread List */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="p-4 border-b">
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No conversations found
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition ${
                      selectedThreadId === thread.id
                        ? 'bg-blue-50 border-l-2 border-blue-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900">
                        {thread.participantName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {thread.lastMessageTime}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 truncate line-clamp-2">
                      {thread.lastMessage}
                    </p>
                    {thread.unreadCount > 0 && (
                      <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                        {thread.unreadCount} new
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 border rounded-lg overflow-hidden flex flex-col bg-white">
            {selectedThread ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">
                        {selectedThread.participantName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Last message {selectedThread.lastMessageTime}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {threadMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'You'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender === 'You'
                              ? 'text-blue-100'
                              : 'text-slate-500'
                          }`}
                        >
                          {msg.sentAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-slate-50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <MessageSquare className="w-12 h-12 mb-4 text-slate-300" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sent" className="py-12 text-center text-slate-500">
          <p>Your sent messages appear here</p>
        </TabsContent>

        <TabsContent
          value="archived"
          className="py-12 text-center text-slate-500"
        >
          <p>Archived conversations appear here</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
