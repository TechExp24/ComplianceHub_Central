// === Session + Welcome + Start State =========================================
document.addEventListener('DOMContentLoaded', () => {
  const loggedIn = sessionStorage.getItem('loggedIn');
  if (!loggedIn) {
    window.location.href = 'index.html';
    return;
  }
  document.body.style.display = 'block';

  // Fill welcome if present (safe for pages without it)
  const n = sessionStorage.getItem('userName') || 'User';
  const wn = document.getElementById('welcome-name');
  if (wn) wn.textContent = n;

  // Dashboard start state (only if these elements exist on the page)
  const mainBtns = document.getElementById('main-section-buttons');
  const topTabs  = document.getElementById('top-tabs');

  if (mainBtns || topTabs) {
    // Hide any pre-marked active sections
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    if (topTabs) topTabs.style.display = 'none';
    if (mainBtns) mainBtns.style.display = 'grid';
    document.body.classList.remove('tiles-hidden');
  }

  // Open section from query (?section=daily) when landing on a dashboard
  const p = new URLSearchParams(location.search);
  const sec = p.get('section');
  if (sec && typeof activateSection === 'function') {
    activateSection(sec);
  }
});

// === Top tabs map + navigation ===============================================
const tabMap = {
  'daily':     'btn-daily',
  'docs':      'btn-docs',
  'lessons':   'btn-lessons',
  'certs':     'btn-certs',
  'tutorials': 'btn-tutorials',
  'auditor':   'btn-audit'
};

function activateSection(id) {
  document.body.classList.add('tiles-hidden');
  const mainBtns = document.getElementById('main-section-buttons'); if (mainBtns) mainBtns.style.display='none';
  const disp     = document.getElementById('disposal-box');        if (disp)     disp.style.display='none';
  const tt       = document.getElementById('top-tabs');            if (tt)       tt.style.display='block';
  showTab(id);
}

function showTab(id) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  const btns = document.querySelectorAll('.tab-buttons button');
  btns.forEach(btn => btn.classList.remove('active'));

  const tabEl = document.getElementById(id);
  if (tabEl) tabEl.classList.add('active');

  const btnId = tabMap[id];
  const btnEl = btnId ? document.getElementById(btnId) : null;
  if (btnEl) btnEl.classList.add('active');

  const tt = document.getElementById('top-tabs');
  if (tt) tt.scrollIntoView({ behavior: 'smooth' });
}

// === T-codes (guarded so it won’t throw on pages without those IDs) ==========
function getTCode(date) {
  const dayLetter = date.toLocaleDateString('en-GB', { weekday: 'short' })[0].toUpperCase();
  const codeNum = date.getDate() + (date.getMonth() + 1);
  return `${dayLetter}${codeNum}`;
}
function formatFullDate(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' });
}
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  const cooked   = new Date(today);
  const disposal = new Date(today);  disposal.setDate(today.getDate() + 2);
  const expired  = new Date(today);  expired.setDate(today.getDate() - 2);

  const cookCode = document.getElementById('cook-code');
  const cookDate = document.getElementById('cook-date');
  const dispCode = document.getElementById('dispose-code');
  const dispDate = document.getElementById('dispose-date');
  const reminder = document.getElementById('reminder-code');

  if (cookCode) cookCode.textContent = getTCode(cooked);
  if (cookDate) cookDate.textContent = formatFullDate(cooked);
  if (dispCode) dispCode.textContent = getTCode(disposal);
  if (dispDate) dispDate.textContent = formatFullDate(disposal);
  if (reminder) reminder.textContent = getTCode(expired) + getTCode(today);
});

// === Logout (safe) ============================================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
  });
}

// === PIN modal ================================================================
const PINS = { tutorials: '2024', auditor: '1357' }; // change as needed

let _pinTarget = null, _pinBackdrop = null, _pinInput = null, _pinError = null;

