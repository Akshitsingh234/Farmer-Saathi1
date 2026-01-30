"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { speechToText } from "@/ai/community_flow/speech-to-text";
import { useToast } from "@/hooks/use-toast";

interface VoiceCommandButtonProps {
  onCommand: (command: string) => void;
  onStart?: () => void;   // NEW
  onEnd?: () => void;     // NEW
  disabled?: boolean;
}

export function VoiceCommandButton({
  onCommand,
  onStart,
  onEnd,
  disabled,
}: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const handleVoiceCommand = async () => {
    // Stop listening
    if (isListening) {
      mediaRecorderRef.current?.stop();
      setIsListening(false);
      if (onEnd) onEnd(); // analyzing begins
      return;
    }

    // Start listening
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const reader = new FileReader();

          reader.readAsDataURL(audioBlob);

          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result as string;

              if (onEnd) onEnd(); // analyzing…

              const transcript = await speechToText(base64Audio);

              if (!transcript || transcript.trim().length === 0) {
                toast({
                  title: "No speech detected",
                  description: "Please try speaking again.",
                  variant: "destructive",
                });
                return;
              }

              onCommand(transcript);
            } catch (err) {
              console.error("Speech-to-text error:", err);
              toast({
                title: "Error",
                description: "Could not process your voice command.",
                variant: "destructive",
              });
            }
          };
        } finally {
          // Always stop microphone
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsListening(true);

      if (onStart) onStart(); // listening…

    } catch (error) {
      console.error("Microphone error:", error);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access in your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleVoiceCommand}
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      disabled={disabled}
      className="ml-4"
    >
      <Mic className={`h-4 w-4 ${isListening ? "animate-pulse text-red-500" : ""}`} />
    </Button>
  );
}
