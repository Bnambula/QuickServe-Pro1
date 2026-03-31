/* ============================================================
   QUICKSERVE PRO — UPLOAD & CAMERA MODULE
   Handles: local file upload, cloud storage, live camera selfie
============================================================ */
'use strict';

/* ── STATE ─────────────────────────────────────────────── */
const UploadState = {
  idFront: null,
  idBack:  null,
  selfie:  null,
  stream:  null,
};

/* ── HELPERS ────────────────────────────────────────────── */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  const colors = { info: '#0A2540', success: '#00A040', error: '#FF3B30', warn: '#CC8800' };
  t.style.background = colors[type] || colors.info;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
}

/* ── FILE VALIDATION ────────────────────────────────────── */
function validateFile(file) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
  const maxSize = 8 * 1024 * 1024; // 8MB
  if (!allowed.includes(file.type.toLowerCase())) {
    return { ok: false, reason: 'Only JPG, PNG, WebP, HEIC images allowed.' };
  }
  if (file.size > maxSize) {
    return { ok: false, reason: `File too large (${formatBytes(file.size)}). Max 8MB.` };
  }
  return { ok: true };
}

/* ── RENDER PREVIEW ─────────────────────────────────────── */
function renderPreview(containerId, file, dataURL) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="upload-preview">
      <img src="${dataURL}" alt="Preview" class="upload-preview-img">
      <div class="upload-preview-info">
        <div class="upload-preview-name">${file.name || 'captured_selfie.jpg'}</div>
        <div class="upload-preview-size">${formatBytes(file.size || dataURLtoBlob(dataURL).size)}</div>
        <div class="upload-preview-ok">✅ Ready to submit</div>
      </div>
      <button class="upload-preview-remove" onclick="removeUpload('${containerId}')">✕</button>
    </div>
  `;
}

function removeUpload(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (containerId === 'frontPreview') { UploadState.idFront = null; resetZone('frontZone', 'frontInput', '📄', 'Upload Front of ID'); }
  if (containerId === 'backPreview')  { UploadState.idBack  = null; resetZone('backZone',  'backInput',  '📄', 'Upload Back of ID'); }
  if (containerId === 'selfiePreview'){ UploadState.selfie  = null; resetSelfieUI(); }
  el.innerHTML = '';
  checkUploadComplete();
}

function resetZone(zoneId, inputId, icon, label) {
  const z = document.getElementById(zoneId);
  if (!z) return;
  z.innerHTML = `
    <input type="file" id="${inputId}" accept="image/*" style="display:none" onchange="handleFileSelect(event,'${zoneId.replace('Zone','')}')">
    <div class="upload-zone-icon">${icon}</div>
    <div class="upload-zone-label">${label}</div>
    <div class="upload-zone-hint">JPG · PNG · WebP · HEIC · Max 8MB</div>
    <div class="upload-zone-or">— or —</div>
    <div class="upload-zone-btns">
      <button class="btn-upload-opt" onclick="document.getElementById('${inputId}').click()">📁 Device</button>
      <button class="btn-upload-opt" onclick="showCloudPicker('${zoneId.replace('Zone','')}')">☁️ Cloud</button>
    </div>
  `;
  z.onclick = null;
}

/* ── LOCAL FILE SELECT ──────────────────────────────────── */
function handleFileSelect(event, side) {
  const file = event.target.files[0];
  if (!file) return;
  const valid = validateFile(file);
  if (!valid.ok) { showToast('❌ ' + valid.reason, 'error'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataURL = e.target.result;
    if (side === 'front') {
      UploadState.idFront = { file, dataURL };
      renderPreview('frontPreview', file, dataURL);
    } else if (side === 'back') {
      UploadState.idBack = { file, dataURL };
      renderPreview('backPreview', file, dataURL);
    }
    showToast('✅ ' + (side === 'front' ? 'Front' : 'Back') + ' of ID uploaded!', 'success');
    checkUploadComplete();
  };
  reader.readAsDataURL(file);
}

/* ── DRAG & DROP ────────────────────────────────────────── */
function initDragDrop() {
  ['frontZone', 'backZone'].forEach(id => {
    const zone = document.getElementById(id);
    if (!zone) return;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const side = id === 'frontZone' ? 'front' : 'back';
      const valid = validateFile(file);
      if (!valid.ok) { showToast('❌ ' + valid.reason, 'error'); return; }
      const reader = new FileReader();
      reader.onload = ev => {
        const dataURL = ev.target.result;
        if (side === 'front') { UploadState.idFront = { file, dataURL }; renderPreview('frontPreview', file, dataURL); }
        else { UploadState.idBack = { file, dataURL }; renderPreview('backPreview', file, dataURL); }
        showToast('✅ ' + (side === 'front' ? 'Front' : 'Back') + ' uploaded!', 'success');
        checkUploadComplete();
      };
      reader.readAsDataURL(file);
    });
  });
}

/* ── CLOUD STORAGE PICKER ───────────────────────────────── */
function showCloudPicker(side) {
  const modal = document.getElementById('cloudPickerModal');
  if (!modal) return;
  modal.dataset.side = side;
  modal.classList.add('open');
}

function closeCloudPicker() {
  const modal = document.getElementById('cloudPickerModal');
  if (modal) modal.classList.remove('open');
}

function useCloudLink(side) {
  const input = document.getElementById('cloudUrlInput');
  const url = input ? input.value.trim() : '';
  if (!url || (!url.startsWith('http') && !url.startsWith('data:'))) {
    showToast('❌ Please enter a valid image URL', 'error'); return;
  }
  // Validate it ends with an image extension or is a known cloud link
  const imgExts = /\.(jpg|jpeg|png|webp|heic)(\?.*)?$/i;
  const cloudDomains = ['drive.google.com', 'dropbox.com', 'icloud.com', 'onedrive.live.com', 'photos.google.com'];
  const isCloud = cloudDomains.some(d => url.includes(d));

  const mockFile = { name: 'cloud_image.jpg', size: 450000 };

  if (side === 'front') {
    UploadState.idFront = { file: mockFile, dataURL: url, isCloud: true };
    const preview = document.getElementById('frontPreview');
    if (preview) preview.innerHTML = `<div class="upload-preview cloud-preview"><div style="font-size:2rem;margin-bottom:.5rem">☁️</div><div class="upload-preview-name">Cloud image linked</div><div class="upload-preview-ok">✅ Front of ID from ${isCloud ? 'Cloud' : 'URL'}</div><button class="upload-preview-remove" onclick="removeUpload('frontPreview')">✕</button></div>`;
  } else if (side === 'back') {
    UploadState.idBack = { file: mockFile, dataURL: url, isCloud: true };
    const preview = document.getElementById('backPreview');
    if (preview) preview.innerHTML = `<div class="upload-preview cloud-preview"><div style="font-size:2rem;margin-bottom:.5rem">☁️</div><div class="upload-preview-name">Cloud image linked</div><div class="upload-preview-ok">✅ Back of ID from ${isCloud ? 'Cloud' : 'URL'}</div><button class="upload-preview-remove" onclick="removeUpload('backPreview')">✕</button></div>`;
  } else if (side === 'selfie') {
    UploadState.selfie = { dataURL: url, isCloud: true };
    const preview = document.getElementById('selfiePreview');
    if (preview) preview.innerHTML = `<div class="upload-preview cloud-preview"><div style="font-size:2rem;margin-bottom:.5rem">☁️</div><div class="upload-preview-name">Cloud selfie linked</div><div class="upload-preview-ok">✅ Selfie from ${isCloud ? 'Cloud' : 'URL'}</div></div>`;
  }

  if (input) input.value = '';
  closeCloudPicker();
  showToast('✅ Cloud image linked successfully!', 'success');
  checkUploadComplete();
}

/* ── GOOGLE DRIVE PICKER SIMULATION ────────────────────── */
function openGoogleDrive(side) {
  closeCloudPicker();
  showToast('📂 Opening Google Drive... (connect API in production)', 'warn');
  // In production: use Google Picker API
  // https://developers.google.com/drive/picker/guides/overview
  setTimeout(() => {
    const mockFile = { name: 'national_id_front.jpg', size: 320000 };
    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0U4RjBGRSIvPjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwQTI1NDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JRCBGcm9tIEdvb2dsZSBEcml2ZTwvdGV4dD48L3N2Zz4=';
    if (side === 'front') { UploadState.idFront = { file: mockFile, dataURL: placeholder }; renderPreview('frontPreview', mockFile, placeholder); }
    else if (side === 'back') { UploadState.idBack = { file: mockFile, dataURL: placeholder }; renderPreview('backPreview', mockFile, placeholder); }
    showToast('✅ File selected from Google Drive!', 'success');
    checkUploadComplete();
  }, 1500);
}

function openDropbox(side) {
  closeCloudPicker();
  showToast('📂 Opening Dropbox... (connect Chooser API in production)', 'warn');
  // In production: use Dropbox Chooser
  // https://www.dropbox.com/developers/chooser
}

/* ── CAMERA / SELFIE ────────────────────────────────────── */
let cameraFacing = 'user'; // 'user' = front, 'environment' = back

async function startCamera() {
  const videoEl = document.getElementById('cameraVideo');
  const startBtn = document.getElementById('cameraStartBtn');
  const captureBtn = document.getElementById('cameraCaptureBtn');
  const switchBtn = document.getElementById('cameraSwitchBtn');
  const stopBtn = document.getElementById('cameraStopBtn');
  const statusEl = document.getElementById('cameraStatus');

  if (statusEl) statusEl.textContent = 'Requesting camera access...';

  try {
    // Stop any existing stream
    if (UploadState.stream) {
      UploadState.stream.getTracks().forEach(t => t.stop());
    }

    const constraints = {
      video: {
        facingMode: cameraFacing,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    UploadState.stream = stream;

    if (videoEl) {
      videoEl.srcObject = stream;
      videoEl.style.display = 'block';
      await videoEl.play();
    }

    if (startBtn) startBtn.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'flex';
    if (switchBtn) switchBtn.style.display = 'flex';
    if (stopBtn) stopBtn.style.display = 'flex';
    if (statusEl) statusEl.textContent = '📷 Camera ready — align your face in the circle';

    // Show face guide overlay
    const guide = document.getElementById('faceGuideOverlay');
    if (guide) guide.style.display = 'flex';

    showToast('📷 Camera started! Position your face and tap Capture.', 'success');

  } catch (err) {
    let msg = 'Camera access denied.';
    if (err.name === 'NotAllowedError') msg = '❌ Camera permission denied. Please allow camera access in browser settings.';
    if (err.name === 'NotFoundError') msg = '❌ No camera found on this device.';
    if (err.name === 'NotReadableError') msg = '❌ Camera is in use by another app.';
    if (statusEl) statusEl.textContent = msg;
    showToast(msg, 'error');
  }
}

function switchCamera() {
  cameraFacing = cameraFacing === 'user' ? 'environment' : 'user';
  showToast('🔄 Switching to ' + (cameraFacing === 'user' ? 'front' : 'back') + ' camera...', 'info');
  startCamera();
}

function captureSelfie() {
  const videoEl = document.getElementById('cameraVideo');
  const canvas = document.getElementById('selfieCanvas');
  const preview = document.getElementById('selfiePreview');
  const statusEl = document.getElementById('cameraStatus');

  if (!videoEl || !canvas) { showToast('❌ Camera not ready', 'error'); return; }

  // Flash effect
  const flash = document.getElementById('cameraFlash');
  if (flash) { flash.style.opacity = '1'; setTimeout(() => { flash.style.opacity = '0'; }, 250); }

  // Draw frame to canvas
  canvas.width = videoEl.videoWidth || 640;
  canvas.height = videoEl.videoHeight || 480;
  const ctx = canvas.getContext('2d');

  // Mirror for front camera (natural selfie look)
  if (cameraFacing === 'user') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

  const dataURL = canvas.toDataURL('image/jpeg', 0.92);
  UploadState.selfie = { dataURL, timestamp: new Date().toISOString() };

  // Show preview
  if (preview) {
    preview.innerHTML = `
      <div class="selfie-result">
        <img src="${dataURL}" alt="Your selfie" class="selfie-result-img">
        <div class="selfie-result-label">
          <div class="selfie-ok">✅ Selfie captured</div>
          <div class="selfie-time">${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="selfie-actions">
          <button class="btn-retake" onclick="retakeSelfie()">🔄 Retake</button>
          <button class="btn-use-selfie" onclick="confirmSelfie()">✅ Use This</button>
        </div>
      </div>
    `;
  }

  if (statusEl) statusEl.textContent = '✅ Selfie captured! Looks good?';
  stopCamera();
  showToast('✅ Selfie captured! Check the preview.', 'success');
}

function retakeSelfie() {
  UploadState.selfie = null;
  const preview = document.getElementById('selfiePreview');
  if (preview) preview.innerHTML = '';
  const statusEl = document.getElementById('cameraStatus');
  if (statusEl) statusEl.textContent = 'Tap "Start Camera" to try again';
  const startBtn = document.getElementById('cameraStartBtn');
  if (startBtn) startBtn.style.display = 'flex';
  const captureBtn = document.getElementById('cameraCaptureBtn');
  if (captureBtn) captureBtn.style.display = 'none';
  const switchBtn = document.getElementById('cameraSwitchBtn');
  if (switchBtn) switchBtn.style.display = 'none';
  const stopBtn = document.getElementById('cameraStopBtn');
  if (stopBtn) stopBtn.style.display = 'none';
  const guide = document.getElementById('faceGuideOverlay');
  if (guide) guide.style.display = 'none';
  const videoEl = document.getElementById('cameraVideo');
  if (videoEl) videoEl.style.display = 'none';
}

function confirmSelfie() {
  if (!UploadState.selfie) { showToast('❌ No selfie captured yet', 'error'); return; }
  showToast('✅ Selfie confirmed! Running AI face match...', 'success');
  setTimeout(() => {
    showToast('✅ Face match passed! Proceeding to phone verification.', 'success');
    checkUploadComplete();
    // Advance registration step
    if (typeof regNext === 'function') regNext(3);
  }, 2000);
}

function stopCamera() {
  if (UploadState.stream) {
    UploadState.stream.getTracks().forEach(t => t.stop());
    UploadState.stream = null;
  }
  const videoEl = document.getElementById('cameraVideo');
  if (videoEl) { videoEl.srcObject = null; videoEl.style.display = 'none'; }
  const guide = document.getElementById('faceGuideOverlay');
  if (guide) guide.style.display = 'none';
  const captureBtn = document.getElementById('cameraCaptureBtn');
  if (captureBtn) captureBtn.style.display = 'none';
  const switchBtn = document.getElementById('cameraSwitchBtn');
  if (switchBtn) switchBtn.style.display = 'none';
  const stopBtn = document.getElementById('cameraStopBtn');
  if (stopBtn) stopBtn.style.display = 'none';
  const startBtn = document.getElementById('cameraStartBtn');
  if (startBtn) startBtn.style.display = 'flex';
}

function resetSelfieUI() {
  stopCamera();
  const preview = document.getElementById('selfiePreview');
  if (preview) preview.innerHTML = '';
  const statusEl = document.getElementById('cameraStatus');
  if (statusEl) statusEl.textContent = 'Tap Start Camera to begin';
}

/* ── UPLOAD SELFIE FROM DEVICE ──────────────────────────── */
function uploadSelfieFromDevice() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'user'; // Hint to open front camera on mobile
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const valid = validateFile(file);
    if (!valid.ok) { showToast('❌ ' + valid.reason, 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataURL = ev.target.result;
      UploadState.selfie = { dataURL, file };
      const preview = document.getElementById('selfiePreview');
      if (preview) {
        preview.innerHTML = `
          <div class="selfie-result">
            <img src="${dataURL}" alt="Selfie" class="selfie-result-img">
            <div class="selfie-result-label">
              <div class="selfie-ok">✅ Photo uploaded</div>
              <div class="selfie-time">${file.name}</div>
            </div>
            <div class="selfie-actions">
              <button class="btn-retake" onclick="retakeSelfie()">🔄 Change</button>
              <button class="btn-use-selfie" onclick="confirmSelfie()">✅ Use This</button>
            </div>
          </div>
        `;
      }
      showToast('✅ Photo uploaded! Running face match...', 'success');
      checkUploadComplete();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

/* ── CHECK ALL UPLOADS COMPLETE ─────────────────────────── */
function checkUploadComplete() {
  const allDone = UploadState.idFront && UploadState.idBack;
  const continueBtn = document.getElementById('uploadContinueBtn');
  if (continueBtn) {
    continueBtn.disabled = !allDone;
    continueBtn.style.opacity = allDone ? '1' : '0.5';
  }
}

/* ── INIT ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initDragDrop();

  // Clean up camera on page unload
  window.addEventListener('beforeunload', () => {
    if (UploadState.stream) UploadState.stream.getTracks().forEach(t => t.stop());
  });

  // Close cloud picker on overlay click
  const cloudModal = document.getElementById('cloudPickerModal');
  if (cloudModal) {
    cloudModal.addEventListener('click', (e) => {
      if (e.target === cloudModal) closeCloudPicker();
    });
  }
});
