import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { messageService } from '../services/messageService';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const ChatRoom = () => {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const [newMessages, setNewMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const myId = user?.id;

  // React Query fetches history once — no duplicate calls
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['messages', doctorId],
    queryFn: () => messageService.getMessages(doctorId),
    enabled: !!doctorId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // All messages = history + real-time new ones
  const messages = [...history, ...newMessages];

  // Socket setup — runs once per doctorId change
  useEffect(() => {
    if (!myId) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('user_connected', myId);
    });

    socket.on('receive_message', (data) => {
      // Only append real-time messages from the other party in this chat
      if (data.senderId === doctorId || data.receiverId === doctorId) {
        setNewMessages((prev) => {
          // Avoid duplicates (message we sent is already in state via handleSend)
          if (prev.some((m) => m.id === data.id)) return prev;
          if (history.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    });

    socket.on('connect_error', () => {
      // Silent fail — messages still persist via API
    });

    return () => {
      socket.disconnect();
    };
    // history is intentionally excluded — we only need the ref for dup check on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, myId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const optimistic = {
      id: `temp_${Date.now()}`,
      senderId: myId,
      receiverId: doctorId,
      content: input.trim(),
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setNewMessages((prev) => [...prev, optimistic]);
    setInput('');

    try {
      const saved = await messageService.sendMessage({
        receiverId: doctorId,
        content: optimistic.content,
      });

      // Replace optimistic with persisted message
      setNewMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m))
      );

      // Emit via socket for real-time delivery to receiver
      socketRef.current?.emit('send_message', saved);
    } catch {
      // Remove optimistic on failure and restore input
      setNewMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(optimistic.content);
      toast.error('Message failed to send. Try again.');
    } finally {
      setSending(false);
    }
  }, [input, sending, myId, doctorId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-3xl mx-auto bg-white/5 rounded-xl border border-white/20 flex flex-col h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="text-lg font-semibold text-white">Chat with Doctor</h2>
          <Link to="/patient/chat" className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
            ← Back
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === myId;
              return (
                <div
                  key={m.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      isMine
                        ? `bg-purple-600 text-white rounded-br-sm ${m._optimistic ? 'opacity-70' : ''}`
                        : 'bg-white/10 text-white rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                    <div className={`text-xs mt-1 ${isMine ? 'text-purple-300' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {m._optimistic && ' · Sending...'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Type a message... (Enter to send)"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
