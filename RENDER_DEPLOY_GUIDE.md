# QuickServe Pro — Render.com Deployment Guide
# Complete Step-by-Step Instructions

---

## WHAT IS RENDER?

Render is a cloud platform (like Netlify but for full backend apps).
- Netlify = static websites only (HTML/CSS/JS)
- Render = full Node.js server + database + backend logic

QuickServe Pro now has a REAL backend server, so it MUST deploy on Render.

---

## PROJECT STRUCTURE (Your files must look like this)

```
quickserve-pro/
│
├── server.js              ← Main server (Node.js / Express)
├── package.json           ← Dependencies list
├── .env.example           ← Template for environment variables
├── .gitignore             ← Files to exclude from Git
│
└── public/                ← All frontend HTML files
    ├── index.html         ← Main homepage
    ├── auth.html          ← Sign up / Sign in pages
    ├── register.html      ← Worker registration
    ├── 404.html           ← Error page
    │
    └── admin/
        └── index.html     ← Admin dashboard
```

---

## ═══════════════════════════════════════════════════════════
## STEP 1 — UPLOAD FILES TO GITHUB
## ═══════════════════════════════════════════════════════════

### 1A. Create a GitHub account (if you don't have one)
1. Go to → https://github.com
2. Click "Sign up" → Enter email, password, username
3. Verify your email ✅

### 1B. Create a new repository
1. Click the "+" icon (top right) → "New repository"
2. Name: quickserve-pro
3. Set to: PUBLIC ✅
4. DO NOT check "Add a README" ❌
5. Click "Create repository"

### 1C. Upload ALL your files
1. On your empty repo page, click "uploading an existing file"
2. Drag and drop the ENTIRE quickserve-pro folder
3. Make sure this structure is correct:
   - server.js (in root)
   - package.json (in root)
   - .env.example (in root)
   - .gitignore (in root)
   - public/index.html (in public folder)
   - public/auth.html (in public folder)
   - public/admin/index.html (in admin folder)
4. Add commit message: "QuickServe Pro v1 - Initial upload"
5. Click "Commit changes" ✅

---

## ═══════════════════════════════════════════════════════════
## STEP 2 — CREATE RENDER ACCOUNT
## ═══════════════════════════════════════════════════════════

1. Go to → https://render.com
2. Click "Get Started for Free"
3. Click "Sign up with GitHub" (IMPORTANT — use GitHub to sign up)
4. Authorize Render to access your GitHub ✅
5. You are now in the Render Dashboard

---

## ═══════════════════════════════════════════════════════════
## STEP 3 — CREATE A NEW WEB SERVICE ON RENDER
## ═══════════════════════════════════════════════════════════

1. In Render Dashboard, click "New +" → "Web Service"

2. Connect your repository:
   - Click "Connect a repository"
   - Find "quickserve-pro" in the list
   - Click "Connect" ✅

3. Configure the service:

   ┌─────────────────────────────────────────────────────────┐
   │ Name:            quickserve-pro                         │
   │ Region:          Frankfurt (EU) or closest to Uganda    │
   │ Branch:          main                                   │
   │ Runtime:         Node                                   │
   │ Build Command:   npm install                            │
   │ Start Command:   npm start                              │
   │ Instance Type:   Free (for now)                         │
   └─────────────────────────────────────────────────────────┘

4. Click "Create Web Service" 🚀

5. Render will now:
   - Pull your code from GitHub
   - Run: npm install
   - Run: npm start
   - Assign you a URL like: https://quickserve-pro.onrender.com

6. Wait 3-5 minutes for first deploy ⏳

7. When you see "Your service is live" ✅ → click your URL!

---

## ═══════════════════════════════════════════════════════════
## STEP 4 — SET ENVIRONMENT VARIABLES (CRITICAL)
## ═══════════════════════════════════════════════════════════

Your server needs secret keys to run properly.
These are NOT uploaded to GitHub for security reasons.
You set them directly in Render.

### How to add environment variables:
1. In Render dashboard, click your "quickserve-pro" service
2. Click the "Environment" tab on the left
3. Click "Add Environment Variable" for each one below:

