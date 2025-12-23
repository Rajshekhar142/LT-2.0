"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, X, Check } from "lucide-react";
import { addTask } from "../actions"; // Ensure this points to your actions file using @/

export default function VoiceCommander() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.interimResults = false; // Set to true if you want to see words appear as you speak

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setText(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech error:", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
             setIsListening(false);
        };
      }
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
        alert("Voice control not supported in this browser.");
        return;
    }
    setIsOpen(true);
    setIsListening(true);
    // Optional: clear text on new listen, or keep it to append? 
    // Usually clearing is better for a command interface.
    setText(""); 
    try {
        recognitionRef.current.start();
    } catch {
        console.log("Mic already active");
    }
  };

  const handleProcess = async () => {
    if (!text) return;
    await addTask(text);
    setIsOpen(false);
    setText("");
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={startListening}
          className={`fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 z-40 ${
            isListening ? "bg-red-500 animate-pulse" : "bg-white"
          }`}
        >
          <Mic size={28} className={isListening ? "text-white" : "text-black"} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end pb-10 px-6 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md mx-auto shadow-2xl">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                 <div className={`h-3 w-3 rounded-full ${isListening ? "bg-red-500 animate-ping" : "bg-neutral-600"}`} />
                 <span className="text-sm font-medium text-neutral-400 uppercase tracking-widest">
                    {isListening ? "Listening..." : "Paused"}
                 </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-neutral-800 rounded-full text-neutral-400">
                <X size={18} />
              </button>
            </div>

            {/* EDITABLE TEXT AREA */}
            <div className="min-h-[120px] flex items-center justify-center p-2">
               <textarea
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 placeholder={isListening ? "Listening..." : "Say \"Gym Workout 50pts\"..."}
                 className="w-full bg-transparent text-2xl font-medium text-white text-center outline-none resize-none placeholder:text-neutral-600 placeholder:italic leading-relaxed"
                 rows={3}
                 // Auto-focus logic can be tricky with voice, so we let the user click to edit
               />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                onClick={startListening}
                className="p-4 rounded-xl bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mic size={18} /> Retry
              </button>
              <button 
                onClick={handleProcess}
                disabled={!text}
                className={`p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    text ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                }`}
              >
                <Check size={18} /> Add Task
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}