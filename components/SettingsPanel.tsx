'use client';

import React, { useState, useEffect } from 'react';
import { useBible } from '../lib/context/BibleContext';
import { GlassCard, GlassButton, GlassInput } from './ui';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { state, setTranslationMode } = useBible();
  const [localSettings, setLocalSettings] = useState({
    fontSize: 16,
    theme: 'dark',
    translationMode: state.translationMode,
    showWordTooltips: true,
    autoTranslate: false
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bible-app-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setLocalSettings(parsed);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('bible-app-settings', JSON.stringify(localSettings));
    setTranslationMode(localSettings.translationMode);
  }, [localSettings]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 16,
      theme: 'dark',
      translationMode: 'verse' as const,
      showWordTooltips: true,
      autoTranslate: false
    };
    setLocalSettings(defaultSettings);
    localStorage.setItem('bible-app-settings', JSON.stringify(defaultSettings));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-semibold text-white mb-4">Configuración</h2>
        
        <div className="space-y-4">
          {/* Font Size */}
          <div>
            <label className="block text-sm text-white/80 mb-2">
              Tamaño de Fuente: {localSettings.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={localSettings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: 'linear-gradient(to right, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) 100%)',
                backgroundSize: '100% 100%'
              }}
            />
            <style jsx>{`
              .slider::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6366f1, #4f46e5);
                border: 2px solid white;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              }
              
              .slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6366f1, #4f46e5);
                border: 2px solid white;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              }
            `}</style>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm text-white/80 mb-2">Tema</label>
            <div className="flex gap-2">
              <GlassButton
                onClick={() => handleSettingChange('theme', 'dark')}
                className={localSettings.theme === 'dark' ? 'ring-2 ring-white/50' : ''}
              >
                Oscuro
              </GlassButton>
              <GlassButton
                onClick={() => handleSettingChange('theme', 'light')}
                className={localSettings.theme === 'light' ? 'ring-2 ring-white/50' : ''}
              >
                Claro
              </GlassButton>
            </div>
          </div>

          {/* Translation Mode */}
          <div>
            <label className="block text-sm text-white/80 mb-2">Modo de Traducción</label>
            <div className="flex gap-2">
              <GlassButton
                onClick={() => handleSettingChange('translationMode', 'verse')}
                className={localSettings.translationMode === 'verse' ? 'ring-2 ring-white/50' : ''}
              >
                Versículo
              </GlassButton>
              <GlassButton
                onClick={() => handleSettingChange('translationMode', 'word')}
                className={localSettings.translationMode === 'word' ? 'ring-2 ring-white/50' : ''}
              >
                Palabra
              </GlassButton>
            </div>
          </div>

          {/* Word Tooltips */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-white/80">Mostrar tooltips de palabras</label>
            <input
              type="checkbox"
              checked={localSettings.showWordTooltips}
              onChange={(e) => handleSettingChange('showWordTooltips', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
            />
          </div>

          {/* Auto Translate */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-white/80">Traducir automáticamente</label>
            <input
              type="checkbox"
              checked={localSettings.autoTranslate}
              onChange={(e) => handleSettingChange('autoTranslate', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
            />
          </div>

          {/* Reset Settings */}
          <div className="flex gap-2">
            <GlassButton onClick={resetSettings} className="flex-1">
              Restablecer Configuración
            </GlassButton>
            <GlassButton onClick={onClose} className="flex-1">
              Guardar y Cerrar
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};