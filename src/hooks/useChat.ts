import { useState } from 'react';

export interface ChatMessage {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  message: string;
  timestamp: string | number;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('terrawatch_token');
      if (!token) return;
      const response = await fetch('/api/chat/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to retrieve chat logs:', e);
    }
  };

  const sendMessage = async (messageText: string) => {
    setLoading(true);
    // Optimistic user update
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      message: messageText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const token = localStorage.getItem('terrawatch_token');
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });
      if (response.ok) {
        const data = await response.json(); // Returns assistant response message object
        setMessages(prev => {
          // Replace user optimistic message with the database saved version, and append assistant
          const filtered = prev.filter(m => m.id !== userMsg.id);
          return [...filtered, {
            id: userMsg.id === `temp-${Date.now()}` ? Date.now() : `user-${Date.now()}`,
            role: 'user',
            message: messageText,
            timestamp: Date.now()
          }, {
            id: data.id || `assistant-${Date.now()}`,
            role: 'assistant',
            message: data.message,
            timestamp: data.createdAt || Date.now()
          }];
        });
      }
    } catch (e) {
      console.error('Failed to post interactive coordinator transmission:', e);
    } finally {
      setLoading(false);
      fetchHistory(); // Sync fully to ensure matching IDs and database ordering
    }
  };

  const purgeHistory = async () => {
    try {
      const token = localStorage.getItem('terrawatch_token');
      const response = await fetch('/api/chat/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return { messages, loading, fetchHistory, sendMessage, purgeHistory };
}
