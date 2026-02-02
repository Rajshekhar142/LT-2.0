# ⚡ Life Tracker (LT-2.0)

> "Man is a rope, tied between beast and overman—a rope over an abyss." — Friedrich Nietzsche

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/Next.js-15-black)
![Database](https://img.shields.io/badge/MongoDB-Atlas-green)
![Coverage](https://img.shields.io/badge/Tests-Vitest-yellow)

**Life Tracker** is not a To-Do list. It is a **Gamified Life Operating System** designed for high-performance engineering and self-mastery. It replaces binary "check-boxes" with a physics-based metric of effort, forcing you to track the *metabolic cost* of your work rather than just the output.

---

## 🧠 The Philosophy: Weighted Work Units ($WU$)

Traditional productivity apps lie to you. Checking off "Take out trash" (5 mins) looks the same as "Fix Memory Leak" (4 hours).

**LT-2.0** introduces a new physics engine for productivity:

$$WU = (\text{Duration}) \times (\text{Difficulty}) \times (\text{Recall Accuracy})$$

- **Duration:** Actual time spent in deep focus (tracked via timer).
- **Difficulty Multiplier:**
  - `1x` **Passive:** Reading, Watching Tutorials.
  - `2x` **Active:** Coding, Debugging, Writing.
  - `3x` **Systemic:** Architecting, Kernel Dev, LeetCode Hard.
- **Recall Penalty:** Post-session "Feynman Check". If you can't explain what you did to a 12-year-old, your score is halved.
- **Resistance Bonus:** +3x Multiplier if you start a session when your "Urge to Quit" is > 8/10.

---

## 🚀 Key Features

### ✈️ The Deep Work Cockpit
A specialized UI for executing work sessions.
- **Pre-Flight:** Set difficulty and "Resistance Level" (urge to quit).
- **In-Flight:** Focus timer with "Dead-Stop Rule" (pausing kills the session).
- **Debrief:** Mandatory self-reflection and grading before points are awarded.

### 🗣️ Voice Commander
Frictionless data entry.
- **Command:** *"Gym 50pts"* or *"Fix Bug 2x Difficulty"*
- **Tech:** Uses Web Speech API with fallback error handling (works on Mobile/Desktop).

### 🔒 The Commitment Contract
- **Daily Lock:** Once you "Lock" your day, delete buttons disappear. You must face your incomplete tasks.
- **Legacy System:** A permanent Hall of Fame. Past days cannot be edited, only observed.

### 🏆 Gamification
- **Wallet:** Earn $WU to "buy" guilt-free leisure time or hardware upgrades.
- **Badges:** Automated tier system (Novice → Veteran → Master) based on lifetime stats.
- **Radar Chart:** Visualizes balance across Life Domains (Health, Wealth, Intellect).

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions)
- **Database:** MongoDB (Mongoose ORM) via Atlas
- **Styling:** Tailwind CSS (Cyberpunk/Dark Mode aesthetic)
- **Icons:** Lucide React
- **Testing:** Vitest (Unit Testing for Physics Engine)
- **CI/CD:** Husky (Local Pre-push) + GitHub Actions (Remote Gatekeeper)

---

## ⚙️ Getting Started

### 1. Clone the Repo
```bash
git clone git@github.com:YOUR_USERNAME/life-tracker.git
cd life-tracker