| Key               | Value                                    | Required? |
|-------------------|------------------------------------------|-----------|
| NODE_ENV          | production                               | YES       |
| SESSION_SECRET    | (generate below)                         | YES       |
| FRONTEND_URL      | https://quickserve-pro.onrender.com      | YES       |
| AT_API_KEY        | (from Africa's Talking)                  | NO*       |
| AT_USERNAME       | (from Africa's Talking)                  | NO*       |

*SMS will be simulated (logged to console) without these.
Add them later when ready for real SMS delivery.

### Generate your SESSION_SECRET:
Go to: https://randomkeygen.com
Copy a "CodeIgniter Encryption Keys" value (256-bit)
Paste it as your SESSION_SECRET value

4. Click "Save Changes"
5. Render will automatically restart your server with the new keys ✅

---

## ═══════════════════════════════════════════════════════════
## STEP 5 — VERIFY YOUR DEPLOYMENT
## ═══════════════════════════════════════════════════════════

Test these URLs after deployment:

| URL                                          | Should Show                |
|----------------------------------------------|----------------------------|
| https://quickserve-pro.onrender.com/         | Main homepage              |
| https://quickserve-pro.onrender.com/auth     | Sign up / Sign in page     |
| https://quickserve-pro.onrender.com/admin    | Admin dashboard            |
| https://quickserve-pro.onrender.com/health   | {"status":"ok",...}        |
| https://quickserve-pro.onrender.com/register | Worker registration        |

If /health returns {"status":"ok"} → your server is working! ✅

---

## ═══════════════════════════════════════════════════════════
## STEP 6 — CUSTOM DOMAIN (Optional but professional)
## ═══════════════════════════════════════════════════════════

To use www.quickservepro.ug instead of .onrender.com:

1. In Render → Your Service → "Settings" tab
2. Scroll to "Custom Domains"
3. Click "Add Custom Domain"
4. Enter: quickservepro.ug
5. Render gives you DNS records to add

6. Go to your domain registrar (where you bought the domain)
7. Add these DNS records:

   Type: CNAME
   Name: www
   Value: quickserve-pro.onrender.com

   Type: A
   Name: @ (root)
   Value: (Render will show you the IP)

8. Wait 24-48 hours for DNS to update worldwide
9. HTTPS is automatically enabled (free Let's Encrypt SSL) ✅

---

## ═══════════════════════════════════════════════════════════
## STEP 7 — HOW TO UPDATE YOUR SITE (Auto-Deploy)
## ═══════════════════════════════════════════════════════════

Render = GitHub integration = Auto-deploy!

Every time you push/upload changes to GitHub → Render detects it
→ Rebuilds and redeploys automatically within 2-3 minutes.

### To update a file:
1. Go to your GitHub repository
2. Click on the file you want to change
3. Click the pencil ✏️ icon to edit
4. Make your changes
5. Click "Commit changes"
6. Render auto-deploys → live in ~2 minutes ✅

---

## ═══════════════════════════════════════════════════════════
## STEP 8 — SET UP REAL SMS (Africa's Talking)
## ═══════════════════════════════════════════════════════════

Currently SMS is simulated (messages appear in server logs).
To send REAL SMS to Ugandan phone numbers:

1. Go to → https://africastalking.com
2. Click "Get Started for Free"
3. Register with your Uganda phone number
4. Go to Dashboard → API Key → Copy your API key
5. Note your username (shown in dashboard)

6. In Render → Environment Variables, add:
   AT_API_KEY = (your Africa's Talking API key)
   AT_USERNAME = (your Africa's Talking username)
   AT_SENDER_ID = QuickServe

7. In server.js, uncomment the Africa's Talking code:
   (Search for "In production:" in server.js)

8. Install the package: add to package.json dependencies:
   "africastalking": "^0.4.0"

9. Cost: approximately UGX 100-200 per SMS (very affordable)
10. Free test credits available when you sign up ✅

---

## ═══════════════════════════════════════════════════════════
## TROUBLESHOOTING
## ═══════════════════════════════════════════════════════════

Problem: "Build failed" on Render
→ Check your package.json — make sure "start": "node server.js" is there
→ Look at Render logs for the error message

Problem: Site loads but shows error
→ Go to Render → Your Service → "Logs" tab
→ Look for red error messages

Problem: /auth works but login fails
→ Make sure SESSION_SECRET is set in Environment Variables
→ Make sure NODE_ENV=production is set

Problem: Admin login not working
→ Demo credentials: admin@quickservepro.ug / admin2025
→ These are seeded automatically when server starts

Problem: "Service unavailable" after 30 minutes
→ Free Render tier "sleeps" after 15 minutes of no traffic
→ First request after sleep takes 30-60 seconds to wake up
→ Upgrade to Starter ($7/month) to keep it always-on

Problem: SMS not sending
→ Check Render logs for "[SMS GATEWAY]" entries
→ If using Africa's Talking, verify your API key is correct
→ Check your AT account has credits

---

## ═══════════════════════════════════════════════════════════
## QUICK REFERENCE
## ═══════════════════════════════════════════════════════════

| Platform          | URL                              |
|-------------------|----------------------------------|
| GitHub            | https://github.com               |
| Render            | https://render.com               |
| Africa's Talking  | https://africastalking.com       |
| Your Live Site    | https://quickserve-pro.onrender.com |
| Admin Panel       | https://quickserve-pro.onrender.com/admin |
| Health Check      | https://quickserve-pro.onrender.com/health |

Admin Login (Demo):
  Email:    admin@quickservepro.ug
  Password: admin2025

API Endpoints:
  POST /api/auth/signup         Sign up step 1
  POST /api/auth/verify-otp     Verify email
  POST /api/auth/accept-terms   Accept terms + signature
  POST /api/auth/set-role       Choose role
  POST /api/auth/login          Sign in
  POST /api/auth/logout         Sign out
  GET  /api/auth/me             Current user
  GET  /api/workers             All workers (admin)
  POST /api/workers/:id/approve Approve + SMS (admin)
  POST /api/workers/:id/reject  Reject + SMS (admin)
  POST /api/workers/:id/request-info  Request info + SMS (admin)
  GET  /api/legal/records       Legal audit trail (admin)
  GET  /api/sms/log             SMS history (admin)
  GET  /api/admin/stats         Dashboard stats (admin)
  GET  /health                  Server health check

---

*QuickServe Pro — Uganda's Most Trusted Home Services Platform*
*Powered by Node.js + Express | Deployed on Render.com*
