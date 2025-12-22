"use client";

import { useTransition } from "react";
import { Check, Trash2, Trophy } from "lucide-react";
import { toggleTask, deleteTask } from "../actions";

interface TaskItemProps {
  task: any;
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTask(task._id, task.points);
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this task permanently?")) {
      startTransition(async () => {
        await deleteTask(task._id);
      });
    }
  };

  return (
    <div 
      // FIX: Use isPending to reduce opacity while saving
      className={`group flex items-center justify-between p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all ${
        isPending ? "opacity-50 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={handleToggle}>
        <div 
          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
            task.isCompleted 
              ? "bg-green-500 border-green-500" 
              : "border-neutral-600 group-hover:border-neutral-400"
          }`}
        >
          {task.isCompleted && <Check size={14} className="text-black stroke-[4]" />}
        </div>
        
        <div>
          <h4 className={`font-medium transition-all ${task.isCompleted ? "text-neutral-500 line-through" : "text-white"}`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-1 text-xs font-bold text-neutral-600 uppercase tracking-wider mt-0.5">
             <Trophy size={10} className="text-yellow-600" />
             <span>{task.points} PTS</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleDelete}
        className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title="Delete Task"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}