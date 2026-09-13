import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceRecognitionOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  language?: string;
}

export function useVoiceRecognition({ onTranscript, language = 'en-IN' }: UseVoiceRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Keep the latest callback without rebuilding recognition for every render.
  const callbackRef = useRef(onTranscript);
  useEffect(() => { callbackRef.current = onTranscript; }, [onTranscript]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = language;

      recog.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        if (callbackRef.current) {
          const isFinal = Boolean(event.results[event.results.length - 1]?.isFinal);
          callbackRef.current(current, isFinal);
        }
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recog.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        const friendly: Record<string, string> = {
          'not-allowed': 'Microphone permission denied. Allow microphone access in your browser.',
          'audio-capture': 'No microphone was detected.',
          'no-speech': 'No speech detected. Try speaking again.',
          'network': 'Speech recognition network error. Check your internet connection.'
        };
        setError(friendly[event.error] || `Voice error: ${event.error}`);
        setIsListening(false);
      };

      setRecognition(recog);
      return () => {
        try { recog.onresult = null; recog.onend = null; recog.onerror = null; recog.abort(); } catch {}
      };
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        setError(null);
        setTranscript('');
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Failed to start voice recognition:', err);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      try {
        recognition.stop();
        setIsListening(false);
      } catch (err) {
        console.warn('Failed to stop voice recognition:', err);
      }
    }
  }, [recognition, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    error,
  };
}
