import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../utils/api';
import { FiMessageSquare, FiSend, FiLoader, FiX, FiUser, FiCpu } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const AIChatbot = ({ slide, deck, isOpen, onToggle }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = slide 
        ? `Hi! I'm here to help with your "${slide.title}" slide. Ask me to improve the content, generate speaker notes, or anything else!`
        : `Hi! I'm your pitch deck assistant. Select a slide and I'll help you improve it!`;

      setMessages([{
        id: 'welcome',
        type: 'ai',
        content: welcomeMsg,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, slide?.id]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    // Add user message
    const userMessage = {
      id: Date.now() + '-user',
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // ✅ SIMPLE: Just send the data directly to match backend
      const response = await aiAPI.aiAssistant({
        message: inputMessage.trim(),
        slideTitle: slide?.title || '',
        slideContent: slide?.content || '',
        context: deck?.title || 'Pitch deck presentation'
        // No assistType - let backend auto-detect
      });

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + '-ai',
          type: 'ai',
          content: response.data.data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.error || 'AI assistant failed');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + '-error',
        type: 'ai',
        content: `Sorry, I'm having trouble right now. Please try again.`,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('AI assistant is temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FiMessageSquare className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">
              {slide ? `Editing: ${slide.title}` : 'Ready to help!'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === 'user' 
                ? 'bg-blue-100 text-blue-600' 
                : message.isError 
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {message.type === 'user' ? <FiUser className="h-4 w-4" /> : <FiCpu className="h-4 w-4" />}
            </div>
            
            <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-lg max-w-xs text-sm ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isError
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-gray-50 text-gray-700'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
              
              <div className={`text-xs text-gray-400 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
              <FiCpu className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {slide && (
        <div className="border-t border-gray-100 p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setInputMessage('Improve this slide content')}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left"
              disabled={loading}
            >
              💡 Improve content
            </button>
            <button
              onClick={() => setInputMessage('Generate speaker notes')}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left"
              disabled={loading}
            >
              📝 Speaker notes
            </button>
            <button
              onClick={() => setInputMessage('Make this more concise')}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left"
              disabled={loading}
            >
              ✂️ Make concise
            </button>
            <button
              onClick={() => setInputMessage('Add more details')}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left"
              disabled={loading}
            >
              📊 Add details
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={slide 
              ? "How can I improve this slide?" 
              : "Ask me about your pitch deck..."}
            className="flex-1 resize-none border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || loading}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <FiLoader className="h-4 w-4 animate-spin" />
            ) : (
              <FiSend className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;