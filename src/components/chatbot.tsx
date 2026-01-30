'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BotIcon, UserIcon } from '@/components/ui/icons';
import { generateResponseWithContext } from '@/ai/chatbot/chat';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type MaybeSpeechRecognition = any;

function detectLanguage(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Hindi detection
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN'; // Kannada detection
  return 'en-US';
}

// ⭐ NEW — Safe text for speech (remove URLs)
const cleanForSpeech = (text: string) =>
  text.replace(/(https?:\/\/[^\s]+)/g, "click on the link to view the tutorial");

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [currentLang, setCurrentLang] = useState('en-US');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<MaybeSpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec: MaybeSpeechRecognition = new SpeechRecognition();
    rec.lang = currentLang;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.continuous = true;

    rec.onstart = () => setIsListening(true);
    rec.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);

    rec.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setInput(prev => (prev ? prev + ' ' + event.results[i][0].transcript : event.results[i][0].transcript).trim());
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
    };

    recognitionRef.current = rec;
    return () => rec.stop?.();
  }, [currentLang]);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const formatResponse = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');

  // ⭐ UPDATED TTS function to use safe speech text + best Hindi voices
  const speakText = (txt: string, lang: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not available.');
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(txt);
    utter.lang = lang;

    const loadAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("Voices loaded:", voices);

      let chosenVoice =
        voices.find(v => v.name.toLowerCase().includes("wavenet") && v.lang === "hi-IN") ||
        voices.find(v => v.lang === "hi-IN") ||
        voices.find(v => v.lang === "en-IN") ||
        null;

      utter.voice = chosenVoice;
      utter.rate = 0.94;
      utter.pitch = 1.05;

      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utter);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      setTimeout(loadAndSpeak, 200);
    } else {
      loadAndSpeak();
    }
  };

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return alert('Speech recognition not supported.');
    isListening ? rec.stop() : rec.start();
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    const lang = detectLanguage(input);
    setCurrentLang(lang);

    const newMessages: Message[] = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateResponseWithContext({ userInput: input, conversationHistory: newMessages });
      const botMessage: Message = { role: 'assistant' as const, content: response.response };
      setMessages(prev => [...prev, botMessage]);

      if (autoSpeak && botMessage.content) {
        speakText(cleanForSpeech(botMessage.content), lang);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant' as const, content: "I'm having trouble connecting right now." };
      setMessages(prev => [...prev, errorMessage]);
      if (autoSpeak) speakText(errorMessage.content, 'en-US');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    } else {
      const lastBot = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastBot?.content) {
        const lang = detectLanguage(lastBot.content);
        speakText(cleanForSpeech(lastBot.content), lang);
      } else {
        alert('No bot message to speak.');
      }
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg">
          <BotIcon className="h-12 w-12" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader><SheetTitle>Farm Assistant</SheetTitle></SheetHeader>

        <div className="flex h-full flex-col py-4">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div key={index}
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && <BotIcon className="h-6 w-6 flex-shrink-0" />}
                  <div className={`max-w-xs rounded-lg px-4 py-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.role === 'assistant'
                      ? <div dangerouslySetInnerHTML={{ __html: formatResponse(msg.content) }} />
                      : msg.content}
                  </div>
                  {msg.role === 'user' && <UserIcon className="h-6 w-6 flex-shrink-0" />}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4">
                  <BotIcon className="h-6 w-6 flex-shrink-0" />
                  <div className="max-w-xs rounded-lg bg-muted px-4 py-3">Thinking...</div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <Button onClick={toggleListening} disabled={isLoading}
                className={`h-10 w-10 rounded-full ${isListening ? 'bg-red-100' : ''}`}>
                🎤
              </Button>

              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Ask about the site..."
                disabled={isLoading}
              />

              <Button onClick={handleSend} disabled={isLoading}>Send</Button>
              <Button onClick={toggleSpeech} disabled={isLoading}>
                {isSpeaking ? '🤫' : '🔊'}
              </Button>

              <label className="flex items-center gap-1 text-sm ml-2">
                <input type="checkbox" checked={autoSpeak} onChange={e => setAutoSpeak(e.target.checked)} className="accent-indigo-600" />
                <span>Auto-speak</span>
              </label>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
