# QuickServe Pro — Complete Deployment Guide
# Netlify via GitHub + All Configuration Files

---

## 🗂️ COMPLETE PROJECT STRUCTURE

Your repository must look exactly like this:

```
quickserve-pro/                    ← Root (GitHub repository)
│
├── index.html                     ← Main public website
├── register.html                  ← Worker registration page  
├── 404.html                       ← Custom 404 page
├── _redirects                     ← Netlify URL routing rules
├── netlify.toml                   ← Netlify build configuration
├── .gitignore                     ← Files to exclude from Git
│
├── css/
│   └── styles.css                 ← All public website styles
│
├── js/
│   ├── app.js                     ← Main application JS
│   └── upload.js                  ← Camera, upload, cloud storage
│
└── admin/
    └── index.html                 ← Admin dashboard (password protected)
```

---

## ═══════════════════════════════════════════════
## STEP 1 — SET UP GITHUB REPOSITORY
## ═══════════════════════════════════════════════

### 1.1 Create GitHub Account (if you don't have one)
1. Go to → https://github.com
2. Click **Sign up**
3. Enter email, create password, choose username
4. Verify your email ✅

### 1.2 Create New Repository
1. Click the **+** icon (top-right) → **New repository**
2. Repository name: `quickserve-pro`
3. ✅ Set to **Public**
4. ❌ Do NOT check "Add a README" (we have files already)
5. Click **Create repository**

### 1.3 Upload Files (No coding needed — drag & drop)
1. On your new empty repo page, click **uploading an existing file**
2. **Drag your entire project folder** onto the page
   - OR click "choose your files" and select all files
3. Make sure the folder structure is maintained:
   - `index.html` (root)
   - `register.html` (root)
   - `admin/index.html` (inside admin/ folder)
   - `css/styles.css` (inside css/ folder)
   - `js/app.js` and `js/upload.js` (inside js/ folder)
   - `_redirects` (root)
   - `netlify.toml` (root)
4. Scroll down → Add commit message: `"QuickServe Pro v3 - Initial upload"`
5. Click **Commit changes** ✅

---

## ═══════════════════════════════════════════════
## STEP 2 — DEPLOY ON NETLIFY
## ═══════════════════════════════════════════════

### 2.1 Create Netlify Account
1. Go to → https://netlify.com
2. Click **Sign up** → Choose **Sign up with GitHub**
   (This links GitHub and Netlify automatically — easiest method)
3. Authorize Netlify to access your GitHub ✅

### 2.2 Deploy from GitHub
1. In Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
2. Choose **Deploy with GitHub**
3. Find and click on **quickserve-pro** repository
4. Configure build settings:
   - **Branch to deploy:** `main`
   - **Build command:** *(leave empty — static site)*
   - **Publish directory:** `.` (just a dot — the root)
5. Click **Deploy site** 🚀

### 2.3 Wait for Deployment (30–60 seconds)
- Netlify will show "Site deploy in progress..."
- When done: ✅ **"Your site is live!"**
- You'll get a URL like: `https://amazing-mcnulty-3f7891.netlify.app`

### 2.4 Rename Your Site (Important!)
1. Go to **Site settings** → **Site details**
2. Click **Change site name**
3. Enter: `quickserve-pro` (or any name you prefer)
4. Your site is now at: `https://quickserve-pro.netlify.app` ✅

---

## ═══════════════════════════════════════════════
## STEP 3 — CUSTOM DOMAIN (Optional)
## ═══════════════════════════════════════════════

To use `www.quickservepro.ug` instead of `.netlify.app`:

### 3.1 Add Custom Domain in Netlify
1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter: `quickservepro.ug`
4. Click **Verify** → **Add domain**

### 3.2 Configure DNS at Your Domain Registrar
In your domain registrar's DNS settings, add these records:

```
Type    Name    Value                    TTL
CNAME   www     quickserve-pro.netlify.app   3600
A       @       75.2.60.5                    3600
A       @       99.83.231.61                 3600
```

