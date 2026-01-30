'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigateWithVoice } from '@/ai/community_flow/voice-navigation';
import { speechToText } from '@/ai/community_flow/speech-to-text';
import { useRouter, usePathname } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export default function VoiceNavigation() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'transcribing' | 'redirecting' | 'error'>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setStatus('transcribing');
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const transcription = await speechToText(base64Audio);
            if (typeof transcription === 'string' && transcription.length > 0) {
              setTranscribedText(`"${transcription}"`);
              const { path } = await navigateWithVoice(base64Audio);
              if (path && path !== 'unknown') {
                setStatus('redirecting');
                setTargetPath(path);
                router.push(path);
              } else {
                setStatus('error');
                setTranscribedText(`Could not determine path from: "${transcription}". Please try again.`);
                setTimeout(() => handleOpenChange(false), 2500);
              }
            } else {
              setStatus('error');
              setTranscribedText('Sorry, I could not understand that. Please try again.');
              setTimeout(() => handleOpenChange(false), 2500);
            }
          } catch (error) {
            console.error('Error during voice processing:', error);
            setStatus('error');
            setTranscribedText('Sorry, something went wrong. Please try again.');
            setTimeout(() => handleOpenChange(false), 2500);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('listening');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('error');
      setTranscribedText('Could not access microphone. Please check permissions.');
      setTimeout(() => handleOpenChange(false), 2500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      startRecording();
    } else {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      // Reset state when dialog closes
      setIsRecording(false);
      setStatus('idle');
      setTranscribedText('');
      setTargetPath(null);
    }
  };

  useEffect(() => {
    // When redirecting, close the dialog once the pathname matches the target path
    if (status === 'redirecting' && pathname === targetPath) {
      handleOpenChange(false);
    }
  }, [pathname, status, targetPath]);

  useEffect(() => {
    // Cleanup media streams on component unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Mic className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Voice Command</DialogTitle>
          <DialogDescription>
            {status === 'listening' && 'I\'m listening for your command...'}
            {status === 'transcribing' && 'Thinking...'}
            {(status === 'redirecting' || status === 'error') && 'Here\'s what I heard:'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
            { (status === 'listening') && <Mic className="h-16 w-16 text-red-500 animate-pulse mx-auto" /> }
            { (status !== 'listening') && <p className="text-lg">{transcribedText}</p> }
            { status === 'redirecting' && <p className="text-sm text-muted-foreground mt-2">Redirecting...</p> }
        </div>
        <DialogFooter>
            {isRecording && (
                <Button variant="destructive" onClick={stopRecording}>
                    <StopCircle className="mr-2 h-5 w-5" />
                    Stop Recording
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}