import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  room_id: string;
  user_id: string;
  text: string;
  translated_text?: string;
  language: string;
  created_at: string;
}

interface ChatState {
  roomId: string | null;
  userId: string | null;
  messages: Message[];
  setRoom: (roomId: string) => void;
  setUser: (userId: string) => void;
  addMessage: (message: Message) => void;
  fetchMessages: (roomId: string) => Promise<void>;
  sendMessage: (text: string, language: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      roomId: null,
      userId: null,
      messages: [],
      
      setRoom: (roomId) => set({ roomId }),
      setUser: (userId) => set({ userId }),
      
      addMessage: (message) => 
        set((state) => ({
          messages: [...state.messages, message]
        })),

      fetchMessages: async (roomId) => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        set({ messages: data || [] });
      },

      sendMessage: async (text: string, language: string) => {
        const { roomId, userId } = get();
        if (!roomId || !userId) return;

        const message = {
          room_id: roomId,
          user_id: userId,
          text,
          language,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('messages')
          .insert([message])
          .select()
          .single();

        if (error) {
          console.error('Error sending message:', error);
          return;
        }

        // Broadcast the message through Supabase realtime
        await supabase.channel('messages').send({
          type: 'broadcast',
          event: 'new_message',
          payload: data,
        });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ roomId: state.roomId, userId: state.userId }),
    }
  )
);