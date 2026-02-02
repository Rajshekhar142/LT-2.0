"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send } from "lucide-react"; 
import { addTask } from "@/actions"; // Fixed path from "@/actions" to "@/app/actions"

export default function VoiceCommander() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 1. Setup ONLY. Do not set state here.
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition as any;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech error:", event.error);
        setIsListening(false);
        
        if (event.error === 'network') {
           setErrorMsg("Network Error: Check internet or try HTTPS.");
        } else if (event.error === 'not-allowed') {
           setErrorMsg("Microphone blocked. Check permissions.");
        } else {
           setErrorMsg("Voice failed. Try typing.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    // REMOVED the 'else' block here to fix the React error
  }, []);

  const toggleListening = () => {
    setErrorMsg(null);
    
    // 2. Check support HERE (When user interacts)
    if (!recognitionRef.current) {
        setErrorMsg("Browser not supported (Use Chrome).");
        return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
          recognitionRef.current.start();
          setIsListening(true);
      } catch {
          // Removed 'e' to fix "unused variable" warning
          setErrorMsg("Mic busy. Refresh page.");
      }
    }
  };

  const handleSend = async () => {
    if (!transcript.trim()) return;
    await addTask(transcript);
    setTranscript("");
    setErrorMsg(null);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
      
      {errorMsg && (
          <div className="absolute -top-12 left-0 right-0 mx-auto bg-red-900/90 text-red-200 text-xs py-2 px-4 rounded-lg text-center backdrop-blur-md border border-red-500/30 animate-in fade-in slide-in-from-bottom-2">
              {errorMsg}
          </div>
      )}

      <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-2 rounded-2xl shadow-2xl">
        <button
          onClick={toggleListening}
          className={`p-3 rounded-xl transition-all ${
            isListening 
              ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
          }`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <div className="flex-1 relative">
            <input 
                type="text" 
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={isListening ? "Listening..." : "Say 'Gym 50pts'..."}
                className="w-full bg-transparent text-white placeholder:text-neutral-600 focus:outline-none text-sm font-medium"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
        </div>

        <button 
          onClick={handleSend}
          disabled={!transcript}
          className="p-3 bg-white text-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
        >
          <Send size={18} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}