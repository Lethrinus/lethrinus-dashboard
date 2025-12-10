import React, { useState } from 'react';
import { api } from '../services/api';
import { ThemeMode, AccentColor, AiConfig } from '../types';
import { Moon, Sun, Key, Bot, Shield, CheckCircle } from 'lucide-react';

interface SettingsProps {
  currentTheme: ThemeMode;
  currentAccent: AccentColor;
  onUpdate: (theme: ThemeMode, accent: AccentColor) => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ currentTheme, currentAccent, onUpdate }) => {
  const [theme, setTheme] = useState(currentTheme);
  const [accent, setAccent] = useState(currentAccent);
  
  const [aiConfig, setAiConfig] = useState<AiConfig>({
    geminiKey: '',
    openaiKey: '',
    anthropicKey: '',
    preferredModel: 'gemini'
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial settings
  React.useEffect(() => {
    const loadSettings = async () => {
      const session = await api.getSession();
      setAiConfig(session.aiConfig);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const colors: AccentColor[] = ['blue', 'indigo', 'violet', 'rose', 'amber', 'emerald'];

  const handleSave = async () => {
    await api.updateSettings(theme, accent);
    await api.updateAiConfig(aiConfig);
    onUpdate(theme, accent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">System Preferences</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Appearance Section */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <Sun size={20} className="text-slate-500" />
            Appearance
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? `border-${accent}-500 bg-${accent}-50 dark:bg-${accent}-900/20 shadow-md` : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
            >
              <Sun size={24} className={theme === 'light' ? `text-${accent}-600` : 'text-slate-400'} />
              <span className="font-medium text-slate-900 dark:text-white">Light Mode</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? `border-${accent}-500 bg-${accent}-50 dark:bg-${accent}-900/20 shadow-md` : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
            >
              <Moon size={24} className={theme === 'dark' ? `text-${accent}-600` : 'text-slate-400'} />
              <span className="font-medium text-slate-900 dark:text-white">Dark Mode</span>
            </button>
          </div>

          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Accent Color</h3>
          <div className="flex flex-wrap gap-4">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={`w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center bg-${c}-500 ${accent === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
              >
                {accent === c && <CheckCircle size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </section>

        {/* AI Configuration Section */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <Bot size={20} className={`text-${accent}-500`} />
            AI & Integrations
          </h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
               <div className="flex items-start gap-3">
                 <Shield size={20} className="text-slate-500 mt-0.5" />
                 <div>
                   <h4 className="font-medium text-slate-900 dark:text-white text-sm">Privacy Note</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                     Your API keys are stored locally in your browser and are never sent to our servers. They are only used to communicate directly with the AI providers.
                   </p>
                 </div>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default Model</label>
              <select 
                value={aiConfig.preferredModel}
                onChange={(e) => setAiConfig({...aiConfig, preferredModel: e.target.value as any})}
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="gemini">Google Gemini (Recommended)</option>
                <option value="gpt4">OpenAI GPT-4</option>
                <option value="claude">Anthropic Claude</option>
              </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>Google Gemini API Key</span>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className={`text-xs text-${accent}-600 hover:underline`}>Get Key &rarr;</a>
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="password" 
                    value={aiConfig.geminiKey}
                    onChange={(e) => setAiConfig({...aiConfig, geminiKey: e.target.value})}
                    placeholder="AIza..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">OpenAI API Key</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="password" 
                    value={aiConfig.openaiKey}
                    onChange={(e) => setAiConfig({...aiConfig, openaiKey: e.target.value})}
                    placeholder="sk-..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Anthropic API Key</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="password" 
                    value={aiConfig.anthropicKey}
                    onChange={(e) => setAiConfig({...aiConfig, anthropicKey: e.target.value})}
                    placeholder="sk-ant-..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Save Bar */}
        <div className="fixed bottom-6 left-0 right-0 px-6 pointer-events-none flex justify-center">
          <button 
            onClick={handleSave}
            className={`pointer-events-auto px-8 py-3 bg-${accent}-600 text-white rounded-full font-medium shadow-lg shadow-${accent}-500/30 hover:bg-${accent}-700 hover:scale-105 transition-all flex items-center gap-2`}
          >
            {isSaved ? <CheckCircle size={20} /> : null}
            {isSaved ? 'Preferences Saved' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};