/**
 * useChatPagination - Custom hook for paginated message loading
 * Loads older messages when user scrolls to top
 */
import { useState, useCallback, useRef } from 'react';
import { messageService } from '../services/api';

export const useChatPagination = (matchId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  const pageRef = useRef(1);
  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);

  // Initial load
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await messageService.getMessages(matchId, 1, 50);
      const msgs = response?.messages || response?.data?.messages || response?.data || [];
      
      setMessages(Array.isArray(msgs) ? msgs : []); // Backend returns chronological order
      pageRef.current = 1;
      
      // Check if there are more messages
      const pagination = response?.pagination || response?.data?.pagination || {};
      setHasMore(pagination.hasMore || pagination.pages > 1);
      
      // Scroll to bottom after initial load
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // Load more (older messages - scroll up)
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = pageRef.current + 1;
      
      const response = await messageService.getMessages(matchId, nextPage, 50);
      const olderMessages = response?.messages || response?.data?.messages || response?.data || [];
      
      if (olderMessages.length > 0) {
        // Save current scroll position
        const container = messagesStartRef.current?.parentElement;
        const oldScrollHeight = container?.scrollHeight || 0;
        const oldScrollTop = container?.scrollTop || 0;
        
        // Prepend older messages (already chronological from API)
        setMessages(prev => [...olderMessages, ...prev]);
        pageRef.current = nextPage;
        
        // Restore scroll position (keep user at same position)
        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
          }
        }, 50);
      }
      
      // Check if more pages exist
      const pagination = response?.pagination || response?.data?.pagination || {};
      setHasMore(pagination.hasMore !== false && pagination.pages > nextPage);
      
    } catch {
      // Silent failure for pagination
    } finally {
      setLoadingMore(false);
    }
  }, [matchId, hasMore, loadingMore]);

  // Add new message (optimistic or real-time)
  const addMessage = useCallback((newMessage) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(m => m._id === newMessage._id)) {
        return prev;
      }
      return [...prev, newMessage];
    });
  }, []);

  // Update message status (for read receipts)
  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages(prev => 
      prev.map(msg => 
        msg._id === messageId ? { ...msg, status } : msg
      )
    );
  }, []);

  // Handle scroll to detect need for older messages
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // User scrolled near top - load more messages
    if (scrollTop < 100 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
  }, [hasMore, loadingMore, loadMoreMessages]);

  // Clear messages (on leave chat)
  const clearMessages = useCallback(() => {
    setMessages([]);
    pageRef.current = 1;
    setHasMore(true);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    pageRef,
    messagesEndRef,
    messagesStartRef,
    fetchMessages,
    loadMoreMessages,
    addMessage,
    updateMessageStatus,
    handleScroll,
    clearMessages
  };
};

export default useChatPagination;