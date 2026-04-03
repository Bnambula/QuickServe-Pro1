/**
 * QuickServe Pro — Production Server
 * Node.js + Express | Render.com Deployment
 */

require('dotenv').config();
const express    = require('express');
const session    = require('express-session');
const bcrypt     = require('bcryptjs');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ═══════════════════════════════════════════════
   IN-MEMORY DATABASE (replace with PostgreSQL
   or MongoDB in full production)
═══════════════════════════════════════════════ */
const DB = {
  users: [],          // { id, email, passwordHash, role, fullName, phone, createdAt, termsAccepted, legalRecord, status }
  workers: [],        // { id, userId, nin, service, area, status, faceScore, idFront, idBack, selfie, riskScore, submittedAt }
  jobs: [],           // { id, customerId, workerId, service, status, amount, createdAt }
  disputes: [],       // { id, jobId, type, description, status, createdAt }
  smsLog: [],         // { id, to, message, type, sentAt }
  legalRecords: [],   // { id, userId, email, signedName, timestamp, ip, device, termsVersion }
  otpStore: {},       // { email: { code, expiresAt } }
  sessions: {},       // track active sessions
};

/* ─── Seed demo data ─── */
(async () => {
  const hash = await bcrypt.hash('admin2025', 10);
  DB.users.push({
    id: 'admin-001', email: 'admin@quickservepro.ug',
    passwordHash: hash, role: 'admin', fullName: 'Super Admin',
    phone: '+256700000000', status: 'active',
    createdAt: new Date().toISOString(),
  });
  DB.workers.push(
    { id: 'w-001', userId: 'u-demo-1', fullName: 'Grace Namukasa', nin: 'CM98765001KZAM', service: 'House Cleaning', area: 'Ntinda', status: 'pending', faceScore: 94, riskScore: 0, phone: '+256772111222', submittedAt: new Date(Date.now()-7200000).toISOString() },
    { id: 'w-002', userId: 'u-demo-2', fullName: 'Moses Kizito',   nin: 'CM98765002KZAM', service: 'Car Washing',    area: 'Kira',   status: 'pending', faceScore: 78, riskScore: 0, phone: '+256702333444', submittedAt: new Date(Date.now()-18000000).toISOString() },
    { id: 'w-003', userId: 'u-demo-3', fullName: 'Alice Mutesi',   nin: 'CM98765003KZAM', service: 'Laundry',        area: 'Bukoto', status: 'pending', faceScore: 52, riskScore: 1, phone: '+256752555666', submittedAt: new Date(Date.now()-86400000).toISOString() },
    { id: 'w-004', userId: 'u-demo-4', fullName: 'Patrick Ssekandi', nin: 'CM98765004KZAM', service: 'Car Washing', area: 'Naalya', status: 'verified', faceScore: 97, riskScore: 0, phone: '+256700777888', submittedAt: new Date(Date.now()-172800000).toISOString() }
  );
  DB.legalRecords.push(
    { id: 'lr-001', email: 'annet@gmail.com', signedName: 'Annet Mutesi Nakato', role: 'customer', timestamp: '2025-06-15T09:34:22Z', ip: '197.239.45.12', device: 'Chrome/Mobile · Android', termsVersion: 'v2025-01' },
    { id: 'lr-002', email: 'grace@yahoo.com',  signedName: 'Grace Namukasa Ssali',  role: 'provider', timestamp: '2025-06-14T14:21:09Z', ip: '41.210.188.77',  device: 'Safari/iPhone · iOS',  termsVersion: 'v2025-01' }
  );
})();

/* ═══════════════════════════════════════════════
   MIDDLEWARE
═══════════════════════════════════════════════ */

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "https://images.unsplash.com"],
      connectSrc: ["'self'"],
    },
  },
}));

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'qsp-secret-change-in-production-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax',
  },
}));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many attempts. Try again in 15 minutes.' } });
const apiLimiter  = rateLimit({ windowMs: 60 * 1000,       max: 100 });
app.use('/api/auth', authLimiter);
app.use('/api',      apiLimiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

/* ═══════════════════════════════════════════════
   MIDDLEWARE: Auth Guards
═══════════════════════════════════════════════ */
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
}

