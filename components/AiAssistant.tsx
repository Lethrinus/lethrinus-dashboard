import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { ChatMessage, AccentColor, AiConfig } from '../types';
import { Send, Bot, User, RefreshCw, Sparkles, Trash2, StopCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AiAssistantProps {
  accent: AccentColor;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ accent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AiConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const session = await api.getSession();
      setConfig(session.aiConfig);
      // Add welcome message
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: "Hello! I'm your personal AI assistant. I can help you plan your day, draft journal entries, or answer questions. How can I help you today?",
        timestamp: Date.now()
      }]);
    };
    loadConfig();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !config) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';

      if (config.preferredModel === 'gemini' && config.geminiKey) {
        // Use Google GenAI
        const ai = new GoogleGenAI({ apiKey: config.geminiKey });
        
        // Contextual awareness prompt
        const systemPrompt = `You are a helpful assistant embedded in a personal dashboard app called LifeOS. 
        Help the user with productivity, planning, and organizing. 
        Keep responses concise and formatted nicely with Markdown.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: input,
          config: {
            systemInstruction: systemPrompt
          }
        });

        responseText = response.text || "I couldn't generate a response.";

      } else if (config.preferredModel === 'gpt4' && config.openaiKey) {
        // Placeholder for OpenAI implementation
        // In a real implementation, you would use fetch to call OpenAI API
        await new Promise(r => setTimeout(r, 1000));
        responseText = "OpenAI integration is configured but the client logic is currently a placeholder. Please use Gemini for the live demo.";
      } else if (config.preferredModel === 'claude' && config.anthropicKey) {
        // Placeholder for Anthropic implementation
        await new Promise(r => setTimeout(r, 1000));
        responseText = "Anthropic integration is configured but the client logic is currently a placeholder. Please use Gemini for the live demo.";
      } else {
        responseText = "Please configure your API Key in Settings > AI & Integrations to start using the assistant.";
      }

      // 2. Add AI Response
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Error: ${error.message || "Failed to connect to AI provider"}. Please check your API key.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: "Chat cleared. How can I help you now?",
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white dark:bg-slate-900 shadow-sm md:rounded-2xl md:my-6 md:border md:border-slate-200 md:dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${accent}-100 dark:bg-${accent}-900/30 text-${accent}-600 dark:text-${accent}-400`}>
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">AI Assistant</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by {config?.preferredModel === 'gemini' ? 'Gemini 2.5' : config?.preferredModel === 'gpt4' ? 'GPT-4' : 'Claude'}
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
          title="Clear Chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-950/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
              ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : `bg-${accent}-600 text-white`}
            `}>
              {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
            </div>
            
            <div className={`
              max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tr-none' 
                : `bg-${accent}-50 dark:bg-${accent}-900/10 text-slate-800 dark:text-slate-200 border border-${accent}-100 dark:border-${accent}-800 rounded-tl-none`}
            `}>
              {/* Simple Markdown rendering replacement for whitespace */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-${accent}-600 text-white mt-1`}>
              <Sparkles size={16} />
            </div>
            <div className={`bg-${accent}-50 dark:bg-${accent}-900/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2`}>
              <div className={`w-2 h-2 bg-${accent}-400 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
              <div className={`w-2 h-2 bg-${accent}-400 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
              <div className={`w-2 h-2 bg-${accent}-400 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={!config?.geminiKey && !config?.openaiKey && !config?.anthropicKey ? "Configure API Key in Settings first..." : "Ask anything..."}
            disabled={isLoading}
            className="w-full pl-6 pr-14 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950 border focus:border-indigo-500 outline-none transition-all shadow-inner text-slate-900 dark:text-white disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`
              absolute right-2 p-2 rounded-lg transition-all
              ${isLoading || !input.trim() 
                ? 'text-slate-400 bg-transparent' 
                : `text-white bg-${accent}-600 hover:bg-${accent}-700 shadow-md`}
            `}
          >
            {isLoading ? <StopCircle size={20} className="animate-pulse" /> : <Send size={20} />}
          </button>
        </div>
        <div className="text-center mt-2 text-xs text-slate-400">
          AI can make mistakes. Verify important information.
        </div>
      </div>
    </div>
  );
};