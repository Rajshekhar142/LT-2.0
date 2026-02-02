"use client";

import { useState } from "react";
import { Play, CheckCircle, Trash2 } from "lucide-react";
import { deleteTask, toggleTask } from "@/actions";
import SessionController from "./SessionController"; // Import the Cockpit

export default function DomainSection({ domain, tasks, isLocked }: { domain: any, tasks: any[], isLocked: boolean }) {
  // STATE: Which task is currently in "Deep Work" mode?
  const [activeSessionTask, setActiveSessionTask] = useState<any>(null);

  return (
    <div className="mb-6">
      {/* 1. DOMAIN HEADER */}
      <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 pl-1 ${domain.color.replace("bg-", "text-")}`}>
        {domain.name}
      </h3>

      {/* 2. TASK LIST */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div 
            key={task._id}
            className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
              task.isCompleted 
                ? "bg-neutral-900/30 border-neutral-900 opacity-50" 
                : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            {/* LEFT SIDE: Title & Points */}
            <div className="flex items-center gap-3">
              {/* STATUS INDICATOR */}
              <div className={`w-1.5 h-1.5 rounded-full ${task.isCompleted ? "bg-green-500" : "bg-neutral-600"}`} />
              
              <div>
                <p className={`font-medium text-sm ${task.isCompleted ? "text-neutral-500 line-through" : "text-white"}`}>
                  {task.title}
                </p>
                {/* METADATA BADGE */}
                {task.isCompleted && task.actualDuration > 0 ? (
                   // Show "120 WU" if completed via Session
                   <span className="text-[10px] font-mono text-green-500">
                     {task.points} WU • {task.difficulty === 3 ? "SYSTEMIC" : task.difficulty === 2 ? "ACTIVE" : "PASSIVE"}
                   </span>
                ) : (
                   // Show "50 pts" (Estimate) if pending
                   <span className="text-[10px] font-mono text-neutral-500">
                     Est. {task.points} pts
                   </span>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Actions */}
            <div className="flex items-center gap-2">
              
              {/* A. DELETE BUTTON (Hidden if Locked) */}
              {!isLocked && !task.isCompleted && (
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="p-2 text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              )}

              {/* B. ACTION BUTTON (Play vs Check) */}
              {!task.isCompleted ? (
                <button
                  onClick={() => setActiveSessionTask(task)} // <--- LAUNCH THE COCKPIT
                  className="p-2 bg-white text-black rounded-xl hover:scale-105 transition-transform flex items-center gap-1 pr-3"
                >
                  <Play size={14} fill="currentColor" />
                  <span className="text-[10px] font-bold uppercase">Start</span>
                </button>
              ) : (
                <button 
                  onClick={() => toggleTask(task._id, task.points)} // Allow undoing if needed
                  className="p-2 text-green-500 hover:text-green-400 transition-colors"
                >
                  <CheckCircle size={20} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. THE SESSION MODAL (Rendered conditionally) */}
      {activeSessionTask && (
        <SessionController 
          task={activeSessionTask} 
          onClose={() => setActiveSessionTask(null)} 
        />
      )}
    </div>
  );
}