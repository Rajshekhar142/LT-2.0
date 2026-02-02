"use server";

import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache"; 
import connectDB from "@/lib/db";
import { Domain, Task, TaskLog, GameSettings, DailyHistory } from "@/models/Core";
import { BADGES } from "@/lib/badgeRules";

// --- HELPER: Global Date Source of Truth ---
function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayDateString() {
  const date = new Date();
  date.setDate(date.getDate() - 1); 
  return date.toISOString().split("T")[0];
}

// --- HELPER: Calculate Streak ---
function calculateStreak(logs: any[]) {
  if (!logs.length) return 0;
  
  const uniqueDates = Array.from(new Set(logs.map((l: any) => l.dateString))).sort().reverse();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  let streak = 0;
  let currentCheck = today;

  if (!uniqueDates.includes(today)) {
    if (uniqueDates.includes(yesterday)) {
      currentCheck = yesterday;
    } else {
      return 0; 
    }
  }

  for (const date of uniqueDates) {
    if (date === currentCheck) {
      streak++;
      const d = new Date(currentCheck);
      d.setDate(d.getDate() - 1);
      currentCheck = d.toISOString().split("T")[0] as string;
    }
  }
  return streak;
}

// --- MAIN: Fetch App Data ---
export async function getData() {
  noStore(); 
  await connectDB();
  
  const today = getTodayDateString();
  
  // 1. Ensure Settings Exist
  let settings = await GameSettings.findOne({ userEmail: "me" });
  if (!settings) {
    settings = await GameSettings.create({ userEmail: "me", isLocked: false, lockDate: today });
  }

  // 2. HISTORY SYNC LOOP
  const lastHistory = await DailyHistory.findOne().sort({ dateString: -1 });
  const checkDate = lastHistory 
    ? new Date(new Date(lastHistory.dateString).getTime() + 86400000) 
    : new Date(Date.now() - (30 * 86400000));

  while (checkDate.toISOString().split("T")[0] < today) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const exists = await DailyHistory.findOne({ dateString: dateStr });
    
    if (!exists) {
      const logs = await TaskLog.find({ dateString: dateStr }).lean();
      const points = logs.reduce((acc: number, l: any) => acc + (l.pointsEarned || 0), 0); // Added safety check
      const count = logs.length;

      await DailyHistory.create({
        userEmail: "me",
        dateString: dateStr,
        totalPoints: points,
        tasksCompleted: count
      });
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  // 3. Auto-Unlock
  if (settings.lockDate !== today) {
     settings.isLocked = false;
     settings.lockDate = today;
     await settings.save();
  }

  // 4. Fetch Active Data
  const [domains, tasks, logs, finalSettings] = await Promise.all([
    Domain.find({ isActive: true }).sort({ order: 1 }).lean(),
    Task.find({ isActive: true }).lean(),
    TaskLog.find({ dateString: today }).lean(), 
    GameSettings.findOne({ userEmail: "me" }).lean()
  ]);

  const settingsObj = finalSettings as any;
  const isLocked = settingsObj?.isLocked === true && settingsObj?.lockDate === today;

  const cleanTasks = tasks.map((t: any) => ({
    ...t,
    _id: t._id.toString(),
    domainId: t.domainId.toString(),
    isCompleted: logs.some((l: any) => l.taskId.toString() === t._id.toString())
  }));

  const cleanDomains = domains.map((d: any) => ({
    ...d,
    _id: d._id.toString()
  }));

  return { domains: cleanDomains, tasks: cleanTasks, isLocked };
}

// --- LEGACY: Fetch Badges, Streak, Wallet & Progress ---
export async function getLegacyData() {
  noStore();
  await connectDB();
  
  const [logs, tasks, domains, settings] = await Promise.all([
    TaskLog.find({}).lean(),
    Task.find({}).lean(),
    Domain.find({}).lean(),
    GameSettings.findOne({ userEmail: "me" })
  ]);

  if (!settings) return { badges: [], streak: 0, earnedIds: [], wallet: 0, badgeProgress: {} };

  const currentStreak = calculateStreak(logs);
  const earnedBadgeIds = settings.earnedBadges || [];
  let newBadgesEarned = false;
  
  const badgeProgress: Record<string, number> = {};

  for (const badge of BADGES) {
    let progress = 0;
    let qualified = false;

    if (badge.type === "streak") {
      progress = currentStreak;
      if (currentStreak >= badge.threshold) qualified = true;
    } 
    else if (badge.type === "domain_tasks") {
      const domain = domains.find((d: any) => d.name === badge.domainName) as any;
      if (domain) {
        const domainTaskIds = tasks
            .filter((t: any) => t.domainId.toString() === domain._id.toString())
            .map((t: any) => t._id.toString());
        
        const count = logs.filter((l: any) => domainTaskIds.includes(l.taskId.toString())).length;
        progress = count;
        if (count >= badge.threshold) qualified = true;
      }
    }

    badgeProgress[badge.id] = Math.min(100, Math.round((progress / badge.threshold) * 100));

    if (qualified && !earnedBadgeIds.includes(badge.id)) {
      earnedBadgeIds.push(badge.id);
      newBadgesEarned = true;
    }
  }

  if (newBadgesEarned) {
    settings.earnedBadges = earnedBadgeIds;
    await settings.save();
    revalidatePath("/");
  }

  return {
    streak: currentStreak,
    earnedIds: earnedBadgeIds,
    wallet: settings.walletBalance || 0,
    badgeProgress
  };
}

// --- ACTIONS ---

// 1. SIMPLE TOGGLE (Old Checkbox Way)
export async function toggleTask(taskId: string, points: number) {
  await connectDB();
  const today = getTodayDateString();

  const existingLog = await TaskLog.findOne({ taskId, dateString: today });
  const settings = await GameSettings.findOne({ userEmail: "me" });

  if (existingLog) {
    await TaskLog.findByIdAndDelete(existingLog._id);
    if (settings) {
       settings.walletBalance = Math.max(0, (settings.walletBalance || 0) - points);
       await settings.save();
    }
  } else {
    // Basic completion without Feynman check
    await TaskLog.create({ 
      taskId, 
      dateString: today, 
      pointsEarned: points,
      userEmail: "me" // Added for safety
    });
    if (settings) {
       settings.walletBalance = (settings.walletBalance || 0) + points;
       await settings.save();
    }
  }
  revalidatePath("/");
}

// 2. THE PHYSICS ENGINE (New "Deep Work" Completion)
// This calculates points based on Time * Difficulty * Recall
export async function completeSession(
  taskId: string, 
  data: {
    actualDuration: number;   
    difficulty: number;       
    resistanceLevel: number;  
    feynmanReflection: string;
    recallAccuracy: number;   
  }
) {
  await connectDB();
  const today = getTodayDateString();

  // A. CALCULATE WEIGHTED UNITS (WU)
  let wu = data.actualDuration * data.difficulty * data.recallAccuracy;

  // Resistance Bonus (Triple score if urge to quit was high)
  if (data.resistanceLevel >= 8) {
    wu = wu * 3;
  }

  const finalPoints = Math.round(wu);

  // B. UPDATE TASK METADATA
  // We explicitly DO NOT "toggle" here. A session completion is final.
  await Task.findByIdAndUpdate(taskId, {
    points: finalPoints, // Overwrite estimated points with actual WU
    
    // Save the Metadata
    actualDuration: data.actualDuration,
    difficulty: data.difficulty,
    resistanceLevel: data.resistanceLevel,
    feynmanReflection: data.feynmanReflection,
    recallAccuracy: data.recallAccuracy
  });

  // C. LOG IT (For Badges & History)
  await TaskLog.create({
    userEmail: "me",
    taskId: taskId,
    dateString: today,
    pointsEarned: finalPoints,
    completedAt: new Date()
  });

  // D. PAY THE USER
  await GameSettings.findOneAndUpdate(
    { userEmail: "me" },
    { $inc: { walletBalance: finalPoints } }
  );

  revalidatePath("/");
  revalidatePath("/legacy");
}

export async function resetWallet() {
  await connectDB();
  await GameSettings.findOneAndUpdate({ userEmail: "me" }, { walletBalance: 0 });
  revalidatePath("/legacy");
}

export async function toggleLock() {
  await connectDB();
  const today = getTodayDateString();
  
  const settings = await GameSettings.findOne({ userEmail: "me" });
  
  if (!settings) {
    await GameSettings.create({ userEmail: "me", isLocked: true, lockDate: today });
  } else {
    const newLockState = !settings.isLocked;
    settings.isLocked = newLockState;
    if (newLockState) settings.lockDate = today;
    await settings.save();
  }
  revalidatePath("/");
}

export async function addTask(text: string) {
  await connectDB();
  const today = getTodayDateString();
  
  const settings = await GameSettings.findOne({ userEmail: "me" });
  if (settings?.isLocked && settings?.lockDate === today) {
    return { success: false, message: "Day is locked" };
  }

  const lowerText = text.toLowerCase();
  const pointsMatch = lowerText.match(/(\d+)\s*(?:pt|point|pts)/);
  const points = pointsMatch ? parseInt(pointsMatch[1]) : 1; 

  const domains = await Domain.find({ isActive: true }).lean();
  let targetDomain = domains.find((d: any) => lowerText.includes(d.name.toLowerCase()));
  if (!targetDomain) targetDomain = domains[0]; 

  let cleanTitle = text
    .replace(new RegExp(`${points}\\s*(?:pt|point|pts)[s]?`, 'gi'), "") 
    .replace(new RegExp(targetDomain?.name || "", 'gi'), "") 
    .trim();

  await Task.create({
    domainId: targetDomain?._id,
    title: cleanTitle || "New Task", 
    points: points, // This is now just an "Estimate"
    isActive: true,
    // Defaults for new physics fields
    difficulty: 2, 
    resistanceLevel: 0
  });
  
  revalidatePath("/");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  await connectDB();
  const today = getTodayDateString();

  const settings = await GameSettings.findOne({ userEmail: "me" });
  if (settings?.isLocked && settings?.lockDate === today) {
    return;
  }

  await Task.findByIdAndDelete(taskId);
  await TaskLog.deleteMany({ taskId });
  revalidatePath("/");
}