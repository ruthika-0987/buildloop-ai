import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import { speakText, stopSpeaking, startVoiceRecognition } from '../lib/speech';
import { useTranslation } from '../i18n';

interface VoiceAssistantProps {
  currentContextDescription?: string;
  onFilterChange?: (query: string) => void;
}

export const VoiceAssistantBar: React.FC<VoiceAssistantProps> = ({
  currentContextDescription,
  onFilterChange,
}) => {
  const { currentLanguage } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState<{ stop: () => void } | null>(null);
  const [showHelper, setShowHelper] = useState(false);

  // Friendly prompt texts per language
  const getGreeting = () => {
    switch (currentLanguage) {
      case 'te':
        return 'హలో! మీకు కావలసిన పదార్థం గురించి మాట్లాడండి లేదా వినండి.';
      case 'hi':
        return 'नमस्ते! अपनी आवश्यक निर्माण सामग्री बोलें या सुनें।';
      default:
        return 'Hello! Speak your material requirement or listen to guidance.';
    }
  };

  const handleToggleListen = () => {
    if (isListening) {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      setIsListening(false);
      return;
    }

    // Play quick audio chime / confirmation
    setIsListening(true);
    const rec = startVoiceRecognition(
      currentLanguage,
      (transcript) => {
        setLastSpokenText(transcript);
        setIsListening(false);
        // Announce recognized text back
        const confirmMsg =
          currentLanguage === 'te'
            ? `మీరు కోరినది: ${transcript}. వెతుకుతున్నాము...`
            : currentLanguage === 'hi'
            ? `आपने कहा: ${transcript}. खोज रहे हैं...`
            : `You asked: ${transcript}. Searching...`;
        speakText(confirmMsg, currentLanguage);
        if (onFilterChange) {
          onFilterChange(transcript);
        }
      },
      (err) => {
        console.warn('Voice error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
    setRecognitionInstance(rec);
  };

  const handleSpeakCurrent = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const textToRead =
      currentContextDescription ||
      (currentLanguage === 'te'
        ? 'బిల్డ్‌లూప్ AI హైదరాబాద్ రీసైకిల్డ్ మెటీరియల్స్ ఇంజిన్. ఎర్ర ఇటుకలు, కాంక్రీట్, మరియు ఇసుక సురక్షితంగా కొనవచ్చు.'
        : currentLanguage === 'hi'
        ? 'बिल्डहूप AI हैदराबाद निर्माण सामग्री पुनर्चक्रण इंजन। उच्च गुणवत्ता वाली ईंटें और कंक्रीट उपलब्ध हैं।'
        : 'BuildLoop AI Hyderabad C&D Material Recovery Engine. Verified red bricks, concrete aggregate, and stone dust with buyer protection.');

    setIsSpeaking(true);
    speakText(textToRead, currentLanguage);

    // reset speaking state after estimated duration
    const words = textToRead.split(' ').length;
    setTimeout(() => {
      setIsSpeaking(false);
    }, Math.max(3000, words * 400));
  };

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-3 sm:p-4 shadow-lg mb-6 border border-emerald-400/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Friendly Voice Avatar & Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={handleToggleListen}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-md transition-all ${
                isListening
                  ? 'bg-red-500 animate-pulse ring-4 ring-red-300 text-white scale-110'
                  : 'bg-white text-emerald-700 hover:scale-105 hover:bg-emerald-50'
              }`}
              title="Click and speak / మాట్లాడండి / बोलिए"
            >
              {isListening ? <Mic className="w-6 h-6 animate-bounce" /> : <Mic className="w-6 h-6" />}
            </button>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                {currentLanguage === 'te' ? 'వాయిస్ సహాయకుడు' : currentLanguage === 'hi' ? 'आवाज सहायक' : 'Voice Assistant'}
              </span>
              <span className="text-[11px] text-emerald-100 font-medium">
                {isListening
                  ? (currentLanguage === 'te' ? 'వినబడుతోంది... మాట్లాడండి' : currentLanguage === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now')
                  : getGreeting()}
              </span>
            </div>
            {lastSpokenText && (
              <p className="text-xs font-semibold text-emerald-100 mt-0.5 bg-black/20 px-2 py-0.5 rounded-md inline-block">
                "{lastSpokenText}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Read Aloud Button & Quick Helpers */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleSpeakCurrent}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition ${
              isSpeaking
                ? 'bg-amber-400 text-stone-900 animate-pulse'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title="Read screen aloud / స్క్రీన్ చదవండి"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>
              {isSpeaking
                ? (currentLanguage === 'te' ? 'ఆపండి' : currentLanguage === 'hi' ? 'रोकें' : 'Stop')
                : (currentLanguage === 'te' ? '🔊 వినండి' : currentLanguage === 'hi' ? '🔊 सुनिए' : '🔊 Read Aloud')}
            </span>
          </button>

          <button
            onClick={() => setShowHelper(!showHelper)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1"
            title="Help / సహాయం"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">1-Tap Voice Help</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Tap Voice Phrases */}
      {showHelper && (
        <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-emerald-100 font-semibold">1-Tap Prompts:</span>
          {[
            { label: '🧱 Red Bricks / ఇటుకలు', text: 'Red Clay Bricks' },
            { label: '🏗️ Concrete / కాంక్రీట్', text: 'Recycled Concrete Aggregate' },
            { label: '🏜️ Sand / ఇసుక', text: 'Stone Dust M-Sand' },
            { label: '📍 Jubilee Hills', text: 'Jubilee Hills' },
            { label: '📍 Gachibowli', text: 'Gachibowli' },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLastSpokenText(chip.text);
                speakText(chip.text, currentLanguage);
                if (onFilterChange) onFilterChange(chip.text);
              }}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-emerald-50 text-[11px] font-medium transition"
            >
              {chip.label}
            </button>
          ))}
          <button
            onClick={() => setShowHelper(false)}
            className="ml-auto text-white/70 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
