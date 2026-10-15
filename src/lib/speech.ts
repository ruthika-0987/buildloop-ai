import { Language } from '../types';

/**
 * Global voice cache to solve asynchronous getVoices() behavior in browsers
 */
let cachedVoices: SpeechSynthesisVoice[] = [];
let currentAudioElement: HTMLAudioElement | null = null;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Expand technical abbreviations and symbols into natural, crystal-clear spoken words
 */
export function cleanTextForSpeech(rawText: string, lang: Language): string {
  if (!rawText) return '';
  let text = rawText;

  if (lang === 'en') {
    text = text
      .replace(/₹\s*([0-9,]+)/g, '$1 Rupees')
      .replace(/Rs\.?\s*([0-9,]+)/gi, '$1 Rupees')
      .replace(/\bC&D\b/gi, 'Construction and Demolition')
      .replace(/\bGHMC\b/gi, 'Hyderabad Municipal Corporation')
      .replace(/\bRCA\b/gi, 'Recycled Concrete Aggregate')
      .replace(/\bIS\s*3495\b/gi, 'Indian Standard 3495')
      .replace(/\bM-Sand\b/gi, 'Manufactured Sand')
      .replace(/\bkm\b/gi, ' kilometers')
      .replace(/\bMT\b/gi, ' metric tons')
      .replace(/\bpcs\b/gi, ' pieces')
      .replace(/\bsq\.?ft\b/gi, ' square feet')
      .replace(/\bL1\b/gi, 'Level 1 Visual')
      .replace(/\bL2\b/gi, 'Level 2 Evidence')
      .replace(/\bL3\b/gi, 'Level 3 Certified')
      .replace(/\bIoT\b/gi, 'Internet of Things')
      .replace(/[•\-_*~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } else if (lang === 'te') {
    text = text
      .replace(/₹\s*([0-9,]+)/g, '$1 రూపాయలు')
      .replace(/\bC&D\b/gi, 'భవన నిర్మాణ వ్యర్థాలు')
      .replace(/\bkm\b/gi, ' కిలోమీటర్లు')
      .replace(/[•\-_*~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } else if (lang === 'hi') {
    text = text
      .replace(/₹\s*([0-9,]+)/g, '$1 रुपये')
      .replace(/\bC&D\b/gi, 'निर्माण अपशिष्ट')
      .replace(/\bkm\b/gi, ' किलोमीटर')
      .replace(/[•\-_*~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return text;
}

/**
 * Audio subtitle listener for live captions on screen
 */
type CaptionListener = (caption: { text: string; lang: Language; isSpeaking: boolean }) => void;
const captionListeners = new Set<CaptionListener>();

export function subscribeToCaptions(listener: CaptionListener): () => void {
  captionListeners.add(listener);
  return () => captionListeners.delete(listener);
}

function notifyCaption(text: string, lang: Language, isSpeaking: boolean) {
  captionListeners.forEach((fn) => {
    try {
      fn({ text, lang, isSpeaking });
    } catch {}
  });
}

/**
 * Find the most intelligible, high-clarity voice for the given language
 */
function selectBestVoice(voices: SpeechSynthesisVoice[], lang: Language): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (lang === 'te') {
    // 1. Exact match for Telugu
    const teVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('te') ||
        v.name.toLowerCase().includes('telugu') ||
        v.name.toLowerCase().includes('తెలుగు')
    );
    if (teVoice) return teVoice;
  }

  if (lang === 'hi') {
    const hiVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('हिन्दी')
    );
    if (hiVoice) return hiVoice;
  }

  if (lang === 'en') {
    // Prioritize natural, fluent, crystal-clear voices
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') ||
          v.name.includes('Neural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.name.includes('Zira') ||
          v.name.includes('David')) &&
        (v.lang.startsWith('en-IN') || v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en'))
    );
    if (naturalVoice) return naturalVoice;

    // Second choice: any Indian English or general English voice
    const enVoice = voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('en-US') || v.lang.startsWith('en'));
    if (enVoice) return enVoice;
  }

  return voices[0] || null;
}

/**
 * Text-to-speech engine supporting Telugu, Hindi, and English with fallback mechanisms
 */
export function speakText(rawText: string, lang: Language = 'en'): void {
  if (typeof window === 'undefined') return;

  stopSpeaking();

  const cleanedText = cleanTextForSpeech(rawText, lang);
  if (!cleanedText) return;

  notifyCaption(cleanedText, lang, true);

  // If voices are not yet loaded, attempt to retrieve them
  if (cachedVoices.length === 0 && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  const bestVoice = selectBestVoice(cachedVoices, lang);

  // Check if we have a native voice for Telugu
  const hasNativeTelugu =
    lang === 'te' &&
    bestVoice &&
    (bestVoice.lang.toLowerCase().startsWith('te') || bestVoice.name.toLowerCase().includes('telugu'));

  // If Telugu is requested and no native browser Telugu voice exists (common on many desktops),
  // use the high-quality Google Cloud TTS audio fallback
  if (lang === 'te' && !hasNativeTelugu) {
    try {
      const encoded = encodeURIComponent(cleanedText.slice(0, 200));
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=te&client=tw-ob&q=${encoded}`;
      const audio = new Audio(ttsUrl);
      currentAudioElement = audio;
      audio.onended = () => {
        currentAudioElement = null;
        notifyCaption('', lang, false);
      };
      audio.onerror = () => {
        // Fallback to clear speech in default voice
        speakWithSynthesis(cleanedText, lang, bestVoice);
      };
      audio.play().catch(() => {
        // Browser autoplay policy blocked audio, fallback to speech synthesis
        speakWithSynthesis(cleanedText, lang, bestVoice);
      });
      return;
    } catch {
      speakWithSynthesis(cleanedText, lang, bestVoice);
      return;
    }
  }

  speakWithSynthesis(cleanedText, lang, bestVoice);
}

function speakWithSynthesis(text: string, lang: Language, voice: SpeechSynthesisVoice | null): void {
  if (!('speechSynthesis' in window)) {
    notifyCaption('', lang, false);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // Slightly slower pace (0.88 - 0.92) is significantly clearer and more understandable
  utterance.rate = lang === 'en' ? 0.90 : 0.92;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  switch (lang) {
    case 'te':
      utterance.lang = 'te-IN';
      break;
    case 'hi':
      utterance.lang = 'hi-IN';
      break;
    default:
      utterance.lang = 'en-IN';
      break;
  }

  if (voice) {
    utterance.voice = voice;
  }

  utterance.onend = () => {
    notifyCaption('', lang, false);
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis event error:', e);
    notifyCaption('', lang, false);
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioElement) {
      try {
        currentAudioElement.pause();
        currentAudioElement.currentTime = 0;
      } catch {}
      currentAudioElement = null;
    }
    notifyCaption('', 'en', false);
  }
}

/**
 * Play a high-clarity soundbox confirmation chime (like PhonePe / Paytm soundbox)
 */
export function playSoundboxChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.5, now + 0.25); // C6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.2);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch {}
}

/**
 * Voice recognition listener using Web Speech API
 */
export function startVoiceRecognition(
  lang: Language = 'en',
  onResult: (transcript: string) => void,
  onError?: (error: string) => void,
  onEnd?: () => void
): { stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onError) onError('Voice input not supported in this browser.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    switch (lang) {
      case 'te':
        recognition.lang = 'te-IN';
        break;
      case 'hi':
        recognition.lang = 'hi-IN';
        break;
      default:
        recognition.lang = 'en-IN';
        break;
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {}
      },
    };
  } catch (err: any) {
    if (onError) onError(err.message || 'Speech recognition initialization failed');
    return null;
  }
}
