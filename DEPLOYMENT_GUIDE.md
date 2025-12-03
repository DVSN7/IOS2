# Complete Deployment Guide

This guide will walk you through every step to deploy your generative art project to Vercel.

## Prerequisites Checklist

Before starting, make sure you have:
- ✅ **Node.js version 20.19+ or 22.12+** (IMPORTANT: Vite requires these versions)
  - Check your version: `node --version`
  - Download from https://nodejs.org/ if needed
  - **Note:** Node.js 21.x is NOT supported - you need 20.19+ or 22.12+
- ✅ A GitHub account (create at https://github.com if needed)
- ✅ A Vercel account (create at https://vercel.com if needed)
- ✅ Git installed (usually comes with Node.js, or download from https://git-scm.com/)

---

## Step 1: Check and Upgrade Node.js (If Needed)

**IMPORTANT:** Vite requires Node.js version 20.19+ or 22.12+. Node.js 21.x is NOT supported.

1. **Check your current Node.js version**
   ```bash
   node --version
   ```
   
   **What you should see:**
   - ✅ `v20.19.0` or higher (20.x series) - GOOD
   - ✅ `v22.12.0` or higher (22.x series) - GOOD
   - ❌ `v21.x.x` - NEEDS UPGRADE
   - ❌ `v18.x.x` or lower - NEEDS UPGRADE

2. **If you need to upgrade Node.js:**

   **Option A: Download from Node.js website (Recommended)**
   - Go to https://nodejs.org/
   - Download the **LTS (Long Term Support)** version
     - This will be either v20.x or v22.x (both work)
   - Run the installer
   - Restart your terminal/command prompt
   - Verify: `node --version` should show the new version

   **Option B: Using Node Version Manager (Advanced)**
   - **Windows:** Use `nvm-windows` from https://github.com/coreybutler/nvm-windows
   - **Mac/Linux:** Use `nvm` from https://github.com/nvm-sh/nvm
   - Then run: `nvm install 20` or `nvm install 22`
   - Then run: `nvm use 20` or `nvm use 22`

3. **Verify Node.js is updated**
   ```bash
   node --version
   npm --version
   ```
   Both commands should work without errors.

---

## Step 2: Install Dependencies

1. **Open your terminal/command prompt**
   - On Windows: Press `Win + R`, type `cmd` or `powershell`, press Enter
   - On Mac: Press `Cmd + Space`, type `Terminal`, press Enter
   - On Linux: Press `Ctrl + Alt + T`

2. **Navigate to your project folder**
   ```bash
   cd "D:\Work\Division7\17_p5\Generator\IOS\IOS3"
   ```
   (Replace with your actual project path if different)

3. **Install all required packages**
   ```bash
   npm install
   ```
   
   This will:
   - Download and install Vite (build tool)
   - Download and install p5.js (graphics library)
   - Create a `node_modules` folder with all dependencies
   
   **Expected output:** You should see a progress bar and then "added X packages" message.
   
   **If you get an error about Node.js version:**
   - Make sure you upgraded Node.js (see Step 1)
   - Close and reopen your terminal
   - Try `npm install` again

---

## Step 3: Test Locally

Before deploying, make sure everything works locally:

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **What should happen:**
   - Terminal will show: `Local: http://localhost:3000`
   - Your browser should automatically open
   - You should see your generative art running

3. **Test the controls:**
   - Try zooming with arrow keys
   - Try dragging to pan
   - Press 'S' to toggle animation
   - Press 'R' to reset

4. **If everything works:**
   - Press `Ctrl + C` in the terminal to stop the server
   - You're ready to deploy!

5. **If something doesn't work:**
   - Check the browser console (F12) for errors
   - Make sure all files are in the correct location
   - Verify Node.js is installed: `node --version`

---

## Step 4: Create GitHub Repository

### Option A: Using GitHub Website (Easiest)

1. **Go to GitHub**
   - Open https://github.com in your browser
   - Sign in to your account

2. **Create a new repository**
   - Click the "+" icon in the top right
   - Select "New repository"

3. **Repository settings:**
   - **Repository name:** `generative-art` (or any name you like)
   - **Description:** (optional) "Generative art with p5.js and WebGL shaders"
   - **Visibility:** Choose "Private" (to hide code) or "Public"
   - **DO NOT** check:
     - ❌ "Add a README file"
     - ❌ "Add .gitignore"
     - ❌ "Choose a license"
   - Click "Create repository"

4. **Copy the repository URL**
   - GitHub will show you a page with setup instructions
   - Copy the HTTPS URL (looks like: `https://github.com/YOUR_USERNAME/generative-art.git`)
   - You'll need this in the next step

### Option B: Using GitHub CLI (Advanced)

If you have GitHub CLI installed:
```bash
gh repo create generative-art --private --source=. --remote=origin --push
```

---

## Step 5: Initialize Git and Push to GitHub

1. **Open terminal in your project folder** (same as Step 1)

2. **Initialize Git repository** (if not already done)
   ```bash
   git init
   ```

3. **Add all files to Git**
   ```bash
   git add .
   ```
   This stages all your project files for commit.

4. **Create your first commit**
   ```bash
   git commit -m "Initial commit: Generative art project"
   ```

5. **Add GitHub as remote repository**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```
   **Replace:**
   - `YOUR_USERNAME` with your GitHub username
   - `YOUR_REPO_NAME` with your repository name

   Example:
   ```bash
   git remote add origin https://github.com/johndoe/generative-art.git
   ```

6. **Rename branch to main** (if needed)
   ```bash
   git branch -M main
   ```

7. **Push to GitHub**
   ```bash
   git push -u origin main
   ```

8. **Authentication:**
   - If prompted for username: Enter your GitHub username
   - If prompted for password: You'll need a Personal Access Token
     - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
     - Click "Generate new token (classic)"
     - Give it a name like "Vercel Deployment"
     - Check "repo" scope
     - Click "Generate token"
     - Copy the token and use it as your password

9. **Verify upload:**
   - Go to your GitHub repository page
   - You should see all your files listed
   - Files like `package.json`, `sketch.js`, `index.html` should be visible

---

## Step 6: Connect to Vercel

1. **Go to Vercel**
   - Open https://vercel.com in your browser
   - Sign in (or create account if needed)
   - You can sign in with GitHub (recommended)

2. **Import your project**
   - Click "Add New..." button
   - Select "Project"
   - You'll see a list of your GitHub repositories
   - Find your repository (e.g., "generative-art")
   - Click "Import" next to it

3. **Configure project settings**
   Vercel should auto-detect your settings, but verify:
   - **Framework Preset:** Vite (should be auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (should be auto-filled)
   - **Output Directory:** `dist` (should be auto-filled)
   - **Install Command:** `npm install` (should be auto-filled)

4. **Environment Variables**
   - Usually not needed for this project
   - Click "Deploy" if no environment variables are required

5. **Deploy!**
   - Click the "Deploy" button
   - Wait for the build to complete (usually 1-2 minutes)
   - You'll see a progress log showing:
     - Installing dependencies
     - Building project
     - Deploying to Vercel

---

## Step 7: Get Your Live URL

1. **After deployment completes:**
   - You'll see a "Congratulations" message
   - Your project URL will be displayed
   - Format: `your-project-name.vercel.app`
   - Example: `generative-art-abc123.vercel.app`

2. **Click on the URL** to open your live site

3. **Test your live site:**
   - Verify the art loads correctly
   - Test all controls (zoom, pan, animation)
   - Check that it works on mobile devices

4. **Custom domain (optional):**
   - In Vercel dashboard, go to your project
   - Click "Settings" → "Domains"
   - Add your custom domain if you have one

---

## Step 8: Automatic Deployments (Already Set Up!)

**Good news:** Everything is already configured for automatic deployments!

**What this means:**
- Every time you push code to GitHub, Vercel automatically:
  1. Detects the change
  2. Runs `npm install`
  3. Runs `npm run build`
  4. Deploys the new version
  5. Updates your live URL

**To update your live site:**
1. Make changes to your code
2. Run these commands:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push
   ```
3. Wait 1-2 minutes
4. Your site is automatically updated!

---

## Troubleshooting

### Problem: Node.js version error
**Error:** "Vite requires Node.js version 20.19+ or 22.12+"
**Solution:**
- Check your version: `node --version`
- If you have Node.js 21.x, you MUST upgrade to 20.19+ or 22.12+
- Download from https://nodejs.org/ (get the LTS version)
- After installing, close and reopen your terminal
- Verify: `node --version` should show v20.x or v22.x
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

### Problem: `npm install` fails
**Solution:**
- Make sure Node.js is installed: `node --version`
- Verify Node.js version is 20.19+ or 22.12+ (see above)
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- Check your internet connection

### Problem: `npm run dev` doesn't work
**Solution:**
- Make sure you ran `npm install` first
- Check for error messages in the terminal
- Verify all files are in the correct location

### Problem: Git push fails
**Solution:**
- Verify your GitHub repository URL is correct
- Make sure you have a Personal Access Token (not password)
- Check your internet connection
- Try: `git remote -v` to see your remote URL

### Problem: Vercel build fails
**Solution:**
- Check the build logs in Vercel dashboard
- Make sure `package.json` has all dependencies
- Verify `vite.config.js` is correct
- Check that all files are pushed to GitHub

### Problem: Site loads but art doesn't show
**Solution:**
- Open browser console (F12) and check for errors
- Verify shader files are in the repository
- Check that Vite bundled everything correctly
- Try rebuilding: In Vercel, go to Deployments → Click "..." → Redeploy

### Problem: Can't find repository in Vercel
**Solution:**
- Make sure you're signed in with the correct GitHub account
- Check that the repository is not private (or grant Vercel access)
- Try refreshing the Vercel page
- Go to Vercel Settings → Git → Connect GitHub account

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Git commands
git init
git add .
git commit -m "Your message"
git push

# Check Git status
git status

# See remote repository
git remote -v
```

---

## Security Notes

1. **Code Visibility:**
   - Code is bundled but not minified (readable if someone inspects)
   - For stronger protection, consider obfuscation (not included in this setup)
   - Private GitHub repos keep code hidden from public

2. **GitHub Repository:**
   - Private repos: Only you can see the code
   - Public repos: Anyone can see the code on GitHub
   - Vercel deployment works with both

3. **Vercel:**
   - Free tier includes:
     - Unlimited deployments
     - Custom domains
     - Automatic HTTPS
     - Global CDN

---

## Next Steps After Deployment

1. **Share your link:**
   - Copy your Vercel URL
   - Share with friends, on social media, etc.

2. **Monitor usage:**
   - Check Vercel dashboard for analytics
   - Monitor deployment logs

3. **Make updates:**
   - Edit your code
   - Push to GitHub
   - Site updates automatically!

4. **Optional enhancements:**
   - Add a custom domain
   - Set up custom 404 page
   - Add analytics tracking
   - Configure environment variables if needed

---

## Support Resources

- **Vite Documentation:** https://vitejs.dev/
- **p5.js Documentation:** https://p5js.org/reference/
- **Vercel Documentation:** https://vercel.com/docs
- **Git Documentation:** https://git-scm.com/doc
- **GitHub Help:** https://docs.github.com/

---

## Checklist Summary

Use this to track your progress:

- [ ] Installed Node.js
- [ ] Ran `npm install` successfully
- [ ] Tested locally with `npm run dev`
- [ ] Created GitHub account
- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Created Vercel account
- [ ] Connected GitHub to Vercel
- [ ] Deployed to Vercel
- [ ] Got live URL
- [ ] Tested live site
- [ ] Shared your link!

**Congratulations!** Your generative art is now live on the internet! 🎨✨