function ensurePinModal(){
  if (_pinBackdrop) return;
  _pinBackdrop = document.createElement('div');
  _pinBackdrop.className = 'modal-backdrop';
  _pinBackdrop.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true">
      <h3>Enter PIN</h3>
      <p id="pin-error" style="color:#b00020;font-weight:600;min-height:1.2em"></p>
      <input id="pin-input" type="password" placeholder="PIN" inputmode="numeric" autocomplete="one-time-code" />
      <div class="modal-actions">
        <button class="btn secondary" id="pin-cancel">Cancel</button>
        <button class="btn" id="pin-submit">Enter</button>
      </div>
    </div>`;
  document.body.appendChild(_pinBackdrop);
  _pinInput = _pinBackdrop.querySelector('#pin-input');
  _pinError = _pinBackdrop.querySelector('#pin-error');
  _pinBackdrop.querySelector('#pin-cancel').addEventListener('click', closePinModal);
  _pinBackdrop.querySelector('#pin-submit').addEventListener('click', submitPin);

  _pinBackdrop.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closePinModal();
    if (e.key === 'Enter')  submitPin();
  });
}
function openPinModal(target){ ensurePinModal(); _pinTarget = target; _pinError.textContent=''; _pinBackdrop.classList.add('open'); setTimeout(()=>_pinInput.focus(),0); }
function closePinModal(){ if(_pinBackdrop) _pinBackdrop.classList.remove('open'); _pinTarget=null; if(_pinInput) _pinInput.value=''; }

// REPLACED submitPin: sets short-lived grants so fwd/back requires PIN again
function submitPin(){
  const val = (_pinInput?.value || '').trim();
  if(!_pinTarget) return closePinModal();
  const expected = PINS[_pinTarget];

  if (val === expected) {
    const t = _pinTarget;
    closePinModal();

    if (t === 'tutorials') {
      sessionStorage.setItem('pin_ok_tutorials', '1'); // grant
      window.location.href = 'tutorials.html';
    } else if (t === 'auditor') {
      sessionStorage.setItem('pin_ok_auditor', '1');   // grant
      window.location.href = 'audit.html?site=ricks';
    }
  } else {
    _pinError.textContent = 'WOOPSY!! Incorrect PIN.';
    _pinInput.focus(); _pinInput.select && _pinInput.select();
  }
}

// Helper for tiles/tabs
function pinGate(target){ openPinModal(target); }

// Focus into PIN automatically when the modal is open
document.addEventListener('keydown', (e)=>{
  if (_pinBackdrop && _pinBackdrop.classList.contains('open')) {
    if (document.activeElement !== _pinInput && e.key.length === 1) _pinInput.focus();
  }
});

// === Inactivity (30s) -> back to Daily + clear grants ========================
(function(){
  const INACT_MS = 30000; // 30 seconds
  let timer;

  function clearGrants(){
    sessionStorage.removeItem('pin_ok_tutorials');
    sessionStorage.removeItem('pin_ok_auditor');
  }
  function toDaily(){
    clearGrants();
    const biz = sessionStorage.getItem('userBusiness');
    if (!biz){ window.location.href = 'index.html'; return; }
    const wanted = `${biz}.html`;
    if (location.pathname.endsWith('/' + wanted) || location.pathname.endsWith(wanted)) {
      try { activateSection && activateSection('daily'); } catch(e){}
    } else {
      window.location.href = `${wanted}?section=daily`;
    }
  }
  function reset(){ clearTimeout(timer); timer = setTimeout(toDaily, INACT_MS); }

  ['mousemove','keydown','touchstart','click'].forEach(evt =>
    document.addEventListener(evt, reset, {passive:true})
  );
  reset();
})();

// === Page-specific gating for Tutorials/Audit (works on fwd/back) ============
(function(){
  const path = location.pathname;
  const onTutorials = /tutorials\.html$/i.test(path);
  const onAudit     = /audit\.html$/i.test(path);

  function requireGrant(){
    if (onTutorials && !sessionStorage.getItem('pin_ok_tutorials')) {
      const biz = sessionStorage.getItem('userBusiness') || 'ricks-diner';
      window.location.replace(`${biz}.html?section=daily`);
    }
    if (onAudit && !sessionStorage.getItem('pin_ok_auditor')) {
      const biz = sessionStorage.getItem('userBusiness') || 'ricks-diner';
      window.location.replace(`${biz}.html?section=daily`);
    }
  }

  // On bfcache restore (forward/back), re-check grant
  window.addEventListener('pageshow', requireGrant);

  // Clear grant when leaving the protected page so forward needs PIN again
  window.addEventListener('pagehide', () => {
    if (onTutorials) sessionStorage.removeItem('pin_ok_tutorials');
    if (onAudit)     sessionStorage.removeItem('pin_ok_auditor');
  });

  // Also check immediately on load
  requireGrant();
})();
