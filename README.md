# QuickServe Pro — Website

Uganda's most trusted home services platform. Verified workers, MoMo payments, live tracking.

## 🚀 Quick Deploy to GitHub Pages (Free Hosting)

### What You Need
- A free GitHub account → [github.com](https://github.com)
- Your website files (this folder)

---

## 📋 Step-by-Step Deployment Guide

### OPTION A: Upload via GitHub Website (No coding needed ✅)

**Step 1 — Create a GitHub account**
1. Go to [github.com](https://github.com)
2. Click **Sign up**
3. Enter your email, create a password, choose a username
4. Verify your email

**Step 2 — Create a New Repository**
1. Click the **+** icon (top right) → **New repository**
2. Repository name: `quickserve-pro` (or any name you like)
3. ✅ Set to **Public**
4. ✅ Check **"Add a README file"**
5. Click **Create repository**

**Step 3 — Upload Your Files**
1. On your repository page, click **Add file** → **Upload files**
2. Drag and drop ALL these files/folders:
   ```
   index.html
   css/
     styles.css
   js/
     app.js
   README.md
   ```
3. Scroll down, write a commit message: `"Initial upload"`
4. Click **Commit changes**

**Step 4 — Enable GitHub Pages**
1. Go to your repository → click **Settings** tab
2. Scroll down to **Pages** (left sidebar)
3. Under **Source** → select **Deploy from a branch**
4. Branch: **main** | Folder: **/ (root)**
5. Click **Save**
6. Wait 2–3 minutes

**Step 5 — Get Your Live URL**
Your site will be live at:
```
https://YOUR-USERNAME.github.io/quickserve-pro/
```
Example: `https://bonnymukasa.github.io/quickserve-pro/`

---

### OPTION B: Using GitHub Desktop App (Easier for ongoing updates)

1. Download **GitHub Desktop** → [desktop.github.com](https://desktop.github.com)
2. Install and sign in with your GitHub account
3. Click **File** → **New Repository**
   - Name: `quickserve-pro`
   - Local path: Choose where your files are saved
4. Click **Create Repository**
5. Copy your website files into that folder
6. In GitHub Desktop, you'll see the files listed
7. Write a summary: `"Initial upload"` → Click **Commit to main**
8. Click **Publish repository** (top bar)
9. Enable GitHub Pages as in Step 4 above

---

### OPTION C: Using Git Command Line (Most powerful)

```bash
# Install Git from: https://git-scm.com

# 1. Open terminal in your project folder
git init
git add .
git commit -m "Initial upload: QuickServe Pro website"

# 2. Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR-USERNAME/quickserve-pro.git
git branch -M main
git push -u origin main

# 3. Enable GitHub Pages in repository Settings
```

---

## 📁 Required File Structure

Your repository MUST have this exact structure:

```
quickserve-pro/          ← Root (repository)
│
├── index.html           ← Main website file (REQUIRED)
├── css/
│   └── styles.css       ← All styles (REQUIRED)
├── js/
│   └── app.js           ← All JavaScript (REQUIRED)
└── README.md            ← This file
```

⚠️ **Important:** `index.html` must be in the ROOT folder (not inside a subfolder).

---

## 🔄 How to Update Your Website

**Via GitHub Website:**
1. Go to your repository
2. Click on the file you want to edit
3. Click the ✏️ pencil icon
4. Make your changes
5. Click **Commit changes**
6. Wait 1-2 minutes → your site updates automatically

**Via GitHub Desktop:**
1. Edit your local files
2. Open GitHub Desktop → you'll see changes listed
3. Write commit message → **Commit to main**
4. Click **Push origin**

---

## 🌐 Custom Domain (Optional — looks professional)

To use `www.quickservepro.ug` instead of the github.io URL:

1. Buy a domain from a Ugandan registrar or [Namecheap](https://namecheap.com)
2. In GitHub Pages settings → **Custom domain** → enter your domain
3. In your domain registrar DNS settings, add:
   ```
   Type: CNAME
   Name: www
   Value: YOUR-USERNAME.github.io
   ```
4. Wait 24-48 hours for DNS to propagate
5. ✅ Check **Enforce HTTPS** in GitHub Pages settings

---

## ⚡ Other Free Hosting Options

| Platform | Speed | Custom Domain | Notes |
|----------|-------|---------------|-------|
| **GitHub Pages** | Fast | Free with DNS | Best for beginners |
| **Netlify** | Very Fast | Free | Drag & drop deploy |
| **Vercel** | Very Fast | Free | Great for performance |
| **Cloudflare Pages** | Fastest | Free | Best global CDN |

### Deploy to Netlify (Even Easier):
1. Go to [netlify.com](https://netlify.com) → Sign up free
2. Drag your entire project folder onto the page
3. Get instant live URL like `quickserve-pro.netlify.app`
4. Done ✅

---

## 🔧 Making Changes to the Website

### Change Business Phone Number:
Search for `+256 700 000 000` in `index.html` → replace with your number

### Change WhatsApp Number:
Search for `Opening WhatsApp...` in `js/app.js` → replace with:
```javascript
window.open('https://wa.me/256700000000', '_blank');
```

### Change Prices:
Search for `UGX 8,000` etc. in `index.html` → update to your actual prices

### Add Your Real Logo:
Replace the `logo-mark` div with an `<img>` tag:
```html
<img src="assets/logo.png" alt="QuickServe Pro" style="height:36px">
```

---

## 📱 Mobile Performance Tips

The site is already mobile-optimised but for best results:
- Keep images under 200KB each
- Use WebP format for photos
- Test on actual Android devices (most Uganda users)

---

## 🛠️ Tech Stack

- **HTML5** — Structure
- **CSS3** — Styling with CSS Variables (no framework needed)
- **Vanilla JavaScript** — All interactions (no jQuery, loads fast)
- **Google Fonts** — Poppins + Plus Jakarta Sans

**No backend required** for the static site. For real bookings/payments, you'll need:
- Firebase (free tier) — user auth + database
- Flutterwave or MTN MoMo Developer API — payments
- Node.js backend — advanced features

---

## 📞 Support

For technical help with deployment, contact your developer or search:
- "How to deploy to GitHub Pages" on YouTube
- GitHub's official documentation: [docs.github.com/pages](https://docs.github.com/pages)

---

*QuickServe Pro — Uganda's Most Trusted Home Services Platform*
*Built with ❤️ for Kampala*
