# Node.js Version Fix

## Quick Fix for Node.js Version Error

You're seeing this error because you have Node.js 21.0.0, but Vite requires Node.js 20.19+ or 22.12+.

### Solution: Upgrade Node.js

1. **Check your current version:**
   ```bash
   node --version
   ```
   If it shows `v21.x.x`, you need to upgrade.

2. **Download the correct version:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version
   - This will be either v20.x or v22.x (both work with Vite)

3. **Install Node.js:**
   - Run the installer you downloaded
   - Follow the installation wizard
   - Make sure to check "Add to PATH" if asked

4. **Restart your terminal:**
   - Close your current terminal/command prompt completely
   - Open a new terminal window
   - This is important so it picks up the new Node.js version

5. **Verify the upgrade:**
   ```bash
   node --version
   ```
   Should now show `v20.x.x` or `v22.x.x`

6. **Clean up and reinstall:**
   ```bash
   # Delete old node_modules and lock file
   rm -rf node_modules package-lock.json
   
   # Or on Windows:
   rmdir /s node_modules
   del package-lock.json
   
   # Reinstall with correct Node.js version
   npm install
   ```

7. **Test:**
   ```bash
   npm run dev
   ```
   Should work without version errors!

---

## Why This Happens

- Node.js 21.x is an odd-numbered version (unstable/development)
- Vite only supports even-numbered LTS versions: 20.19+ or 22.12+
- Node.js 21.x is not a Long Term Support (LTS) version

---

## Alternative: Use Node Version Manager

If you need to switch between Node.js versions frequently:

**Windows:**
1. Install nvm-windows: https://github.com/coreybutler/nvm-windows
2. Run:
   ```bash
   nvm install 20
   nvm use 20
   ```

**Mac/Linux:**
1. Install nvm: https://github.com/nvm-sh/nvm
2. Run:
   ```bash
   nvm install 20
   nvm use 20
   ```

---

## Still Having Issues?

1. Make sure you completely closed and reopened your terminal
2. Try restarting your computer
3. Check that Node.js is in your PATH:
   ```bash
   where node    # Windows
   which node   # Mac/Linux
   ```
4. Verify npm also updated:
   ```bash
   npm --version
   ```

Once Node.js is upgraded, continue with Step 2 in DEPLOYMENT_GUIDE.md

