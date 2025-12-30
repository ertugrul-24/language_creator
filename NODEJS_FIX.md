# 🔧 Node.js Terminal Fix Guide

## Problem
Node.js was working 3 days ago but now `npm` and `node` commands don't work in any terminal.

## Root Cause
This usually happens after:
- System restart after installation
- Windows PATH environment variable reset
- Node.js installation was incomplete or corrupted

---

## Quick Fix (Try This First)

### Option 1: Restart PowerShell/Terminal (Most Common Fix)

1. **Close all terminals** (including VS Code terminal)
2. **Restart your computer** (this reloads environment variables)
3. **Open a NEW terminal** and try:
   ```powershell
   node --version
   npm --version
   ```

If this works, you're done! Skip to "Testing Your App" section.

---

## If Restart Didn't Work

### Option 2: Reinstall Node.js Properly

#### Step 1: Uninstall (if partially installed)

Go to **Settings** → **Apps** → **Apps & features**

Search for "Node.js" and click **Uninstall**

#### Step 2: Download Fresh

Go to https://nodejs.org/

Download **LTS version** (current: 22.x)

#### Step 3: Install with Default Settings

- Run the installer
- Click **Next** for all steps (keep defaults)
- **Important:** Check the box "Automatically install necessary tools"
- Click **Install**
- Wait for installation to complete (5-10 minutes)

#### Step 4: Restart Computer

Press `Win + R`, type `shutdown -r -t 0` and hit Enter

Or just restart normally.

#### Step 5: Verify Installation

Open a **NEW** terminal (after restart):

```powershell
node --version
npm --version
```

You should see version numbers like:
```
v22.11.0
10.9.0
```

---

## Option 3: Use Windows Package Manager (Faster)

If you have Windows 11 or Windows 10 with **winget** installed:

**Open PowerShell as Administrator** and run:

```powershell
winget install OpenJS.NodeJS
```

Then restart your terminal.

---

## Testing Your App After Fix

Once Node.js is working:

```powershell
cd c:\Users\Ertuğrul\Projelerim\language_creator
npm install
npm run dev
```

You should see:
```
  VITE v5.4.21  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser ✅

---

## Detailed Troubleshooting

| Problem | Solution |
|---------|----------|
| Still no `node` after restart | Check if PATH was modified. Go to Settings → Environment Variables and check if `C:\Program Files\nodejs` is listed |
| "node: command not found" in VS Code | Close VS Code completely and reopen it |
| npm install fails | Try: `npm cache clean --force` then `npm install` again |
| Port 5173 in use | Run: `npm run dev -- --port 3000` to use different port |
| Permission denied | Run PowerShell as Administrator |

---

## If All Else Fails

**Completely clean reinstall:**

1. Uninstall Node.js from Settings
2. Delete `C:\Program Files\nodejs` folder manually
3. Delete `%AppData%\npm` folder manually
4. Restart computer
5. Download and install fresh from nodejs.org
6. Restart computer again

---

## Let Me Know

Reply with the output of:
```powershell
node --version
npm --version
```

Then I'll help you get the app running! 🚀
