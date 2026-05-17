/* ============================================================
   MESSMATE — SCRIPT.JS
   ============================================================ */

'use strict';

/* ─────────────── WEEKLY MENU DATA ─────────────── */
const MENU = {
  Monday: {
    breakfast: ['Poha with Peanuts', 'Boiled Eggs (2)', 'Banana', 'Milk / Tea'],
    lunch:     ['Steamed Rice', 'Dal Fry', 'Aloo Gobi Sabzi', 'Jeera Roti (2)', 'Buttermilk'],
    snacks:    ['Masala Chai', 'Bread Pakoda (2)', 'Biscuits'],
    dinner:    ['Tawa Roti (3)', 'Rajma Curry', 'Jeera Rice', 'Curd', 'Salad'],
  },
  Tuesday: {
    breakfast: ['Idli (3) & Sambar', 'Coconut Chutney', 'Boiled Egg (1)', 'Tea / Coffee'],
    lunch:     ['Plain Rice', 'Moong Dal Tadka', 'Bhindi Masala', 'Chapati (2)', 'Papad'],
    snacks:    ['Ginger Tea', 'Samosa (1)', 'Tomato Sauce'],
    dinner:    ['Chapati (3)', 'Paneer Butter Masala', 'Steamed Rice', 'Raita', 'Salad'],
  },
  Wednesday: {
    breakfast: ['Upma with Cashews', 'Coconut Chutney', 'Boiled Egg (1)', 'Milk'],
    lunch:     ['Steamed Rice', 'Chana Dal', 'Mixed Veg Sabzi', 'Roti (2)', 'Nimbu Paani'],
    snacks:    ['Masala Chai', 'Popcorn / Murmura', 'Groundnuts'],
    dinner:    ['Roti (3)', 'Kadai Chicken / Paneer', 'Dal Rice', 'Curd', 'Pickle'],
  },
  Thursday: {
    breakfast: ['Paratha (2) & Achar', 'Curd', 'Boiled Egg (1)', 'Tea'],
    lunch:     ['Fried Rice', 'Rajma', 'Seasonal Vegetable', 'Chapati (2)', 'Salad'],
    snacks:    ['Milk + Horlicks', 'Rusk / Biscuits', 'Banana'],
    dinner:    ['Chapati (3)', 'Egg Curry / Matar Paneer', 'Steamed Rice', 'Raita', 'Salad'],
  },
  Friday: {
    breakfast: ['Dosa (2) & Sambar', 'Tomato Chutney', 'Boiled Egg (1)', 'Coffee'],
    lunch:     ['Steamed Rice', 'Yellow Dal Tadka', 'Palak Aloo', 'Roti (2)', 'Sweet Lassi'],
    snacks:    ['Tea', 'Vada Pav (1)', 'Green Chutney'],
    dinner:    ['Roti (3)', 'Dal Makhani', 'Vegetable Biryani', 'Boondi Raita', 'Salad'],
  },
  Saturday: {
    breakfast: ['Chole Bhature (1 plate)', 'Pickle', 'Boiled Egg (1)', 'Lassi'],
    lunch:     ['Biryani (Veg/Egg)', 'Mirchi Ka Salan', 'Raita', 'Papad', 'Ice Cream (Special)'],
    snacks:    ['Cold Coffee / Juice', 'Bread Omelette (1)', ''],
    dinner:    ['Roti (3)', 'Khichdi', 'Kadhi', 'Curd', 'Banana'],
  },
  Sunday: {
    breakfast: ['Aloo Puri (1 plate)', 'Halwa', 'Boiled Egg (1)', 'Milk'],
    lunch:     ['Special Thali: Rice, Dal, 2 Sabzi', 'Puri / Chapati', 'Gulab Jamun (2)', 'Papad', 'Salad'],
    snacks:    ['Chai', 'Pakoda Assortment', 'Imli Chutney'],
    dinner:    ['Roti (3)', 'Moong Dal', 'Aloo Tamatar', 'Curd', 'Salad'],
  },
};
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MEAL_ICONS = { breakfast:'🌅', lunch:'☀️', snacks:'🫖', dinner:'🌙' };
const MEAL_COLORS = { breakfast:'#f97316', lunch:'#16a34a', snacks:'#7c3aed', dinner:'#2563eb' };
const RATING_LABELS = ['','Terrible','Poor','Okay','Good','Excellent'];