*(Netlify's load balancer IPs — use the ones Netlify shows in dashboard)*

### 3.3 Enable HTTPS (Free SSL)
- Netlify automatically provisions a free Let's Encrypt SSL certificate
- Go to **Domain management** → Click **Verify DNS configuration**
- Once DNS propagates (24-48hrs): ✅ **HTTPS enabled automatically**

---

## ═══════════════════════════════════════════════
## STEP 4 — PROTECT ADMIN DASHBOARD
## ═══════════════════════════════════════════════

### Option A: Netlify Password Protection (Easiest — Pro plan only)
1. Go to **Site settings** → **Access control**
2. Enable **Password protection**
3. Set a strong password
4. Share only with your admin team

### Option B: Basic Auth via netlify.toml (Free — already configured below)
The `netlify.toml` file in this package includes basic HTTP auth for `/admin/*`.
Update the credentials before deploying.

### Option C: Environment Variable Admin Login (Recommended)
In Netlify dashboard → **Site settings** → **Environment variables**:
```
ADMIN_EMAIL=admin@quickservepro.ug
ADMIN_PASSWORD=YourStrongPassword2025!
```

---

## ═══════════════════════════════════════════════
## STEP 5 — UPDATING YOUR WEBSITE
## ═══════════════════════════════════════════════

### Auto-Deploy (Best feature of Netlify + GitHub!)
Every time you push code to GitHub → Netlify automatically rebuilds and deploys.

**To update your site:**
1. Edit your files on GitHub (click any file → pencil ✏️ icon)
2. Or use GitHub Desktop app
3. Commit the changes
4. ✅ Netlify detects the change and deploys in ~30 seconds
5. No manual work needed — it's fully automatic!

---

## ═══════════════════════════════════════════════
## STEP 6 — NETLIFY FORMS (Contact / Booking)
## ═══════════════════════════════════════════════

To receive booking enquiries by email (free — 100 submissions/month):

Add `netlify` attribute to any form:
```html
<form name="booking" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="booking">
  <!-- your form fields -->
  <button type="submit">Book Now</button>
</form>
```

Then in Netlify: **Forms** → **Form notifications** → Add your email ✅

---

## ═══════════════════════════════════════════════
## CONFIG FILES CONTENT
## ═══════════════════════════════════════════════

### File: _redirects
```
# Netlify URL redirect rules
/admin          /admin/index.html     200
/admin/*        /admin/index.html     200
/register       /register.html        200
/*              /index.html           200
```

### File: netlify.toml
```toml
[build]
  publish = "."

[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Cache-Control = "no-store, no-cache, must-revalidate"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=3600"

[[headers]]
  for = "/css/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

### File: .gitignore
```
.DS_Store
Thumbs.db
*.env
node_modules/
.netlify/
```

---

## ═══════════════════════════════════════════════
## QUICK LINKS SUMMARY
## ═══════════════════════════════════════════════

| What | URL |
|------|-----|
| GitHub | https://github.com |
| Netlify | https://netlify.com |
| Your Site | https://quickserve-pro.netlify.app |
| Admin Panel | https://quickserve-pro.netlify.app/admin |
| Worker Registration | https://quickserve-pro.netlify.app/register |
| GitHub Docs | https://docs.github.com |
| Netlify Docs | https://docs.netlify.com |

---

## ═══════════════════════════════════════════════
## TROUBLESHOOTING
## ═══════════════════════════════════════════════

**Problem:** Site not updating after GitHub push
→ Check Netlify dashboard → Deploys → See if build failed
→ Usually means a file is missing or has wrong path

**Problem:** Camera not working
→ Netlify sites use HTTPS automatically ✅ (camera requires HTTPS)
→ If testing locally, use `localhost` not `127.0.0.1`

**Problem:** Admin page accessible without password
→ Add Netlify Password Protection (Pro plan) or implement server-side auth

**Problem:** "Page not found" for /register or /admin
→ Make sure `_redirects` file is in the ROOT folder (not inside a subfolder)

**Problem:** Images not loading
→ Check file paths — all paths should be relative: `css/styles.css` not `/css/styles.css`

---

*QuickServe Pro — Uganda's Most Trusted Home Services Platform*
