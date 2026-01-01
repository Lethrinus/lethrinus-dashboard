// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\AiAssistant.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { ChatMessage, AccentColor, AiConfig } from '../types';
import { Send, Bot, User, Trash2, StopCircle, Sparkles, AlertCircle, Settings } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { SpotlightCard, Skeleton } from './Animations';
import { Link } from 'react-router-dom';

interface AiAssistantProps {
  accent: AccentColor;
}

const TypingIndicator = () => (
  <motion.div className="flex items-center gap-1.5 p-2">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-white-400 rounded-full"
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15,
        }}
      />
    ))}
  </motion.div>
);

export const AiAssistant: React.FC<AiAssistantProps> = ({ accent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const session = await api.getSession();
      setConfig(session.aiConfig);
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: "Hello! I'm your personal AI assistant. I can help you plan your day, draft journal entries, or answer questions. How can I help you today?",
          timestamp: Date.now(),
        },
      ]);
      setConfigLoading(false);
    };
    loadConfig();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !config) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';

      if (config.preferredModel === 'gemini' && config.geminiKey) {
        const ai = new GoogleGenAI({ apiKey: config.geminiKey });

        const systemPrompt = `You are a helpful assistant embedded in a personal dashboard app called LifeOS. 
        Help the user with productivity, planning, and organizing. 
        Keep responses concise and formatted nicely with Markdown.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: input,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        responseText = response.text || "I couldn't generate a response.";
      } else if (config.preferredModel === 'gpt4' && config.openaiKey) {
        await new Promise(r => setTimeout(r, 1000));
        responseText =
          'OpenAI integration is configured but the client logic is currently a placeholder. Please use Gemini for the live demo.';
      } else if (config.preferredModel === 'claude' && config.anthropicKey) {
        await new Promise(r => setTimeout(r, 1000));
        responseText =
          'Anthropic integration is configured but the client logic is currently a placeholder. Please use Gemini for the live demo.';
      } else {
        responseText = 'Please configure your API Key in Settings > AI & Integrations to start using the assistant.';
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('AI Error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Error: ${error.message || 'Failed to connect to AI provider'}. Please check your API key.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Chat cleared. How can I help you now?',
        timestamp: Date.now(),
      },
    ]);
  };

  const hasApiKey = config?.geminiKey || config?.openaiKey || config?.anthropicKey;

  return (
    <motion.div
      className="flex flex-col h-full max-w-5xl mx-auto bg-[#0a0a0c] md:rounded-2xl md:my-6 md:border md:border-white/10 overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <motion.div
        className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0c]/80 backdrop-blur-xl z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2.5 rounded-xl bg-gradient-to-br from-white-600 to-white-800 text-white shadow-lg shadow-white-500/30"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Bot size={24} />
          </motion.div>
          <div>
            <h2 className="font-bold text-white">Cortex AI</h2>
            <p className="text-xs text-slate-500">
              Powered by{' '}
              {config?.preferredModel === 'gemini'
                ? 'Gemini 2.5'
                : config?.preferredModel === 'gpt4'
                ? 'GPT-4'
                : 'Claude'}
            </p>
          </div>
        </div>
        <motion.button
          onClick={clearChat}
          className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors"
          title="Clear Chat"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={18} />
        </motion.button>
      </motion.div>

      {/* No API Key Warning */}
      <AnimatePresence>
        {!configLoading && !hasApiKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-amber-500/10 border-b border-amber-500/20"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-400" />
              <div className="flex-1">
                <p className="text-sm text-amber-300 font-medium">No API Key Configured</p>
                <p className="text-xs text-amber-400/70">
                  Add your API key in settings to start chatting with AI.
                </p>
              </div>
              <Link to="/settings">
                <motion.button
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings size={12} /> Configure
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050505]/50 custom-scrollbar">
        {configLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-3/4" />
            <Skeleton className="h-16 w-1/2 ml-auto" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <motion.div
                  className={`
                    w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${msg.role === 'user'
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-br from-white-600 to-white-800 shadow-lg shadow-white-500/20'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                >
                  {msg.role === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Sparkles size={16} className="text-white" />
                  )}
                </motion.div>

                <motion.div
                  className={`
                    max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg
                    ${msg.role === 'user'
                      ? 'bg-[#131316] text-slate-100 rounded-tr-sm border border-white/10'
                      : 'bg-white-500/10 text-slate-200 border border-white-500/20 rounded-tl-sm'
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-3"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-white-600 to-white-800 shadow-lg shadow-white-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="bg-white-500/10 border border-white-500/20 rounded-2xl rounded-tl-sm px-4">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        className="p-4 bg-[#0a0a0c] border-t border-white/5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={!hasApiKey ? 'Configure API Key in Settings first...' : 'Ask anything...'}
            disabled={isLoading || !hasApiKey}
            className="w-full pl-5 pr-14 py-4 rounded-xl bg-[#131316] border border-white/10 focus:border-white-500/50 focus:ring-2 focus:ring-white-500/20 outline-none transition-all shadow-inner text-white disabled:opacity-50 placeholder-slate-600"
          />
          <motion.button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !hasApiKey}
            className={`
              absolute right-2 p-2.5 rounded-lg transition-all
              ${isLoading || !input.trim() || !hasApiKey
                ? 'text-slate-600 bg-transparent'
                : 'text-white bg-gradient-to-r from-white-600 to-white-700 shadow-lg shadow-white-500/25 hover:from-white-500 hover:to-white-600'
              }
            `}
            whileHover={!isLoading && input.trim() && hasApiKey ? { scale: 1.05 } : {}}
            whileTap={!isLoading && input.trim() && hasApiKey ? { scale: 0.95 } : {}}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <StopCircle size={20} />
              </motion.div>
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
        <div className="text-center mt-3 text-xs text-slate-600">
          AI can make mistakes. Verify important information.
        </div>
      </motion.div>
    </motion.div>
  );
};