/* ─────────────── STATE ─────────────── */
let currentUser = null;
let selectedMeal = null;
let selectedRating = 0;

/* ─────────────── STORAGE HELPERS ─────────────── */
function getStudents() { return JSON.parse(localStorage.getItem('mm_students') || '[]'); }
function saveStudents(s) { localStorage.setItem('mm_students', JSON.stringify(s)); }
function getFeedbacks() { return JSON.parse(localStorage.getItem('mm_feedbacks') || '[]'); }
function saveFeedbacks(f) { localStorage.setItem('mm_feedbacks', JSON.stringify(f)); }

/* ─────────────── AUTH ─────────────── */
function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab==='login');
  document.getElementById('tab-signup').classList.toggle('active', tab==='signup');
  document.getElementById('login-form').classList.toggle('hidden', tab!=='login');
  document.getElementById('signup-form').classList.toggle('hidden', tab!=='signup');
  document.getElementById('login-error').textContent = '';
  document.getElementById('signup-error').textContent = '';
}

function handleLogin(e) {
  e.preventDefault();
  const id   = document.getElementById('login-id').value.trim().toUpperCase();
  const pass = document.getElementById('login-pass').value;
  const err  = document.getElementById('login-error');
  const students = getStudents();
  const student  = students.find(s => s.id === id);
  if (!student)         { err.textContent = 'Student ID not found. Please sign up first.'; return; }
  if (student.password !== pass) { err.textContent = 'Incorrect password. Try again.'; return; }
  currentUser = student;
  sessionStorage.setItem('mm_current', JSON.stringify(student));
  closeAuthOverlay();
  updateNavUser();
  updateFeedbackUserInfo();
  showToast(`Welcome back, ${student.name.split(' ')[0]}! 👋`, 'success');
}

function handleSignup(e) {
  e.preventDefault();
  const id     = document.getElementById('su-id').value.trim().toUpperCase();
  const name   = document.getElementById('su-name').value.trim();
  const hostel = document.getElementById('su-hostel').value;
  const room   = document.getElementById('su-room').value.trim().toUpperCase();
  const branch = document.getElementById('su-branch').value;
  const year   = document.getElementById('su-year').value;
  const pass   = document.getElementById('su-pass').value;
  const err    = document.getElementById('signup-error');

  if (!id || !name || !hostel || !room || !pass) { err.textContent = 'Please fill all required fields.'; return; }
  if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }

  const students = getStudents();
  if (students.find(s => s.id === id)) { err.textContent = 'This Student ID is already registered.'; return; }

  const newStudent = { id, name, hostel, room, branch: branch||'—', year: year||'—', password: pass, joined: new Date().toISOString() };
  students.push(newStudent);
  saveStudents(students);

  currentUser = newStudent;
  sessionStorage.setItem('mm_current', JSON.stringify(newStudent));
  closeAuthOverlay();
  updateNavUser();
  updateFeedbackUserInfo();
  renderStudents();
  showToast(`Account created! Welcome, ${name.split(' ')[0]}! 🎉`, 'success');
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('mm_current');
  document.getElementById('profile-dropdown').classList.add('hidden');
  document.getElementById('auth-overlay').classList.add('active');
  showToast('Logged out successfully.', 'success');
}

function closeAuthOverlay() {
  document.getElementById('auth-overlay').classList.remove('active');
}

function toggleProfileDropdown() {
  document.getElementById('profile-dropdown').classList.toggle('hidden');
}

function updateNavUser() {
  if (!currentUser) return;
  const initials = currentUser.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('dp-avatar').textContent = initials;
  document.getElementById('dp-name').textContent = currentUser.name;
  document.getElementById('dp-id').textContent = currentUser.id;
  document.getElementById('dropdown-info').innerHTML = `
    <div class="info-row"><span>🏠</span><span>${currentUser.hostel}</span></div>
    <div class="info-row"><span>🚪</span><span>Room ${currentUser.room}</span></div>
    <div class="info-row"><span>📚</span><span>${currentUser.branch} · ${currentUser.year}</span></div>
  `;
}

function updateFeedbackUserInfo() {
  const el = document.getElementById('feedback-user-info');
  if (currentUser) {
    el.innerHTML = `👤 Submitting as <strong>${currentUser.name}</strong> (${currentUser.id})`;
    el.style.display = 'flex';
  } else {
    el.style.display = 'none';
  }
}