/* ═══════════════════════════════════════════════
   SMS SIMULATOR
   In production: use Africa's Talking API
   POST https://api.africastalking.com/version1/messaging
═══════════════════════════════════════════════ */
function sendSMS(to, message, type = 'system') {
  const entry = { id: uuidv4(), to, message, type, sentAt: new Date().toISOString() };
  DB.smsLog.push(entry);
  console.log(`\n📱 [SMS GATEWAY → ${to}]\n   ${message}\n`);
  // In production:
  // const AT = require('africastalking')({ apiKey: process.env.AT_API_KEY, username: process.env.AT_USERNAME });
  // await AT.SMS.send({ to: [to], message, from: 'QuickServe' });
  return entry;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ═══════════════════════════════════════════════
   AUTH ROUTES — /api/auth/*
═══════════════════════════════════════════════ */

// POST /api/auth/signup — Step 1
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (DB.users.find(u => u.email === email.toLowerCase())) return res.status(409).json({ error: 'An account with this email already exists' });

    // Generate and store OTP
    const otp = generateOTP();
    DB.otpStore[email.toLowerCase()] = { code: otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10min
    sendSMS('+256700000000', `Your QuickServe Pro verification code is: ${otp}. Valid for 10 minutes.`, 'otp');
    console.log(`\n📧 [EMAIL → ${email}] Verification code: ${otp}\n`);

    res.json({ success: true, message: 'Verification code sent to your email', email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify-otp — Step 2
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const stored = DB.otpStore[email?.toLowerCase()];
  if (!stored) return res.status(400).json({ error: 'No OTP found. Please sign up again.' });
  if (Date.now() > stored.expiresAt) return res.status(400).json({ error: 'OTP expired. Please request a new code.' });
  // Accept exact match OR any 6-digit code in demo mode
  if (stored.code !== otp && process.env.NODE_ENV === 'production')
    return res.status(400).json({ error: 'Incorrect verification code' });
  delete DB.otpStore[email.toLowerCase()];
  res.json({ success: true, message: 'Email verified' });
});

// POST /api/auth/resend-otp
app.post('/api/auth/resend-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const otp = generateOTP();
  DB.otpStore[email.toLowerCase()] = { code: otp, expiresAt: Date.now() + 10 * 60 * 1000 };
  console.log(`\n📧 [EMAIL → ${email}] New OTP: ${otp}\n`);
  res.json({ success: true, message: 'New code sent' });
});

// POST /api/auth/accept-terms — Step 3
app.post('/api/auth/accept-terms', async (req, res) => {
  try {
    const { email, password, signedName, termsVersion = 'v2025-01' } = req.body;
    if (!email || !password || !signedName) return res.status(400).json({ error: 'All fields required' });

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const device = req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 120) : 'unknown';
    const now = new Date().toISOString();

    // Create legal record
    const legalRecord = { userId, email: email.toLowerCase(), signedName, termsVersion, timestamp: now, ip, device };
    DB.legalRecords.push({ id: uuidv4(), ...legalRecord, role: 'pending' });

    // Store user (not yet role-assigned)
    DB.users.push({
      id: userId, email: email.toLowerCase(), passwordHash,
      fullName: signedName, role: null, status: 'pending_role',
      createdAt: now, legalRecord,
    });

    req.session.tempUserId = userId;
    res.json({ success: true, userId, message: 'Terms accepted. Legal record stored.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/set-role — Step 4
app.post('/api/auth/set-role', (req, res) => {
  const { userId, role, phone } = req.body;
  if (!userId || !role) return res.status(400).json({ error: 'userId and role required' });
  if (!['customer', 'provider'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  const user = DB.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.role = role;
  user.phone = phone || '';
  user.status = 'active';

  // Update legal record role
  const lr = DB.legalRecords.find(r => r.userId === userId);
  if (lr) lr.role = role;

  // Create session
  req.session.userId = userId;
  req.session.role = role;
  req.session.email = user.email;

  // Send welcome SMS
  const welcomeMsg = role === 'customer'
    ? `Welcome to QuickServe Pro, ${user.fullName.split(' ')[0]}! 🎉 Your account is active. Book trusted home services at quickservepro.ug`
    : `Welcome to QuickServe Pro, ${user.fullName.split(' ')[0]}! 👷 Complete your provider profile to start earning. Login at quickservepro.ug`;

  if (phone) sendSMS(phone, welcomeMsg, 'welcome');

  res.json({ success: true, role, redirect: role === 'customer' ? '/index.html' : '/register.html' });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = DB.users.find(u => u.email === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (user.status === 'banned') return res.status(403).json({ error: 'Account suspended. Contact support.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = user.email;
    if (rememberMe) req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;

    // Send login alert SMS
    if (user.phone) {
      sendSMS(user.phone, `QuickServe Pro: New login detected on your account from ${req.ip}. If this wasn't you, change your password immediately.`, 'login_alert');
    }

    res.json({ success: true, role: user.role, email: user.email, name: user.fullName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = DB.users.find(u => u.email === email?.toLowerCase());
  if (user) {
    const resetToken = uuidv4();
    console.log(`\n📧 [PASSWORD RESET → ${email}] Token: ${resetToken}\n`);
    // In production: store token with expiry, send email with link
  }
  // Always respond the same way (security: don't reveal if email exists)
  res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = DB.users.find(u => u.id === req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, role: user.role, fullName: user.fullName, status: user.status });
});

/* ═══════════════════════════════════════════════
   WORKER ROUTES — /api/workers/*
═══════════════════════════════════════════════ */

// GET all workers (admin)
app.get('/api/workers', requireAdmin, (req, res) => {
  const { status } = req.query;
  const workers = status ? DB.workers.filter(w => w.status === status) : DB.workers;
  res.json({ workers, total: workers.length });
});

// GET pending count
app.get('/api/workers/pending-count', requireAdmin, (req, res) => {
  res.json({ count: DB.workers.filter(w => w.status === 'pending').length });
});

// POST approve worker
app.post('/api/workers/:id/approve', requireAdmin, (req, res) => {
  const worker = DB.workers.find(w => w.id === req.params.id);
  if (!worker) return res.status(404).json({ error: 'Worker not found' });
  const { note } = req.body;

  worker.status = 'verified';
  worker.approvedAt = new Date().toISOString();
  worker.approvedBy = req.session.email;
  worker.adminNote = note || '';

  const smsMsg = `✅ Congratulations ${worker.fullName.split(' ')[0]}! Your QuickServe Pro worker account has been APPROVED. You can now accept jobs in your area. Login at quickservepro.ug to start earning. Welcome to the team!`;
  const smsEntry = sendSMS(worker.phone, smsMsg, 'worker_approved');

  console.log(`\n✅ ADMIN ACTION: Approved worker ${worker.fullName} (${worker.id})\n   Admin: ${req.session.email}\n   SMS sent: ${smsEntry.id}\n`);

  res.json({ success: true, worker, smsSent: true, smsId: smsEntry.id, message: `${worker.fullName} approved. SMS sent to ${worker.phone}` });
});

// POST reject worker
app.post('/api/workers/:id/reject', requireAdmin, (req, res) => {
  const worker = DB.workers.find(w => w.id === req.params.id);
  if (!worker) return res.status(404).json({ error: 'Worker not found' });
  const { reason, details, canReapply } = req.body;
  if (!reason) return res.status(400).json({ error: 'Rejection reason is required' });

  worker.status = 'rejected';
  worker.rejectedAt = new Date().toISOString();
  worker.rejectedBy = req.session.email;
  worker.rejectionReason = reason;
  worker.rejectionDetails = details || '';
  worker.canReapply = canReapply || 'yes';

  const reapplyText = canReapply === 'yes'
    ? 'You may submit a new application with correct documents.'
    : canReapply === '30days' ? 'You may re-apply after 30 days.'
    : 'This decision is final and cannot be appealed.';

  const smsMsg = `⚠️ QuickServe Pro: Your application was not approved. Reason: ${reason}. ${details ? details + ' ' : ''}${reapplyText} Questions? Email support@quickservepro.ug`;
  const smsEntry = sendSMS(worker.phone, smsMsg, 'worker_rejected');

  console.log(`\n❌ ADMIN ACTION: Rejected worker ${worker.fullName}\n   Reason: ${reason}\n   Admin: ${req.session.email}\n   SMS: ${smsEntry.id}\n`);

  res.json({ success: true, worker, smsSent: true, smsId: smsEntry.id, message: `${worker.fullName} rejected. SMS sent to ${worker.phone}` });
});

// POST request more info
app.post('/api/workers/:id/request-info', requireAdmin, (req, res) => {
  const worker = DB.workers.find(w => w.id === req.params.id);
  if (!worker) return res.status(404).json({ error: 'Worker not found' });
  const { requirements, customMessage, deadline } = req.body;
  if (!requirements?.length && !customMessage) return res.status(400).json({ error: 'At least one requirement or message needed' });

  worker.status = 'more_info_required';
  worker.infoRequestedAt = new Date().toISOString();
  worker.infoRequirements = requirements || [];
  worker.infoDeadline = deadline || '48hrs';

  const reqList = (requirements || []).join(', ');
  const smsMsg = `📋 QuickServe Pro needs more information for your worker application.${reqList ? ' Required: ' + reqList + '.' : ''} ${customMessage ? customMessage + ' ' : ''}Please log in and resubmit within ${deadline || '48 hours'} at quickservepro.ug`;
  const smsEntry = sendSMS(worker.phone, smsMsg, 'worker_more_info');

  console.log(`\n📋 ADMIN ACTION: Requested info from ${worker.fullName}\n   Requirements: ${reqList}\n   Admin: ${req.session.email}\n   SMS: ${smsEntry.id}\n`);

  res.json({ success: true, worker, smsSent: true, smsId: smsEntry.id, message: `Info request sent to ${worker.fullName}. SMS delivered to ${worker.phone}` });
});

/* ═══════════════════════════════════════════════
   LEGAL AUDIT — /api/legal/*
═══════════════════════════════════════════════ */
app.get('/api/legal/records', requireAdmin, (req, res) => {
  res.json({ records: DB.legalRecords, total: DB.legalRecords.length });
});

/* ═══════════════════════════════════════════════
   SMS LOG — /api/sms/*
═══════════════════════════════════════════════ */
app.get('/api/sms/log', requireAdmin, (req, res) => {
  res.json({ log: DB.smsLog.slice(-50).reverse(), total: DB.smsLog.length });
});

/* ═══════════════════════════════════════════════
   ADMIN STATS — /api/admin/*
═══════════════════════════════════════════════ */
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json({
    totalWorkers:      DB.workers.length,
    pendingWorkers:    DB.workers.filter(w => w.status === 'pending').length,
    verifiedWorkers:   DB.workers.filter(w => w.status === 'verified').length,
    totalUsers:        DB.users.filter(u => u.role !== 'admin').length,
    totalJobs:         DB.jobs.length,
    openDisputes:      DB.disputes.filter(d => d.status === 'open').length,
    totalLegalRecords: DB.legalRecords.length,
    smsSent:           DB.smsLog.length,
  });
});

/* ═══════════════════════════════════════════════
   HEALTH CHECK
═══════════════════════════════════════════════ */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'QuickServe Pro API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

/* ═══════════════════════════════════════════════
   SERVE HTML PAGES
═══════════════════════════════════════════════ */
app.get('/',           (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/auth',       (req, res) => res.sendFile(path.join(__dirname, 'public', 'auth.html')));
app.get('/register',   (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/admin',      (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html')));
app.get('/admin/*',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html')));

// 404 fallback
app.use((req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API endpoint not found' });
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

/* ═══════════════════════════════════════════════
   START SERVER
═══════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`\n🚀 QuickServe Pro Server`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
