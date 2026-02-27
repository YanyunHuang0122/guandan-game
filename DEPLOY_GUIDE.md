# 🚀 Deploy Your Guandan Game to GitHub Pages

## Step 1: Create GitHub Account (5 minutes)

1. Go to https://github.com
2. Click "Sign up"
3. Enter your email, password, username
4. Verify your email
5. **You're ready!**

## Step 2: Create a New Repository (2 minutes)

1. Click the **"+"** icon in top right
2. Select **"New repository"**
3. Fill in:
   - **Repository name**: `guandan-game` (must be lowercase, no spaces)
   - **Description**: "Guandan card game - PWA version"
   - **Public** (check this - required for free GitHub Pages)
   - **Do NOT** check "Add README"
4. Click **"Create repository"**

## Step 3: Upload Your Files (3 minutes)

### Option A: Using Web Interface (Easier)

1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop ALL files from `C:\Users\yanyunhuang\GuandanGame\PWA\` folder:
   - `index.html`
   - `manifest.json`
   - `service-worker.js`
   - `css/` folder
   - `js/` folder
   - `icons/` folder (even if empty)

3. Write commit message: "Initial commit"
4. Click **"Commit changes"**

### Option B: Using Git (Advanced)

If you have Git installed on Windows:

```bash
cd C:\Users\yanyunhuang\GuandanGame\PWA

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/guandan-game.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 4: Enable GitHub Pages (1 minute)

1. In your repository, click **"Settings"** (top right)
2. Scroll down left sidebar, click **"Pages"**
3. Under "Branch":
   - Select **"main"** from dropdown
   - Select **"/ (root)"**
   - Click **"Save"**
4. Wait 1-2 minutes for deployment

## Step 5: Get Your Game URL

After deployment (1-2 minutes), you'll see:

```
Your site is live at https://YOUR_USERNAME.github.io/guandan-game/
```

**This is your game URL!** 🎉

## Step 6: Test on iPhone (30 seconds)

1. Open **Safari** on your iPhone
2. Go to: `https://YOUR_USERNAME.github.io/guandan-game/`
3. The game loads! ✅

## Step 7: Install as App on iPhone (30 seconds)

1. With the game open in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down, tap **"Add to Home Screen"**
4. Name it: **"Guandan"**
5. Tap **"Add"**
6. **Icon appears on your home screen!** 📱

Now you can play anytime by tapping the icon - it opens full screen like a real app!

## 🎯 Your Game URLs

Replace `YOUR_USERNAME` with your actual GitHub username:

- **Web URL**: `https://YOUR_USERNAME.github.io/guandan-game/`
- **Share this with friends**: They can play too!

## 🔄 How to Update Your Game Later

Whenever you want to update:

### Option A: Web Interface

1. Go to your repository on GitHub
2. Navigate to the file you want to edit
3. Click the pencil icon (Edit)
4. Make changes
5. Scroll down, click "Commit changes"
6. Wait 1-2 minutes
7. **Game automatically updates!**

### Option B: Re-upload Files

1. Go to repository
2. Click on file to replace
3. Click "..." → "Delete file"
4. Upload new version
5. Done!

## 📱 Sharing Your Game

Send this to friends:
```
Check out this Guandan card game I made!
https://YOUR_USERNAME.github.io/guandan-game/

Open in Safari on iPhone and "Add to Home Screen" to install!
```

They can play instantly in their browser or install it too!

## ⚠️ Troubleshooting

### "404 - File not found"
- Wait 2-3 minutes after enabling GitHub Pages
- Check that you uploaded `index.html` to root (not in a subfolder)
- Verify repository is **Public**

### "Page not loading"
- Make sure all files are uploaded (check js/ and css/ folders)
- Try hard refresh: Hold Shift + click reload
- Check browser console for errors (F12)

### "Cannot add to home screen"
- Must use **Safari** on iPhone (not Chrome)
- Icon may not appear if you haven't created icon images yet (game still works!)

### Icons missing
Don't worry! The game works perfectly without icons. To add icons later:
1. Create 192x192 and 512x512 PNG images
2. Name them `icon-192.png` and `icon-512.png`
3. Upload to `icons/` folder in your repository

## 🎨 Creating Icons (Optional)

Use any of these free tools:

1. **Canva** (canva.com)
   - Create 192x192 design
   - Add "掼" character
   - Green gradient background
   - Download as PNG

2. **Figma** (figma.com)
   - Free design tool
   - Export as PNG

3. **Simple Method**
   - Take screenshot of game title
   - Resize to 192x192 using Paint or online tool
   - Save as `icon-192.png`

## ✅ Verification Checklist

- [ ] GitHub account created
- [ ] Repository created and public
- [ ] All files uploaded
- [ ] GitHub Pages enabled
- [ ] Game URL works in browser
- [ ] Game opens on iPhone Safari
- [ ] Game works (can play cards)
- [ ] Added to iPhone home screen
- [ ] Game works offline after first load

## 🎉 Success!

Your game is now:
- ✅ Live on the internet
- ✅ Accessible from any device
- ✅ Installable on iPhone
- ✅ Works offline
- ✅ Shareable with friends
- ✅ Totally FREE!

**Enjoy your Guandan game!** 🎮🎴

---

## 💡 Pro Tips

1. **Bookmark the URL** on your phone
2. **Share with family** - they can install it too
3. **Works on Android** too (Chrome → Menu → "Install app")
4. **No App Store approval** needed
5. **Update anytime** by uploading new files to GitHub

## 📞 Need Help?

If something doesn't work:
1. Check the Troubleshooting section above
2. Wait a few minutes (GitHub Pages can take time)
3. Clear Safari cache and reload
4. Make sure repository is Public

Most issues resolve by waiting 2-3 minutes and refreshing! 🔄
