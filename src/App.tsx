import React, { useEffect, useState } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { RoomJoin } from './components/RoomJoin';
import { generateRoomId, generateUserId } from './utils/roomUtils';
import { useChatStore } from './store/chatStore';
import { supabase } from './lib/supabase';
import { translateText } from './utils/translator';
import { MessageCircle, Share2 } from 'lucide-react';

function App() {
  const { roomId, userId, messages, setRoom, setUser, fetchMessages, sendMessage, addMessage } = useChatStore();
  const [userLanguage, setUserLanguage] = useState(() => 
    localStorage.getItem('userLanguage') || 'en'
  );
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    // Set up user ID if not exists
    if (!userId) {
      const newUserId = generateUserId();
      setUser(newUserId);
    }

    // Subscribe to new messages
    const channel = supabase.channel('messages')
      .on('broadcast', { event: 'new_message' }, async ({ payload }) => {
        if (payload.user_id !== userId && payload.room_id === roomId) {
          // Translate message if needed
          if (payload.language !== userLanguage) {
            const translatedText = await translateText(
              payload.text,
              payload.language,
              userLanguage
            );
            payload.translated_text = translatedText;
          }
          addMessage(payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, roomId, userLanguage]);

  useEffect(() => {
    localStorage.setItem('userLanguage', userLanguage);
  }, [userLanguage]);

  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId);
    }
  }, [roomId]);

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoom(newRoomId);
  };

  const handleJoinRoom = (id: string) => {
    setRoom(id);
  };

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(text, userLanguage);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomId || '');
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <RoomJoin onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
                Multilingual Chat
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Room: {roomId}</span>
                <button
                  onClick={copyRoomLink}
                  className="text-indigo-500 hover:text-indigo-600 transition-colors"
                  title="Copy room code"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {showCopied && (
                  <span className="text-sm text-green-600">Copied!</span>
                )}
              </div>
            </div>
          </div>
          <LanguageSelector
            selectedLanguage={userLanguage}
            onLanguageChange={setUserLanguage}
          />
        </div>

        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 mb-4 h-[600px] overflow-y-auto flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Start a conversation in your preferred language!</p>
            </div>
          ) : (
            messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message.translated_text || message.text}
                isCurrentUser={message.user_id === userId}
                timestamp={new Date(message.created_at).toLocaleTimeString()}
              />
            ))
          )}
        </div>

        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

export default App;