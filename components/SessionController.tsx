"use client";

import { useState, useEffect } from "react";
import { Play, Square, CheckCircle, Brain, Flame, AlertTriangle, Clock } from "lucide-react";
import { completeSession } from "@/actions"; // The action we just wrote

interface SessionControllerProps {
  task: any;
  onClose: () => void;
}

export default function SessionController({ task, onClose }: SessionControllerProps) {
  // STAGES: "SETUP" -> "FOCUS" -> "DEBRIEF"
  const [stage, setStage] = useState<"SETUP" | "FOCUS" | "DEBRIEF">("SETUP");

  // INPUTS
  const [difficulty, setDifficulty] = useState(2); // Default: Active (2x)
  const [resistance, setResistance] = useState(0); // 0-10
  const [feynmanText, setFeynmanText] = useState("");
  const [recallGrade, setRecallGrade] = useState(1.0);

  // TIMER STATE
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: any;
    if (stage === "FOCUS" && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, isPaused]);

  // --- HELPER: FORMAT TIME ---
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async () => {
    const actualDurationMinutes = Math.ceil(elapsedSeconds / 60);
    
    // Call the Server Action
    await completeSession(task._id, {
      actualDuration: actualDurationMinutes,
      difficulty,
      resistanceLevel: resistance,
      feynmanReflection: feynmanText,
      recallAccuracy: recallGrade
    });

    onClose(); // Close the modal
  };

  // =========================================================
  // RENDER: PHASE 1 - SETUP (PRE-FLIGHT)
  // =========================================================
  if (stage === "SETUP") {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl p-6 space-y-8 animate-in zoom-in-95 duration-200">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Mission Config</h2>
            <p className="text-neutral-400 text-sm">Target: {task.title}</p>
          </div>

          {/* 1. DIFFICULTY SELECTOR */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Metabolic Cost</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1, label: "Passive", mult: "1x", desc: "Reading/Watching" },
                { val: 2, label: "Active", mult: "2x", desc: "Coding/Solving" },
                { val: 3, label: "Systemic", mult: "3x", desc: "Architecting" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setDifficulty(opt.val)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    difficulty === opt.val
                      ? "bg-white text-black border-white"
                      : "bg-neutral-800 text-neutral-400 border-transparent hover:bg-neutral-700"
                  }`}
                >
                  <div className="text-lg font-bold">{opt.mult}</div>
                  <div className="text-[10px] uppercase font-bold">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. RESISTANCE SLIDER */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Resistance Level</label>
               <span className={`text-xl font-black ${resistance >= 8 ? "text-red-500 animate-pulse" : "text-neutral-300"}`}>
                 {resistance}/10
               </span>
            </div>
            <input 
              type="range" min="0" max="10" step="1"
              value={resistance}
              onChange={(e) => setResistance(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            {resistance >= 8 && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 p-2 rounded-lg">
                <Flame size={14} />
                <span><strong>RESISTANCE BONUS:</strong> Triple Points Active</span>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button onClick={onClose} className="p-4 rounded-xl font-bold text-neutral-400 hover:bg-neutral-800">
              Abort
            </button>
            <button 
              onClick={() => setStage("FOCUS")} 
              className="p-4 rounded-xl font-bold bg-white text-black hover:bg-neutral-200 flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              Engage
            </button>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: PHASE 2 - FOCUS (IN-FLIGHT)
  // =========================================================
  if (stage === "FOCUS") {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 space-y-12">
        
        {/* HEADS UP DISPLAY */}
        <div className="text-center space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400">
             <Brain size={12} />
             <span>{difficulty === 1 ? "PASSIVE" : difficulty === 2 ? "ACTIVE" : "SYSTEMIC"} MODE</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight text-center leading-tight">
             {task.title}
           </h1>
        </div>

        {/* TIMER */}
        <div className="relative">
           <div className="text-[6rem] md:text-[10rem] font-black text-white tabular-nums leading-none tracking-tighter">
             {formatTime(elapsedSeconds)}
           </div>
           {resistance >= 8 && (
             <div className="absolute -top-6 right-0 text-red-500 animate-pulse">
               <Flame size={32} fill="currentColor" />
             </div>
           )}
        </div>

        {/* CONTROLS */}
        <button 
          onClick={() => setStage("DEBRIEF")}
          className="group relative px-8 py-4 bg-neutral-900 hover:bg-red-900/20 border border-neutral-800 hover:border-red-500/50 rounded-2xl transition-all duration-300"
        >
          <span className="flex items-center gap-3 text-neutral-400 group-hover:text-red-400 font-bold uppercase tracking-widest">
            <Square size={18} fill="currentColor" />
            Terminate Session
          </span>
        </button>

        <p className="text-neutral-600 text-xs text-center max-w-xs leading-relaxed">
          <AlertTriangle size={12} className="inline mr-1" />
          The Dead-Stop Rule is active. Leaving this screen or switching context validates a penalty.
        </p>
      </div>
    );
  }

  // =========================================================
  // RENDER: PHASE 3 - DEBRIEF (LANDING)
  // =========================================================
  if (stage === "DEBRIEF") {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl p-6 space-y-6 animate-in slide-in-from-bottom-10 duration-300">
          
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={28} className="text-green-500" />
            <h2 className="text-2xl font-bold text-white">Session Complete</h2>
          </div>

          {/* FEYNMAN CHECK */}
          <div className="space-y-3">
             <label className="text-sm font-bold text-neutral-300 flex justify-between">
               <span>The Feynman Check</span>
               <span className="text-neutral-500 font-normal text-xs">Explain it to a 12-year-old</span>
             </label>
             <textarea 
               value={feynmanText}
               onChange={(e) => setFeynmanText(e.target.value)}
               placeholder="I implemented the sliding window by..."
               className="w-full h-32 bg-black border border-neutral-700 rounded-xl p-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors resize-none"
             />
          </div>

          {/* SELF GRADE */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Honest Recall Assessment</label>
            <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setRecallGrade(0.5)}
                 className={`p-4 rounded-xl border text-center transition-all ${
                   recallGrade === 0.5 ? "bg-red-900/20 border-red-500 text-red-400" : "bg-neutral-800 border-transparent text-neutral-500"
                 }`}
               >
                 <div className="font-bold mb-1">Hazy</div>
                 <div className="text-[10px] opacity-70">50% Penalty</div>
               </button>
               <button 
                 onClick={() => setRecallGrade(1.0)}
                 className={`p-4 rounded-xl border text-center transition-all ${
                   recallGrade === 1.0 ? "bg-green-900/20 border-green-500 text-green-400" : "bg-neutral-800 border-transparent text-neutral-500"
                 }`}
               >
                 <div className="font-bold mb-1">Solid</div>
                 <div className="text-[10px] opacity-70">Full Score</div>
               </button>
            </div>
          </div>

          <button 
            disabled={feynmanText.length < 10}
            onClick={handleSubmit}
            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Submit to Log
          </button>

        </div>
      </div>
    );
  }

  return null;
}