/* ─────────────── NAVBAR ─────────────── */
function toggleMenu() {
  const links = document.getElementById('nav-links');
  const burger = document.getElementById('hamburger');
  links.classList.toggle('open');
  burger.classList.toggle('open');
}
function closeMenu() {
  document.getElementById('nav-links').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

// Active nav on scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 10);

  const sections = document.querySelectorAll('.section');
  const scrollY  = window.scrollY + 80;
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
      if (link) link.classList.add('active');
    }
  });
});

// Close dropdown on outside click
document.addEventListener('click', e => {
  const navUser = document.getElementById('nav-user');
  if (!navUser.contains(e.target)) {
    document.getElementById('profile-dropdown').classList.add('hidden');
  }
});

/* ─────────────── MENU ─────────────── */
function initMenu() {
  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const dayMenu = MENU[dayName];

  // Today date display
  document.getElementById('today-date').textContent = now.toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'});

  // Render today's meals
  ['breakfast','lunch','snacks','dinner'].forEach(meal => {
    const el = document.getElementById(`today-${meal}`);
    el.innerHTML = dayMenu[meal].filter(Boolean).map(item => `<li>${item}</li>`).join('');
  });

  // Build weekly tabs
  const tabsEl = document.getElementById('week-tabs');
  tabsEl.innerHTML = DAYS.map((d, i) => {
    const isToday = d === dayName;
    return `<button class="week-tab ${isToday?'today-tab':''} ${i===0?'active':''}" onclick="showWeekDay('${d}',this)">${d.slice(0,3)}${isToday?' ✦':''}</button>`;
  }).join('');

  showWeekDay(DAYS[0], tabsEl.querySelector('.week-tab'));
}

function switchMenuView(view) {
  document.getElementById('today-menu').classList.toggle('hidden', view!=='today');
  document.getElementById('weekly-menu').classList.toggle('hidden', view!=='weekly');
  document.getElementById('btn-today').classList.toggle('active', view==='today');
  document.getElementById('btn-weekly').classList.toggle('active', view==='weekly');
}

