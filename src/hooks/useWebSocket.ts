import { useEffect, useRef, useState } from 'react';
import { translateText } from '../utils/translator';

interface Message {
  type: 'message' | 'join' | 'leave';
  id: string;
  text: string;
  translatedText?: string;
  userId: string;
  timestamp: string;
  language: string;
}

export function useWebSocket(roomId: string, userId: string, userLanguage: string) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`wss://demo.piesocket.com/v3/${roomId}?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV`);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          const message = data as Message;
          
          // Don't process own messages received from WebSocket
          if (message.userId === userId) return;

          // Translate message if it's in a different language
          if (message.language !== userLanguage) {
            const translatedText = await translateText(
              message.text,
              message.language,
              userLanguage
            );
            message.translatedText = translatedText;
          }

          setMessages(prev => [...prev, message]);
        }
      } catch (error) {
        console.error('Failed to process message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId, userId, userLanguage]);

  const sendMessage = async (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    const message = {
      type: 'message',
      id: Date.now().toString(),
      text,
      userId,
      language: userLanguage,
      timestamp: new Date().toISOString()
    };

    try {
      wsRef.current.send(JSON.stringify(message));
      // Add own message to the list immediately
      setMessages(prev => [...prev, message]);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  return { isConnected, messages, sendMessage };
}