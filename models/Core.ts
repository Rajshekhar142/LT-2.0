import { Schema, model, models } from "mongoose";

// 1. Domain
const DomainSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

// 2. Task
const TaskSchema = new Schema({
  domainId: { type: Schema.Types.ObjectId, ref: "Domain", required: true },
  title: { type: String, required: true },
  // THE NEW "PHYSICS" ENGINE FIELDS:
  // ---------------------------------------------------------
  // 1. Inputs (Pre-Flight)
  difficulty: { 
    type: Number, 
    enum: [1, 2, 3], // 1=Passive, 2=Active, 3=Systemic
    default: 2       // Default to "Active" (Standard work)
  },
  resistanceLevel: { 
    type: Number, 
    min: 0, max: 10, 
    default: 0       // 0 = No urge to quit, 10 = Maximum resistance
  },
  plannedDuration: { type: Number, default: 30 }, // Estimated minutes

  // 2. Outputs (Post-Flight)
  actualDuration: { type: Number, default: 0 },   // Actual minutes worked
  feynmanReflection: { type: String, default: "" }, // The 3-sentence summary
  recallAccuracy: { 
    type: Number, 
    enum: [0.5, 1.0], 
    default: 1.0     // 1.0 = Explained well, 0.5 = Failed check
  },

  // 3. The Score
  // We keep 'points' as the final calculated value so the rest of your app (Wallet/Graphs) 
  // still works without breaking. 
  // Formula: points = (Duration * Difficulty * Recall) * (ResistanceBonus ? 3 : 1)
  points: { type: Number, default: 0 }, 
  // ---------------------------------------------------------

  isCompleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 3. Task Log (Daily Records)
const TaskLogSchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  dateString: { type: String, required: true }, // "2025-10-25"
  pointsEarned: { type: Number, required: true },
});

// 4. Game Settings (Now with Wallet!)
const GameSettingsSchema = new Schema({
  userEmail: { type: String, required: true, unique: true },
  isLocked: { type: Boolean, default: false },
  lockDate: { type: String },
  earnedBadges: { type: [String], default: [] },
  // NEW: Your Bank Account
  walletBalance: { type: Number, default: 0 } 
});

// 5. Daily History
const DailyHistorySchema = new Schema({
  userEmail: { type: String, required: true, index: true },
  dateString: { type: String, required: true, unique: true },
  totalPoints: { type: Number, required: true },
  tasksCompleted: { type: Number, required: true },
});

export const Domain = models.Domain || model("Domain", DomainSchema);
export const Task = models.Task || model("Task", TaskSchema);
export const TaskLog = models.TaskLog || model("TaskLog", TaskLogSchema);
export const GameSettings = models.GameSettings || model("GameSettings", GameSettingsSchema);
export const DailyHistory = models.DailyHistory || model("DailyHistory", DailyHistorySchema);