function showWeekDay(day, btn) {
  document.querySelectorAll('.week-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const menu = MENU[day];
  const content = document.getElementById('week-content');
  content.innerHTML = `
    <div class="meal-cards">
      ${['breakfast','lunch','snacks','dinner'].map(meal => `
        <div class="meal-card">
          <div class="meal-card-header ${meal}-header">
            <span class="meal-icon">${MEAL_ICONS[meal]}</span>
            <div>
              <h3>${meal.charAt(0).toUpperCase()+meal.slice(1)}</h3>
              <span class="meal-time">${getMealTime(meal)}</span>
            </div>
          </div>
          <ul class="meal-items">
            ${menu[meal].filter(Boolean).map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;
}

function getMealTime(meal) {
  return {breakfast:'7:30 AM – 9:00 AM', lunch:'12:30 PM – 2:30 PM', snacks:'5:00 PM – 6:00 PM', dinner:'7:30 PM – 9:30 PM'}[meal];
}

/* ─────────────── FEEDBACK ─────────────── */
function selectMeal(meal) {
  selectedMeal = meal;
  document.querySelectorAll('.meal-btn').forEach(b => b.classList.toggle('selected', b.dataset.meal===meal));
}

function setRating(val) {
  selectedRating = val;
  document.querySelectorAll('.star').forEach((s,i) => s.classList.toggle('active', i < val));
  document.getElementById('rating-label').textContent = RATING_LABELS[val];
}

// Star hover
document.querySelectorAll('.star').forEach((s, idx) => {
  s.addEventListener('mouseenter', () => {
    document.querySelectorAll('.star').forEach((star, i) => star.classList.toggle('hovered', i <= idx));
  });
  s.addEventListener('mouseleave', () => {
    document.querySelectorAll('.star').forEach(star => star.classList.remove('hovered'));
  });
});

function submitFeedback(e) {
  e.preventDefault();
  const errEl = document.getElementById('fb-error');
  errEl.textContent = '';

  if (!currentUser) { errEl.textContent = 'Please login to submit feedback.'; return; }
  if (!selectedMeal) { errEl.textContent = 'Please select a meal type.'; return; }
  if (!selectedRating) { errEl.textContent = 'Please select a star rating.'; return; }

  const comment = document.getElementById('fb-comment').value.trim();
  const feedbacks = getFeedbacks();

  const fb = {
    id: Date.now(),
    userId: currentUser.id,
    userName: currentUser.name,
    meal: selectedMeal,
    rating: selectedRating,
    comment,
    date: new Date().toISOString(),
  };
  feedbacks.push(fb);
  saveFeedbacks(feedbacks);

  // Reset form
  selectedMeal = null;
  selectedRating = 0;
  document.querySelectorAll('.meal-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
  document.getElementById('rating-label').textContent = 'Tap a star to rate';
  document.getElementById('fb-comment').value = '';

  renderFeedbackList();
  renderAnalytics();
  showToast('Feedback submitted! Thank you 🙏', 'success');
}

function renderFeedbackList() {
  const feedbacks = getFeedbacks();
  const el = document.getElementById('feedback-list');
  if (!feedbacks.length) {
    el.innerHTML = '<div class="fb-empty">No feedback yet. Be the first! ⭐</div>';
    return;
  }
  const recent = [...feedbacks].reverse().slice(0, 6);
  el.innerHTML = recent.map(fb => {
    const initials = fb.userName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const stars = Array.from({length:5}, (_,i) => `<span class="fb-star ${i<fb.rating?'on':''}">★</span>`).join('');
    const mealLabel = fb.meal.charAt(0).toUpperCase()+fb.meal.slice(1);
    const timeAgo   = getTimeAgo(fb.date);
    return `
      <div class="fb-card">
        <div class="fb-card-top">
          <div class="fb-user">
            <div class="fb-avatar">${initials}</div>
            <div>
              <div class="fb-name">${fb.userName}</div>
              <div class="fb-meal">${MEAL_ICONS[fb.meal]} ${mealLabel}</div>
            </div>
          </div>
          <div class="fb-stars">${stars}</div>
        </div>
        ${fb.comment ? `<div class="fb-comment">"${fb.comment}"</div>` : ''}
        <div class="fb-date">${timeAgo}</div>
      </div>
    `;
  }).join('');
}

function getTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m} min ago`;
  const h = Math.floor(m/60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h/24);
  return `${d}d ago`;
}

/* ─────────────── ANALYTICS ─────────────── */
function renderAnalytics() {
  const feedbacks = getFeedbacks();

  // Summary
  const total = feedbacks.length;
  const avgAll = total ? (feedbacks.reduce((s,f) => s+f.rating, 0) / total).toFixed(1) : 0;
  const uniqueUsers = new Set(feedbacks.map(f=>f.userId)).size;
  const topMealData = getTopMeal(feedbacks);

  document.getElementById('analytics-summary').innerHTML = `
    <div class="summary-card fade-in">
      <div class="summary-icon">📝</div>
      <div class="summary-value">${total}</div>
      <div class="summary-label">Total Feedbacks</div>
    </div>
    <div class="summary-card fade-in">
      <div class="summary-icon">⭐</div>
      <div class="summary-value">${avgAll}</div>
      <div class="summary-label">Overall Avg Rating</div>
    </div>
    <div class="summary-card fade-in">
      <div class="summary-icon">👥</div>
      <div class="summary-value">${uniqueUsers}</div>
      <div class="summary-label">Students Rated</div>
    </div>
    <div class="summary-card fade-in">
      <div class="summary-icon">🏆</div>
      <div class="summary-value">${topMealData.icon}</div>
      <div class="summary-label">${topMealData.label}</div>
    </div>
  `;
  initFadeIn();

  // Rating bars
  const meals = ['breakfast','lunch','snacks','dinner'];
  const ratingBarsEl = document.getElementById('rating-bars');
  if (!total) {
    ratingBarsEl.innerHTML = '<div class="empty-analytics"><div class="empty-icon">📊</div><p>No feedback yet to show analytics.</p></div>';
  } else {
    ratingBarsEl.innerHTML = meals.map(meal => {
      const mFbs = feedbacks.filter(f=>f.meal===meal);
      const avg  = mFbs.length ? (mFbs.reduce((s,f)=>s+f.rating,0)/mFbs.length) : 0;
      const pct  = (avg/5)*100;
      return `
        <div class="rb-row">
          <div class="rb-label">
            <div class="rb-name">${MEAL_ICONS[meal]} ${meal.charAt(0).toUpperCase()+meal.slice(1)}</div>
            <div class="rb-count">${mFbs.length} rating${mFbs.length!==1?'s':''}</div>
          </div>
          <div class="rb-track">
            <div class="rb-fill" style="width:${pct}%;background:${MEAL_COLORS[meal]}"></div>
          </div>
          <div class="rb-score">${avg?avg.toFixed(1):'-'} / 5.0 ${avg>=4?'🔥':avg>=3?'👍':avg>0?'😐':''}</div>
        </div>
      `;
    }).join('');
  }

  // Donut chart
  renderDonutChart(feedbacks);
  // Timeline chart
  renderTimelineChart(feedbacks);
}

function getTopMeal(feedbacks) {
  if (!feedbacks.length) return { icon: '—', label: 'Best Meal' };
  const totals = {};
  const counts = {};
  feedbacks.forEach(f => {
    totals[f.meal] = (totals[f.meal]||0) + f.rating;
    counts[f.meal] = (counts[f.meal]||0) + 1;
  });
  let best = null, bestAvg = 0;
  Object.keys(totals).forEach(m => {
    const avg = totals[m]/counts[m];
    if (avg > bestAvg) { bestAvg = avg; best = m; }
  });
  return { icon: MEAL_ICONS[best]||'—', label: `Best: ${best ? best.charAt(0).toUpperCase()+best.slice(1) : '—'}` };
}

function renderDonutChart(feedbacks) {
  const canvas = document.getElementById('chart-canvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // Count by star rating
  const counts = [0,0,0,0,0];
  feedbacks.forEach(f => counts[f.rating-1]++);
  const total = feedbacks.length;

  if (!total) {
    ctx.fillStyle = '#a8a29e';
    ctx.font = '14px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', W/2, H/2);
    return;
  }

  const colors = ['#ef4444','#f97316','#f59e0b','#22c55e','#0f766e'];
  const labels = ['1★','2★','3★','4★','5★'];
  const cx = W/2 - 40, cy = H/2, r = Math.min(cx, cy) - 16;
  let startAngle = -Math.PI/2;

  counts.forEach((count, i) => {
    if (!count) return;
    const slice = (count/total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle += slice;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, r*0.5, 0, Math.PI*2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.fillStyle = '#1c1917';
  ctx.font = `bold 18px Syne, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(total, cx, cy+2);
  ctx.font = '11px DM Sans, sans-serif';
  ctx.fillStyle = '#57534e';
  ctx.fillText('total', cx, cy+16);

  // Legend
  const legendX = cx + r + 20;
  counts.forEach((count, i) => {
    if (!count) return;
    const lY = 30 + i * 36;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.roundRect(legendX, lY, 14, 14, 3);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.font = '12px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${labels[i]} – ${count}`, legendX + 20, lY + 11);
  });
}

function renderTimelineChart(feedbacks) {
  const canvas = document.getElementById('timeline-canvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // Last 7 days
  const days = [];
  for (let i=6; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate()-i);
    days.push(d.toDateString());
  }

  const meals = ['breakfast','lunch','snacks','dinner'];
  const data  = {};
  meals.forEach(m => { data[m] = days.map(d => { const fs = feedbacks.filter(f => f.meal===m && new Date(f.date).toDateString()===d); return fs.length ? (fs.reduce((s,f)=>s+f.rating,0)/fs.length) : null; }); });

  const padL=42, padR=16, padT=16, padB=32;
  const cW = W-padL-padR, cH = H-padT-padB;
  const stepX = cW/(days.length-1);

  // Grid
  ctx.strokeStyle = '#e7e5e4'; ctx.lineWidth = 1;
  for (let i=0; i<=5; i++) {
    const y = padT + cH - (i/5)*cH;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W-padR, y); ctx.stroke();
    ctx.fillStyle = '#a8a29e'; ctx.font = '10px DM Sans'; ctx.textAlign = 'right';
    ctx.fillText(i, padL-6, y+4);
  }

  // X labels
  ctx.fillStyle = '#57534e'; ctx.font = '10px DM Sans'; ctx.textAlign = 'center';
  days.forEach((d,i) => {
    const x = padL + i*stepX;
    const label = new Date(d).toLocaleDateString('en',{month:'short',day:'numeric'});
    ctx.fillText(label, x, H-8);
  });

  // Lines
  meals.forEach(meal => {
    const pts = data[meal];
    ctx.strokeStyle = MEAL_COLORS[meal]; ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    let started = false;
    pts.forEach((val, i) => {
      if (val === null) { started = false; return; }
      const x = padL + i*stepX;
      const y = padT + cH - ((val)/5)*cH;
      if (!started) { ctx.moveTo(x,y); started=true; } else { ctx.lineTo(x,y); }
    });
    ctx.stroke();
    // Dots
    pts.forEach((val, i) => {
      if (val === null) return;
      const x = padL + i*stepX;
      const y = padT + cH - ((val)/5)*cH;
      ctx.beginPath();
      ctx.arc(x,y,4,0,Math.PI*2);
      ctx.fillStyle = MEAL_COLORS[meal]; ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
    });
  });

  // Legend
  const lY = padT + 2;
  meals.forEach((meal, i) => {
    const lX = padL + (i * (cW/4));
    ctx.fillStyle = MEAL_COLORS[meal];
    ctx.beginPath(); ctx.roundRect(lX, lY, 10, 10, 2); ctx.fill();
    ctx.fillStyle='#57534e'; ctx.font='10px DM Sans'; ctx.textAlign='left';
    ctx.fillText(meal.charAt(0).toUpperCase()+meal.slice(1), lX+13, lY+9);
  });
}

