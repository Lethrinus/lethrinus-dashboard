// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Settings.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { ThemeMode, AccentColor, AiConfig } from '../types';
import {
    Moon,
    Sun,
    Key,
    Bot,
    Shield,
    CheckCircle,
    Settings,
    Sparkles,
    ExternalLink,
    Palette,
    SnailIcon
} from 'lucide-react';
import { SpotlightCard, CardHover, Skeleton } from './Animations';

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
    preferredModel: 'gemini',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const session = await api.getSession();
      setAiConfig(session.aiConfig);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    await api.updateSettings(theme, accent);
    await api.updateAiConfig(aiConfig);
    onUpdate(theme, accent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 max-w-7xl mx-auto pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-5 mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.div
          className="p-2.5 rounded-xl bg-white-500/20 text-white-400"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
        >
          <Settings size={24} />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-white">System Preferences</h1>
          <p className="text-xs text-slate-500">Customize your experience</p>
        </div>
      </motion.div>



        {/* AI Configuration Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SpotlightCard className="p-6">
            <h2 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <SnailIcon size={20} className="text-white-500" />
              AI & Integrations
            </h2>

            {/* Privacy Note */}
            <motion.div
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-400 text-sm">Privacy Note</h4>
                  <p className="text-xs text-emerald-500/70 mt-1">
                    Your API keys are stored locally in your browser and are never sent to our servers.
                    They are only used to communicate directly with the AI providers.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Default Model */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Default AI Model
              </label>
              <select
                value={aiConfig.preferredModel}
                onChange={e => setAiConfig({ ...aiConfig, preferredModel: e.target.value as AiConfig['preferredModel'] })}
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-2 focus:ring-white-500/50 outline-none transition-all"
              >
                <option value="gemini">Google Gemini (Recommended)</option>
                <option value="gpt4">OpenAI GPT-4</option>
                <option value="claude">Anthropic Claude</option>
              </select>
            </div>

            {/* API Keys */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              {/* Gemini */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles size={12} className="text-blue-400" />
                    Google Gemini API Key
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white-400 hover:text-white-300 flex items-center gap-1"
                  >
                    Get Key <ExternalLink size={10} />
                  </a>
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={aiConfig.geminiKey}
                    onChange={e => setAiConfig({ ...aiConfig, geminiKey: e.target.value })}
                    placeholder="AIza..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-2 focus:ring-white-500/50 outline-none font-mono text-sm transition-all"
                  />
                </div>
              </div>

              {/* OpenAI */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sparkles size={12} className="text-emerald-400" />
                  OpenAI API Key
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={aiConfig.openaiKey}
                    onChange={e => setAiConfig({ ...aiConfig, openaiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-2 focus:ring-white-500/50 outline-none font-mono text-sm transition-all"
                  />
                </div>
              </div>

              {/* Anthropic */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-400" />
                  Anthropic API Key
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={aiConfig.anthropicKey}
                    onChange={e => setAiConfig({ ...aiConfig, anthropicKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-2 focus:ring-white-500/50 outline-none font-mono text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>


      {/* Save Button - Fixed at Bottom */}
      <motion.div
        className="fixed bottom-6 left-0 right-0 px-6 pointer-events-none flex justify-center z-50"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={handleSave}
          className="pointer-events-auto px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-white-500 hover:to-white-600 text-white rounded-full font-bold shadow-lg shadow-black-500/30 transition-all flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isSaved ? (
              <motion.div
                key="saved"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Preferences Saved
              </motion.div>
            ) : (
              <motion.div
                key="save"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                Save Changes
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