function clearAllFeedback() {
  if (!confirm('Are you sure you want to delete ALL feedback? This cannot be undone.')) return;
  saveFeedbacks([]);
  renderFeedbackList();
  renderAnalytics();
  showToast('All feedback cleared.', 'success');
}

/* ─────────────── STUDENTS ─────────────── */
function renderStudents() {
  const students = getStudents();
  const grid = document.getElementById('students-grid');
  const empty = document.getElementById('students-empty');
  if (!students.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    empty.querySelector('p').textContent = 'No students registered yet.';
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = students.map(s => {
    const initials = s.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return `
      <div class="student-card fade-in">
        <div class="sc-avatar">${initials}</div>
        <div class="sc-name">${s.name}</div>
        <div class="sc-id">${s.id}</div>
        <div class="sc-info">
          <div class="sc-info-row">🏠 ${s.hostel}</div>
          <div class="sc-info-row">🚪 Room ${s.room}</div>
          ${s.branch !== '—' ? `<div class="sc-info-row">📚 ${s.branch}</div>` : ''}
          ${s.year !== '—' ? `<div class="sc-info-row">🎓 ${s.year}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
  initFadeIn();
}

function filterStudents() {
  const query  = document.getElementById('student-search').value.toLowerCase();
  const hostel = document.getElementById('hostel-filter').value;
  const students = getStudents();
  const filtered = students.filter(s => {
    const matchQ = !query || s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query) || s.hostel.toLowerCase().includes(query);
    const matchH = !hostel || s.hostel === hostel;
    return matchQ && matchH;
  });
  const grid  = document.getElementById('students-grid');
  const empty = document.getElementById('students-empty');
  if (!filtered.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    empty.querySelector('p').textContent = 'No students found matching your search.';
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = filtered.map(s => {
    const initials = s.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return `
      <div class="student-card fade-in">
        <div class="sc-avatar">${initials}</div>
        <div class="sc-name">${s.name}</div>
        <div class="sc-id">${s.id}</div>
        <div class="sc-info">
          <div class="sc-info-row">🏠 ${s.hostel}</div>
          <div class="sc-info-row">🚪 Room ${s.room}</div>
          ${s.branch !== '—' ? `<div class="sc-info-row">📚 ${s.branch}</div>` : ''}
          ${s.year !== '—' ? `<div class="sc-info-row">🎓 ${s.year}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
  initFadeIn();
}

/* ─────────────── TOAST ─────────────── */
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.classList.remove('show'); }, 3200);
}

/* ─────────────── FADE-IN ON SCROLL ─────────────── */
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in:not(.visible)');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ─────────────── INIT ─────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Restore session
  const stored = sessionStorage.getItem('mm_current');
  if (stored) {
    currentUser = JSON.parse(stored);
    closeAuthOverlay();
    updateNavUser();
    updateFeedbackUserInfo();
  }

  initMenu();
  renderFeedbackList();
  renderAnalytics();
  renderStudents();
  initFadeIn();

  // Set today date for display
  document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
});
