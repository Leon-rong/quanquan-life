import { CONFIG } from './config.js?v=15';
import { store, SINGLE_FAMILY } from './store.js?v=15';
import { ROLE_OPTIONS, canWrite, canManage, canDelete } from './permissions.js?v=15';
import { FOOD_CATEGORIES } from './food.js?v=15';
import { VACCINES, vaccineNames } from './vaccine.js?v=15';
import { POLICIES, POLICY_CATEGORIES, policyInsights } from './policy.js?v=15';
import { ACHIEVEMENTS, ACH_CATS, TIER_NAMES, TIER_COLORS, RARITY, RARITY_ORDER, evaluateAll } from './achievements.js?v=15';
import { evaluateGrowth, growthAdvice, evaluateTrend, ageMonths } from './growth-eval.js?v=15';
import { lionSVG, lionLine, moodByHour, TYPE_MOOD } from './lion.js?v=15';
import { QUICK, defaultValue, describe as describeQuick, lastOf, sheetHTML, foodSheetHTML } from './quicklog.js?v=15';

// ============ 类型元数据 ============
const TYPES = {
  feed:       { label: '吃',   icon: '🍽', cls: 'b-feed' },
  poop:       { label: '拉',   icon: '💩', cls: 'b-poop' },
  sleep:      { label: '睡',   icon: '😴', cls: 'b-sleep' },
  temp:       { label: '体温', icon: '🌡', cls: 'b-temp' },
  medication: { label: '用药', icon: '💊', cls: 'b-med' },
  measure:    { label: '体测', icon: '📏', cls: 'b-measure' },
  vaccine:    { label: '疫苗', icon: '💉', cls: 'b-vaccine' },
  drink:      { label: '喝',   icon: '💧', cls: 'b-drink' },
};

// 吉祥物（立体感小狮子：径向渐变鬃毛 + 高光 + 投影，idle 呼吸/眨眼，解锁时 cheer 蹦跳）
const MASCOT_SVG = `<svg class="lion" viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
  <defs>
    <radialGradient id="maneG" cx="50%" cy="40%" r="62%">
      <stop offset="0%" stop-color="#FBC860"/><stop offset="55%" stop-color="#F2A33C"/><stop offset="100%" stop-color="#D77F22"/>
    </radialGradient>
    <radialGradient id="maneG2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFD07A"/><stop offset="100%" stop-color="#E8922A"/>
    </radialGradient>
    <radialGradient id="faceG" cx="46%" cy="32%" r="72%">
      <stop offset="0%" stop-color="#FFF1D6"/><stop offset="60%" stop-color="#F9CC82"/><stop offset="100%" stop-color="#F2B85E"/>
    </radialGradient>
  </defs>
  <ellipse cx="24" cy="44.5" rx="13" ry="2.6" fill="rgba(120,80,30,.20)"/>
  <circle cx="24" cy="24" r="19.5" fill="url(#maneG)"/>
  <g fill="#E8922A" stroke="#C9771F" stroke-width=".6">
    <path d="M24 3 l3.4 -3.4 3.2 4.4 -3.6 1.1z"/><path d="M41 24 l3.4 -3.4 1.1 4.4 -4.4 3.2z"/>
    <path d="M24 45 l3.4 3.4 -1.1 -4.4 -3.6 -1.1z"/><path d="M7 24 l-3.4 3.4 1.1 -4.4 4.4 -3.2z"/>
    <path d="M9.5 9.5 l4.2 -2.4 1.2 4.4 -4.4 1.1z"/><path d="M38.5 9.5 l-2.4 -4.2 4.4 1.2 1.1 4.4z"/>
    <path d="M9.5 38.5 l4.2 2.4 -1.2 -4.4 -4.4 -1.1z"/><path d="M38.5 38.5 l2.4 4.2 -4.4 -1.2 -1.1 -4.4z"/>
  </g>
  <circle cx="13" cy="13" r="4.6" fill="url(#maneG2)"/><circle cx="35" cy="13" r="4.6" fill="url(#maneG2)"/>
  <circle cx="13" cy="13" r="2.1" fill="#F6B25A"/><circle cx="35" cy="13" r="2.1" fill="#F6B25A"/>
  <circle cx="24" cy="25" r="14.5" fill="url(#faceG)"/>
  <ellipse cx="18.5" cy="19" rx="5" ry="3.2" fill="#fff" opacity=".45"/>
  <g class="lion-eyes">
    <circle cx="19.3" cy="24.2" r="2.6" fill="#4a3b5c"/><circle cx="28.7" cy="24.2" r="2.6" fill="#4a3b5c"/>
    <circle cx="20.1" cy="23.2" r=".95" fill="#fff"/><circle cx="29.5" cy="23.2" r=".95" fill="#fff"/>
  </g>
  <ellipse cx="16.5" cy="28.6" rx="2.6" ry="1.8" fill="#ff9bb0" opacity=".5"/><ellipse cx="31.5" cy="28.6" rx="2.6" ry="1.8" fill="#ff9bb0" opacity=".5"/>
  <ellipse cx="24" cy="29.6" rx="4.2" ry="3.1" fill="#FFF6E8"/>
  <circle cx="24" cy="28.2" r="1.9" fill="#C97B4A"/>
  <ellipse cx="23.4" cy="27.6" rx=".7" ry=".5" fill="#fff" opacity=".7"/>
  <path d="M21 31.4 Q24 34 27 31.4" stroke="#4a3b5c" stroke-width="1.9" fill="none" stroke-linecap="round"/>
</svg>`;

// ============ 状态 ============
const state = {
  view: 'timeline',     // timeline | stats | health | daily | album | diary | members | settings
  foodSel: new Set(),
  statsPeriod: 'week',
  current: null,
  diary: { unlocked: false, password: '', error: '', },
  achFilter: 'all',     // 成就墙分类筛选
  achList: [],          // 当前成就评估结果缓存（供筛选局部刷新）
  qlSheet: null,        // 当前打开的一键记录面板类型
  qlPick: {},           // 面板内芯片选择值
  qlFoods: new Set(),   // 辅食快捷打卡选择
  sleepStart: Number(localStorage.getItem('quanquan:sleepStart') || 0), // 睡眠计时起点
  undo: null,           // 最近一次一键记录（供 5 秒撤销）
  qlLongPress: false,   // 长按标志：吞掉长按后跟随的 click
  lionMood: null,       // 狮子当前情绪（记录后短暂切换）
};

// ============ 工具 ============
const $app = document.getElementById('app');
const $toast = document.getElementById('toast');
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function toast(msg) {
  $toast.textContent = msg; $toast.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => $toast.classList.add('hidden'), 2200);
}
function fmtTime(ts) { const d = new Date(ts); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
function fmtDate(ts) { const d = new Date(ts); return `${d.getMonth() + 1}月${d.getDate()}日`; }
function fmtMD(ts) { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()}`; }
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function dateToTs(dateStr) {
  const [y, m, d] = (dateStr || todayStr()).split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const now = new Date();
  base.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return base.getTime();
}
function roleBadge(role) {
  const map = { admin: ['管理员', 'b-med'], recorder: ['记录员', 'b-food'], readonly: ['只读', 'b-sleep'] };
  const [t, c] = map[role] || ['?', 'b-sleep'];
  return `<span class="badge ${c}">${t}</span>`;
}
function headerDateHTML() {
  const d = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}
function headerAvatar(role) {
  if (role === 'admin') return '👑';
  if (role === 'recorder') return '✍️';
  return '👀';
}
function headerHTML(isGate) {
  const date = `<div class="header-date">${headerDateHTML()}</div>`;
  if (isGate) {
    return `<div class="app-header">
      <div class="brand"><span class="brand-icon">${MASCOT_SVG}</span><h1>${esc(CONFIG.APP_NAME)}</h1></div>
      ${date}
      <div class="me"><span class="me-mode">${store.isCloud() ? '☁️ 云端模式' : '📱 本地演示'}</span></div>
    </div>`;
  }
  const me = state.current.me;
  return `<div class="app-header">
      <div class="brand"><span class="brand-icon">${MASCOT_SVG}</span><h1>${esc(CONFIG.APP_NAME)}</h1></div>
      ${date}
      <div class="me">
        <span class="me-mode" title="${store.isCloud() ? '数据实时存云端，多设备同步' : '数据暂存本机，恢复云端后自动补传'}">${store.isCloud() ? '☁️ 云端' : '📱 本地'}</span>
        <span class="me-avatar">${headerAvatar(me.role)}</span>
        <span class="me-name">${esc(me.name)}</span>
        ${roleBadge(me.role)}
      </div>
    </div>`;
}
function clsOf(type) {
  return ({ feed: 'feed', poop: 'poop', sleep: 'sleep', temp: 'temp', medication: 'med', measure: 'measure', vaccine: 'vaccine', drink: 'drink' })[type] || 'measure';
}
function summarize(r) {
  const v = r.value || {};
  switch (r.type) {
    case 'feed': {
      let s = `喂养·${v.kind || ''}`;
      if (v.amount) s += ` ${v.amount}ml`;
      if (v.foods && v.foods.length) s += ` · 辅食:${v.foods.join('、')}`;
      return s.trim();
    }
    case 'poop': return `排泄·${v.type || ''} ${v.color ? v.color : ''}`.trim();
    case 'sleep': return `睡眠·${v.duration || ''}分钟` + (v.start ? ` (${v.start})` : '');
    case 'temp': return `体温·${v.temp || ''}℃`;
    case 'medication': return `用药·${v.med || ''} ${v.dose ? v.dose + (v.unit || '') : ''}`;
    case 'vaccine': return `疫苗·${v.name || ''}`;
    case 'drink': return `喝水·${v.times || 0}次 ${v.ml || 0}ml`;
    case 'measure': return `体测·${v.weight ? v.weight + 'kg ' : ''}${v.height ? v.height + 'cm ' : ''}${v.head ? v.head + 'cm' : ''}`.trim();
  }
  return r.type;
}

// ============ 渲染 ============
async function render() {
  if (!state.current) { $app.innerHTML = gateHTML(); return; }
  // 每次 render 前从 store 刷新权威数据（修复：快速记录后今日概览卡不同步——
  // loadCurrent 每次返回新对象，旧 state.current.fam.records 是过期引用）
  try { const cur = await store.loadCurrent(); if (cur) state.current = cur; } catch { /* 保持旧缓存 */ }
  const tab = state.view;
  const view = await viewHTML(tab);
  $app.innerHTML = `
    ${headerHTML(false)}
    <div id="view">${view}</div>
    ${tabbarHTML(tab)}
    <div style="height:8px"></div>`;
  bindView(tab);
}

function gateHTML() {
  // 云端连接失败时在首页顶部显示精确错误 + 重试，方便不同设备上报原因。
  const cloudBanner = store.cloudError
    ? `<div class="cloud-err">
        <div class="ce-title">⚠️ 云端连接失败</div>
        <div class="ce-msg">${esc(store.cloudError)}</div>
        <button class="btn btn-ghost btn-sm" data-action="retryCloud">重试连接云端</button>
        <div class="ce-hint">若反复失败：多为浏览器扩展/拦截器干扰或网络访问云端 API 受限。可换无痕窗口、关闭视频下载类扩展，或临时用右上「📱 本地演示」模式。</div>
      </div>`
    : (store.isCloud() ? '' : '');
  return `
  ${headerHTML(true)}
  ${cloudBanner}
  <div class="card welcome">
    <div class="welcome-bear">${MASCOT_SVG}</div>
    <h2>👋 欢迎回到拳拳成长记录</h2>
    <p class="muted">这是拳拳的专属记录本（单家庭版）。输入邀请码和你的身份即可进入；家庭邀请码固定为拳拳生日，由爸爸（管理员）统一管理成员。</p>
    <label class="field" style="margin-top:12px"><span>邀请码</span><input type="text" id="enterCode" value="${esc(SINGLE_FAMILY.inviteCode)}" style="text-transform:uppercase"></label>
    <label class="field"><span>你的称呼</span><input type="text" id="enterName" placeholder="如 爸爸 / 妈妈 / 奶奶"></label>
    <label class="field"><span>你的角色</span><select id="enterRole">
      <option value="admin">管理员（爸妈）</option>
      <option value="recorder" selected>记录员（爷爷奶奶·姥姥姥爷）</option>
      <option value="readonly">只读（亲友）</option>
    </select></label>
    <button class="btn btn-primary btn-block" data-action="enterFamily" style="margin-top:12px">进入工作台</button>
  </div>`;
}

async function viewHTML(tab) {
  switch (tab) {
    case 'timeline': return timelineHTML();
    case 'stats': return statsHTML();
    case 'achievements': return achievementsHTML();
    case 'health': return healthHTML();
    case 'science': return scienceHTML();
    case 'daily': return dailyHTML();
    case 'album': return albumHTML();
    case 'diary': return diaryHTML();
    case 'members': return membersHTML();
    case 'settings': return settingsHTML();
  }
  return '';
}

function tabbarHTML(active) {
  const tabs = [
    ['timeline', '🏠', '时间轴'], ['stats', '📊', '统计'], ['achievements', '🏆', '成就'],
    ['health', '🩺', '健康'], ['daily', '🦁', '日常'], ['album', '🖼', '图册'],
    ['diary', '📓', '日记'], ['science', '📚', '科普'], ['members', '👨‍👩‍👧', '成员'], ['settings', '⚙️', '设置'],
  ];
  return `<div class="tabbar">${tabs.map(([k, ic, t]) =>
    `<button data-action="nav" data-view="${k}" class="${active === k ? 'active' : ''}"><span class="ic">${ic}</span>${t}</button>`
  ).join('')}</div>`;
}

// ---- 宝宝月龄文案 ----
function babyAgeText(birth) {
  if (!birth) return '';
  const b = new Date(birth);
  const now = new Date();
  if (Number.isNaN(b.getTime())) return '';
  let m = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) m--;
  if (m < 0) return '';
  const y = Math.floor(m / 12);
  const mm = m % 12;
  if (y <= 0) return `${mm} 个月啦`;
  return mm > 0 ? `${y} 岁 ${mm} 个月` : `${y} 岁啦`;
}

// ---- 狮子主视觉 Hero：问候 + 月龄 + 台词气泡 ----
function lionHeroHTML() {
  const h = new Date().getHours();
  const greet = h < 6 ? '夜深啦' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  const mood = state.lionMood || moodByHour(h);
  const p = getBabyProfile();
  const age = babyAgeText(p.birthDate);
  const line = lionLine(mood, new Date().getDate());
  const lion = lionSVG({ size: 88, mood, cls: 'hero-lion' });
  const ageHtml = age ? `<div class="lh-sub">🦁 ${esc(age)}</div>` : '';
  return `<div class="lion-hero pop-in">
      <div class="lh-lion">${lion}</div>
      <div class="lh-text">
        <div class="lh-greet">${greet}，${esc(p.name || '拳拳')}！</div>
        ${ageHtml}
        <div class="lion-bubble">${esc(line)}</div>
      </div>
    </div>`;
}

// ---- 一键记录条：大圆钮，点一下就记录 ----
function quickBarHTML() {
  const w = canWrite(state.current.me.role);
  const t = todayStr();
  const dk = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const hasToday = (type) => (state.current.fam.records || []).some((r) => r.type === type && dk(r.ts) === t);
  const btns = QUICK.map((q) => {
    const timing = q.instant === 'timer' && state.sleepStart;
    const cls = 'qb-btn' + (timing ? ' recording' : '');
    const label = timing ? '计时中' : q.label;
    const done = hasToday(q.type);
    const dot = q.sheet && !done ? '<span class="qb-dot">⋯</span>' : '';
    const badge = done ? `<span class="qb-check" style="background:${q.color}">✓</span>` : '';
    return `<button type="button" class="${cls}" data-action="ql" data-type="${q.type}" style="--qc:${q.color}" ${w ? '' : 'disabled'}>
        <span class="qb-ring"></span>
        <span class="qb-ic">${q.ic}</span>
        <span class="qb-label">${label}</span>
        ${badge || dot}
      </button>`;
  }).join('');
  const tip = w
    ? '<div class="qb-tip muted">点一下就记好（自动沿用上次）；按住可打开详细表单</div>'
    : '<div class="qb-tip muted">当前为只读权限，无法记录</div>';
  return `<div class="quickbar pop-in">
      <div class="qb-head"><span class="qb-title">⚡ 一键记录</span></div>
      <div class="qb-grid">${btns}</div>
      ${tip}
    </div>`;
}

// ---- 一键记录引擎：点按直记 / 睡眠计时 / 轻面板 / 5 秒撤销 ----
function openQlSheet(type) {
  state.qlSheet = type;
  state.qlPick = {};
  state.qlFoods = new Set();
  renderQlSheet();
}
function closeQlSheet() {
  state.qlSheet = null;
  state.qlPick = {};
  const root = document.getElementById('qlRoot');
  if (root) root.remove();
}
function renderQlSheet() {
  if (!state.qlSheet) return;
  const recs = state.current.fam.records;
  const body = state.qlSheet === 'feed' ? foodSheetHTML() : sheetHTML(state.qlSheet, recs);
  if (!body) { closeQlSheet(); return; }
  let root = document.getElementById('qlRoot');
  if (!root) {
    root = document.createElement('div');
    root.id = 'qlRoot';
    $app.appendChild(root);
  }
  root.innerHTML = `<div class="ql-mask" data-action="qlClose"></div><div class="ql-sheet">${body}</div>`;
}
function lionReact(mood) {
  state.lionMood = mood;
  clearTimeout(lionReact._t);
  lionReact._t = setTimeout(() => {
    state.lionMood = null;
    if (state.view === 'timeline') render();
  }, 2600);
}
function showUndo(label) {
  let bar = document.getElementById('undoBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'undoBar';
    $app.appendChild(bar);
  }
  bar.innerHTML = `<span class="undo-label">${label}</span><button type="button" class="undo-btn" data-action="qlUndo">撤销</button>`;
  requestAnimationFrame(() => bar.classList.add('show'));
  clearTimeout(showUndo._t);
  showUndo._t = setTimeout(() => {
    bar.classList.remove('show');
    setTimeout(() => bar.remove(), 350);
    state.undo = null;
  }, 5000);
}
async function qlLog(type) {
  const q = QUICK.find((x) => x.type === type);
  if (!q) return;
  const d = defaultValue(type, state.current.fam.records);
  const rec = await store.addRecord({ type, value: d.value, note: '', ts: Date.now() });
  state.undo = { _id: rec._id, type };
  lionReact(TYPE_MOOD[type] || 'happy');
  await maybeCelebrate();
  await render();
  showUndo(`${q.ic} ${describeQuick(type, d.value)}`);
}
async function toggleSleepTimer() {
  if (state.sleepStart) {
    const mins = Math.max(1, Math.round((Date.now() - state.sleepStart) / 60000));
    state.sleepStart = 0;
    localStorage.removeItem('quanquan:sleepStart');
    const rec = await store.addRecord({ type: 'sleep', value: { duration: mins }, note: '', ts: Date.now() });
    state.undo = { _id: rec._id, type: 'sleep' };
    lionReact('sleepy');
    await maybeCelebrate();
    await render();
    showUndo(`😴 小睡 ${mins} 分钟`);
  } else {
    state.sleepStart = Date.now();
    localStorage.setItem('quanquan:sleepStart', String(state.sleepStart));
    lionReact('sleepy');
    toast('😴 开始计时，睡醒再点一下');
    render();
  }
}
async function qlSubmitSheet() {
  const type = state.qlSheet;
  if (!type) return;
  const pick = (name) => state.qlPick[name];
  const field = (name) => {
    const el = document.querySelector(`[data-ql-field="${name}"]`);
    return el ? el.value.trim() : '';
  };
  let value = null;
  if (type === 'temp') {
    const temp = pick('temp') || field('temp');
    if (!temp) { toast('点一个体温，或手动输入'); return; }
    value = { temp };
  } else if (type === 'measure') {
    const weight = field('weight'), height = field('height'), head = field('head');
    if (!weight && !height) { toast('体重、身高至少填一项'); return; }
    value = { weight, height, head };
  } else if (type === 'medication') {
    const med = pick('med') || field('med');
    if (!med) { toast('点选或输入药品名称'); return; }
    value = { med, dose: field('dose'), unit: field('unit') || 'ml' };
  } else if (type === 'vaccine') {
    const name = pick('name') || field('name');
    if (!name) { toast('点选或输入疫苗名称'); return; }
    value = { name };
  } else if (type === 'drink') {
    const ml = Number(pick('ml') || field('ml'));
    if (!ml || ml <= 0) { toast('请输入喝水量'); return; }
    value = { ml, times: 1 };
  } else if (type === 'sleep') {
    const picked = pick('mins');
    let mins = 0;
    if (picked) mins = Number(picked);
    else {
      const h = parseFloat(field('sleepH') || '0');
      const m = Number(field('sleepM') || '0');
      mins = Math.round(h * 60) + m;
    }
    if (mins <= 0) { toast('请输入睡眠时长'); return; }
    value = { duration: mins };
  } else if (type === 'poop') {
    const ptype = pick('type') || '正常';
    const color = pick('color') || '黄';
    value = { type: ptype, color };
  } else if (type === 'feed') {
    const foods = [...state.qlFoods];
    if (!foods.length) { toast('至少选一种食材'); return; }
    value = { kind: '辅食', amount: '', foods };
  }
  if (!value) return;
  const q = QUICK.find((x) => x.type === type);
  const rec = await store.addRecord({ type, value, note: '', ts: Date.now() });
  state.undo = { _id: rec._id, type };
  lionReact(TYPE_MOOD[type] || 'happy');
  closeQlSheet();
  await maybeCelebrate();
  await render();
  showUndo(`${q ? q.ic : ''} ${describeQuick(type, value)}`);
}

// ---- 今日概览（Bento 便当网格） ----
function todayOverviewHTML() {
  const list = state.current.fam.records || [];
  const dk = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const t = todayStr();
  const todays = list.filter((r) => dk(r.ts) === t);
  const feed = todays.filter((r) => r.type === 'feed').length;
  const drinkMl = todays.filter((r) => r.type === 'drink')
    .reduce((s, r) => s + (Number(r.value && r.value.ml) || 0), 0);
  const poop = todays.filter((r) => r.type === 'poop').length;
  const sleepMin = todays.filter((r) => r.type === 'sleep')
    .reduce((s, r) => s + (Number(r.value && r.value.duration) || 0), 0);
  const sleepH = Math.round(sleepMin / 6) / 10;
  const flags = [feed > 0, drinkMl > 0, poop > 0, sleepMin > 0];
  const done = flags.filter(Boolean).length;
  const all = done === 4;

  const tile = (ic, n, unit, label, ok, color) => {
    const check = ok ? '<div class="bt-check">✓</div>' : '';
    return `<div class="bento-tile ${ok ? 'on' : ''}" style="--tc:${color}">
        <div class="bt-ic">${ic}</div>
        <div class="bt-val"><span class="bt-n">${n}</span><span class="bt-u">${unit}</span></div>
        <div class="bt-label">${label}</div>
        ${check}
      </div>`;
  };
  const tiles = tile('🍽', feed, '次', '吃', flags[0], 'var(--feed)')
    + tile('💧', drinkMl, 'ml', '喝水', flags[1], 'var(--drink)')
    + tile('💩', poop, '次', '拉臭', flags[2], 'var(--poop)')
    + tile('😴', sleepMin >= 60 ? (Math.round(sleepMin / 6) / 10) : sleepMin, sleepMin >= 60 ? 'h' : '分', '睡觉', flags[3], 'var(--sleep)');

  const header = all
    ? '<span class="today-all">⭐ 今日全能达成</span>'
    : `<span class="muted">今日集齐 ${done}/4</span>`;
  const bar = `<div class="today-prog"><i style="width:${(done / 4) * 100}%"></i></div>`;
  return `<div class="card today-card pop-in">
    <div class="spread"><h2>🌞 拳拳的今天</h2>${header}</div>
    ${bar}
    <div class="bento">${tiles}</div>
  </div>`;
}

// ---- 时间轴 ----
async function timelineHTML() {
  // render() 顶部已刷新 state.current，这里直接复用缓存（云端模式省 4 次查询）
  const list = (state.current.fam.records || []).slice().sort((a, b) => b.ts - a.ts);
  const canDel = (r) => canDelete(state.current.me.role, r, state.current.me._id);
  const empty = list.length === 0;
  const timelineList = list.map((r) => {
    const delBtn = canDel(r) ? `<div class="ops"><button class="btn btn-ghost btn-sm" data-action="del" data-id="${esc(r._id)}">删除</button></div>` : '';
    return `<li>
      <span class="dot" style="background:var(--${clsOf(r.type)})"></span>
      <div class="body">
        <div><span class="badge ${TYPES[r.type].cls}">${TYPES[r.type].icon} ${TYPES[r.type].label}</span> ${esc(summarize(r))}</div>
        <div class="meta">${fmtDate(r.ts)} ${fmtTime(r.ts)} · ${esc(r.operatorName)}${r.note ? ' · ' + esc(r.note) : ''}</div>
        ${delBtn}
      </div>
    </li>`;
  }).join('');
  const listCard = `<div class="card pop-in"><ul class="tl">${timelineList}</ul></div>`;
  const emptyState = empty ? `<div class="card empty pop-in">
      <div class="empty-bear">${lionSVG({ size: 92, mood: 'think', fists: true })}</div>
      <p class="muted center">还没有记录，点上面的大圆钮一键记一笔吧～</p>
      <p class="muted center">记完后可在「统计」里查看成长分析 📊</p>
    </div>` : '';
  return `${lionHeroHTML()}${quickBarHTML()}${todayOverviewHTML()}${empty ? emptyState : listCard}`;
}

const DATE_FIELD = (label = '日期', val = todayStr()) =>
  `<label class="field"><span>${label}</span><input type="date" name="date" value="${val}" required></label>`;

// ---- 健康（疫苗 → 体测 → 健康记录） ----
// ---- 健康（疫苗进度时间轴 → 生长评价 → 体测 → 体温/用药） ----

/** 疫苗「建议月龄」文本 → 月龄数字数组（'出生'→[0]，'2、3月龄'→[2,3]，'2岁'→[24]） */
function vxMonthNums(m) {
  if (!m) return [99];
  if (m === '出生') return [0];
  if (m.includes('岁')) return (m.match(/\d+/g) || []).map((n) => Number(n) * 12);
  return (m.match(/\d+/g) || ['99']).map(Number);
}

/** 环形进度 SVG */
function progressRingSVG(pct, size = 88, color = 'var(--vaccine)') {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(1, Math.max(0, pct)));
  return `<svg class="vxring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="进度 ${Math.round(pct * 100)}%">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#F0E9F5" stroke-width="10"/>
    <circle class="vxring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="central" font-size="${Math.round(size * 0.22)}" font-weight="900" fill="#4A3B5C">${Math.round(pct * 100)}%</text>
  </svg>`;
}

async function healthHTML() {
  const w = canWrite(state.current.me.role);
  const recs = await store.listRecords({ types: ['vaccine', 'measure', 'temp', 'medication'] });
  const vList = recs.filter((r) => r.type === 'vaccine');
  const doneMap = new Map();
  vList.forEach((r) => { if (!doneMap.has(r.value.name)) doneMap.set(r.value.name, r); });

  // 疫苗状态时间轴：done（已记录） / due（建议月龄已到，该接种） / future（未来计划）
  const prof = getBabyProfile();
  const ageM = ageMonths(prof.birthDate);
  let doneCnt = 0, dueCnt = 0, futureCnt = 0;
  const vxItems = VACCINES.map((v) => {
    const rec = doneMap.get(v.name);
    const due = !rec && vxMonthNums(v.month).some((n) => n <= ageM);
    if (rec) doneCnt += 1; else if (due) dueCnt += 1; else futureCnt += 1;
    const st = rec ? 'done' : due ? 'due' : 'future';
    const main = rec
      ? `<span class="vx-name">${esc(v.name)}</span><span class="vx-meta">${fmtDate(rec.ts)} · ${esc(rec.operatorName)}</span>`
      : due
        ? `<span class="vx-name">${esc(v.name)}</span><span class="vx-due-tag">该接种了</span>`
        : `<span class="vx-name dim">${esc(v.name)}</span>`;
    const sub = rec
      ? (v.positive ? `<span class="vx-sub">预防 ${esc(v.positive)}</span>` : '')
      : `<span class="vx-sub">建议 ${esc(v.month)} · 预防 ${esc(v.positive)}</span>`;
    const act = rec
      ? (canDelete(state.current.me.role, rec, state.current.me._id) ? `<button class="btn btn-ghost btn-sm" data-action="del" data-id="${rec._id}">删除</button>` : '')
      : (due && w ? `<button class="btn btn-sm vx-quick" data-action="vxQuick" data-name="${esc(v.name)}">⚡ 快捷补记</button>` : '');
    return `<li class="vx-li ${st}">
      <span class="vx-dot">${rec ? '✓' : due ? '!' : ''}</span>
      <div class="vx-body">${main}${sub}</div>${act}
    </li>`;
  }).join('');

  const vaccineOptions = vaccineNames().map((n) => `<option>${esc(n)}</option>`).join('');
  const vaccineForm = `
    <form data-form="vaccine">
      ${DATE_FIELD('接种日期')}
      <label class="field"><span>疫苗名称（参考天津免疫规划）</span><select name="name">${vaccineOptions}<option>其他（自定义）</option></select></label>
      <label class="field"><span>备注</span><input type="text" name="note" placeholder="如 接种部位、反应"></label>
      <button class="btn btn-primary btn-block" ${w ? '' : 'disabled'}>记录疫苗</button>
    </form>`;

  const pct = VACCINES.length ? doneCnt / VACCINES.length : 0;
  const vaxHead = `
    <div class="vx-head">
      ${progressRingSVG(pct)}
      <div class="vx-sum">
        <div class="vx-sum-title">接种进度</div>
        <div class="vx-sum-nums"><b class="ok">${doneCnt}</b> 已接种 · <b class="warn">${dueCnt}</b> 待接种 · <b class="dim">${futureCnt}</b> 未到期</div>
        <div class="vx-sum-sub">参考天津市免疫规划（共 ${VACCINES.length} 剂）</div>
      </div>
    </div>`;

  const measureList = recs.filter((r) => r.type === 'measure').sort((a, b) => b.ts - a.ts);
  const lastM = measureList[0];
  const latestStrip = lastM
    ? `<div class="latest-strip">
        <div class="ls-item"><span class="ls-ic">⚖️</span><b>${esc(lastM.value.weight || '–')}</b><i>kg 体重</i></div>
        <div class="ls-item"><span class="ls-ic">📐</span><b>${esc(lastM.value.height || '–')}</b><i>cm 身高</i></div>
        <div class="ls-item"><span class="ls-ic">🧠</span><b>${esc(lastM.value.head || '–')}</b><i>cm 头围</i></div>
        <div class="ls-date">${fmtDate(lastM.ts)}</div>
      </div>`
    : '<p class="muted">还没有体测记录，记一次就能看到生长评价～</p>';

  const measureForm = `
    <form data-form="measure">
      ${DATE_FIELD('日期')}
      <label class="field"><span>体重 (kg)</span><input type="number" step="0.01" name="weight" placeholder="如 7.2"></label>
      <label class="field"><span>身高/身长 (cm)</span><input type="number" step="0.1" name="height" placeholder="如 68"></label>
      <label class="field"><span>头围 (cm)</span><input type="number" step="0.1" name="head" placeholder="如 43"></label>
      <label class="field"><span>备注</span><input type="text" name="note" placeholder="选填"></label>
      <button class="btn btn-primary btn-block" ${w ? '' : 'disabled'}>保存体测</button>
    </form>`;

  const healthRecs = recs.filter((r) => r.type === 'temp' || r.type === 'medication').sort((a, b) => b.ts - a.ts).slice(0, 6);
  const healthRecRows = healthRecs.length
    ? healthRecs.map((r) => `
      <li class="vx-li done">
        <span class="vx-dot">${r.type === 'temp' ? '🌡' : '💊'}</span>
        <div class="vx-body">
          <span class="vx-name">${r.type === 'temp' ? (esc(r.value.temp) + '℃') : esc(r.value.med || '') + (r.value.dose ? ' ' + esc(r.value.dose) + esc(r.value.unit || '') : '')}</span>
          <span class="vx-meta">${fmtDate(r.ts)} ${fmtTime(r.ts)} · ${esc(r.operatorName)}</span>
        </div>
      </li>`).join('')
    : '<li class="muted center" style="padding:8px 0">暂无体温 / 用药记录</li>';

  const tempForm = `
    <form data-form="temp">
      ${DATE_FIELD('日期')}
      <label class="field"><span>体温 (℃)</span><input type="number" step="0.1" name="temp" required placeholder="体温"></label>
      <label class="field"><span>备注</span><input type="text" name="note" placeholder="选填"></label>
      <button class="btn btn-primary btn-block" ${w ? '' : 'disabled'}>保存体温</button>
    </form>`;
  const medForm = `
    <form data-form="medication">
      ${DATE_FIELD('日期')}
      <label class="field"><span>药品名称</span><input type="text" name="med" required placeholder="如 布洛芬"></label>
      <label class="field"><span>剂量</span><input type="text" name="dose" placeholder="如 3"></label>
      <label class="field"><span>单位</span><select name="unit"><option>ml</option><option>mg</option><option>滴</option><option>袋</option></select></label>
      <label class="field"><span>备注</span><input type="text" name="note" placeholder="选填"></label>
      <button class="btn btn-primary btn-block" ${w ? '' : 'disabled'}>保存用药</button>
    </form>`;

  const emptyState = '<p class="muted">当前为只读权限，无法添加记录。</p>';
  const vaccineCard = `
    <div class="card grow-card pop-in">
      <h2>💉 疫苗接种</h2>
      ${vaxHead}
      <ul class="vx-tl">${vxItems}</ul>
      ${w ? `<details class="fold" id="vaxFold"><summary>✏️ 手动补记疫苗</summary>${vaccineForm}</details>` : emptyState}
    </div>`;

  const measureCard = `
    <div class="card grow-card pop-in">
      <h2>📏 体测</h2>
      ${latestStrip}
      ${w ? `<details class="fold"><summary>✏️ 记一次体测</summary>${measureForm}</details>` : emptyState}
    </div>`;

  const healthCard = `
    <div class="card grow-card pop-in">
      <h2>🌡 体温 / 用药</h2>
      ${w ? `<details class="fold"><summary>🌡 记体温</summary>${tempForm}</details>
      <details class="fold"><summary>💊 记用药</summary>${medForm}</details>` : emptyState}
      <div class="chart-title" style="margin-top:12px">最近记录</div>
      <ul class="vx-tl">${healthRecRows}</ul>
    </div>`;

  return `${vaccineCard}${measureCard}${growthEvalCardHTML()}${healthCard}`;
}

// ---- 日常（吃[含辅食打卡] / 拉 / 睡 / 喝） ----
function foodChipsHTML() {
  return FOOD_CATEGORIES.map((c) => `
    <div style="width:100%"><div class="muted" style="margin:8px 0 4px">${c.group}</div>
    <div class="chips">${c.items.map((n) => `<button type="button" class="chip ${state.foodSel.has(n) ? 'on' : ''}" data-action="food" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div></div>
  `).join('') + `
    <div style="width:100%"><div class="muted" style="margin:8px 0 4px">已添加自定义</div>
    <div class="chips" id="customFoods"></div>
    <div class="row" style="margin-top:8px">
      <input type="text" id="customFoodInput" placeholder="添加自定义食材">
      <button class="btn btn-sm" data-action="addCustomFood">添加</button>
    </div></div>`;
}

async function dailyHTML() {
  const w = canWrite(state.current.me.role);

  const feedForm = `
    <form data-form="feed">
      ${DATE_FIELD('日期')}
      <label class="field"><span>类型</span><select name="kind" id="feedKind"><option>母乳</option><option>配方奶</option><option>辅食</option><option>水</option></select></label>
      <div id="feedFoodBox" class="food-box hidden">
        <div class="muted" style="margin:4px 0 6px">🥦 选择今天吃的辅食（可多选打卡）：</div>
        ${foodChipsHTML()}
      </div>
      <label class="field"><span>量 (ml)</span><input type="number" name="amount" placeholder="选填"></label>
      <label class="field"><span>备注</span><input type="text" name="note" placeholder="选填"></label>
      <button class="btn btn-primary btn-block" ${w ? '' : 'disabled'}>保存吃</button>
    </form>`;
  const poopForm = `
    <form data-form="poop">
      ${DATE_FIELD('日期')}
      <label class="field"><span>性状</span><select name="type"><option>正常</option><option>偏干</option><option>偏稀</option><option>水样</option></select></label>
      <label class="field"><span>颜色</span><select name="color"><option>黄</option><option>绿</option><option>褐</option><option>其他</option></select></label>
      <label class="field"><span>备注</span><input type="text" name="note" placeholder="选填"></label>
      <button class="btn btn-primary btn-block" ${w ? '' : 'disabled'}>保存拉</button>
    </form>`;
  const sleepForm = `
    <form data-form="sleep">
      ${DATE_FIELD('日期')}
      <label class="field"><span>开始时间</span><input type="time" name="start"></label>
      <label class="field"><span>时长 (分钟)</span><input type="number" name="duration" placeholder="如 120"></label>
      <label class="field"><span>备注</span><input type="text" name="note" placeholder="选填"></label>
      <button class="btn btn-primary btn-block" ${w ? '' : 'disabled'}>保存睡</button>
    </form>`;
  const drinkForm = `
    <form data-form="drink">
      ${DATE_FIELD('日期')}
      <label class="field"><span>喝水次数</span><input type="number" name="times" placeholder="如 6"></label>
      <label class="field"><span>总量 (ml)</span><input type="number" name="ml" placeholder="如 300"></label>
      <label class="field"><span>备注</span><input type="text" name="note" placeholder="选填"></label>
      <button class="btn btn-primary btn-block" ${w ? '' : 'disabled'}>保存喝</button>
    </form>`;

  const hint = '<p class="daily-hint">⚡ 高频记录请用<b>首页一键记录</b>，这里用于补记历史～</p>';
  return `
    <div class="card pop-in"><h2>🍽 吃 <span class="muted">（选「辅食」可同时打卡食材）</span></h2>${hint}<details class="fold" open><summary>✏️ 补记「吃」</summary>${feedForm}</details></div>
    <div class="card pop-in"><h2>💧 喝</h2>${hint}<details class="fold"><summary>✏️ 补记「喝」</summary>${drinkForm}</details></div>
    <div class="card pop-in"><h2>💩 拉</h2>${hint}<details class="fold"><summary>✏️ 补记「拉」</summary>${poopForm}</details></div>
    <div class="card pop-in"><h2>😴 睡</h2>${hint}<details class="fold"><summary>✏️ 补记「睡」</summary>${sleepForm}</details></div>`;
}

// ---- 图册 ----
function albumHTML() {
  const w = canWrite(state.current.me.role);
  return `
  <div class="card">
    <h2>🖼 图册</h2>
    ${w ? `${DATE_FIELD('照片日期')}
      <input type="file" id="albumFile" accept="image/*" ${w ? '' : 'disabled'}><br><br>
      <label class="field"><span>说明</span><input type="text" id="albumCap" placeholder="如：第一次自己坐"></label>
      <button class="btn btn-primary btn-block" data-action="albumUpload">上传图片</button>
      <p class="muted">图片会自动压缩（最长边≤1600px）后保存：本地模式存于本机，云端模式上传至腾讯云对象存储并生成 CDN 链接。</p>`
      : '<p class="muted">当前为只读权限，无法上传。</p>'}
    <div class="gallery" id="gallery" style="margin-top:12px"></div>
  </div>`;
}

// ---- 日记（私密，密码保护） ----
async function diaryHTML() {
  const me = state.current.me;
  if (!state.diary.unlocked) {
    const hasPwd = await store.hasDiaryPassword();
    if (!hasPwd) {
      return `
      <div class="card diary-card">
        <h2>📓 日记</h2>
        <p class="muted">日记仅自己可见。首次使用请设置访问密码。</p>
        <form data-form="diarySetupPassword">
          <label class="field"><span>设置密码</span><input type="password" name="pwd" required placeholder="6 位以上"></label>
          <label class="field"><span>确认密码</span><input type="password" name="pwd2" required placeholder="再次输入"></label>
          <p class="muted">⚠️ 请牢记密码，丢失后无法找回日记内容。</p>
          <button class="btn btn-primary btn-block">设置密码并进入</button>
          ${state.diary.error ? `<p class="error">${esc(state.diary.error)}</p>` : ''}
        </form>
      </div>`;
    }
    return `
    <div class="card diary-card">
      <h2>📓 日记</h2>
      <p class="muted">日记内容已加密，仅本人可查看。请输入密码解锁。</p>
      <form data-form="diaryUnlock">
        <label class="field"><span>密码</span><input type="password" name="pwd" required placeholder="日记密码"></label>
        <button class="btn btn-primary btn-block">解锁</button>
        ${state.diary.error ? `<p class="error">${esc(state.diary.error)}</p>` : ''}
      </form>
    </div>`;
  }
  const editingId = state.diary.editingId;
  let editing = null;
  const list = await store.listDiaries(state.diary.password);
  if (editingId) editing = list.find((d) => d._id === editingId) || null;

  const formHTML = `
    <div class="card diary-card">
      <h2>${editing ? '✏️ 编辑日记' : '📝 写新日记'}</h2>
      <form data-form="${editing ? 'diaryEdit' : 'diaryNew'}" data-id="${editing ? editing._id : ''}">
        ${DATE_FIELD('日记日期', editing ? editing.date : todayStr())}
        <label class="field"><span>内容</span><textarea name="content" required placeholder="记录今天的心情、发现或想对自己说的话…">${editing ? esc(editing.content) : ''}</textarea></label>
        <div class="row" style="justify-content:space-between;align-items:center;">
          <button class="btn btn-ghost" type="button" data-action="diaryCancelEdit">取消</button>
          <button class="btn btn-primary">${editing ? '保存修改' : '保存日记'}</button>
        </div>
      </form>
    </div>`;

  const listHTML = list.length === 0
    ? '<div class="card"><p class="muted center">还没有日记，写第一篇吧。</p></div>'
    : `<div class="card diary-list">${list.map((d) => `
      <div class="diary-item">
        <div class="spread">
          <span class="diary-date">${esc(d.date)}</span>
          <span class="muted">${fmtTime(d.ts)}</span>
        </div>
        <div class="diary-content">${esc(d.content).replace(/\n/g, '<br>')}</div>
        <div class="diary-ops">
          <button class="btn btn-ghost btn-sm" data-action="diaryEdit" data-id="${d._id}">编辑</button>
          <button class="btn btn-danger btn-sm" data-action="diaryDelete" data-id="${d._id}">删除</button>
        </div>
      </div>
    `).join('')}</div>`;

  return `
    <div class="card diary-card">
      <div class="spread" style="align-items:center;">
        <h2 style="margin:0">📓 ${esc(me.name)} 的日记</h2>
        <button class="btn btn-ghost btn-sm" data-action="diaryLock">锁定</button>
      </div>
      <p class="muted">仅自己可见，内容已加密。</p>
    </div>
    ${formHTML}
    ${listHTML}
    <div class="card">
      <button class="btn btn-ghost btn-block" data-action="diaryChangePwd">修改日记密码</button>
    </div>`;
}

// ---- 成员 ----
function membersHTML() {
  const { fam, me } = state.current;
  const isAdmin = canManage(me.role);
  const switchHTML = `
    <div class="card">
      <h2>🧑 当前身份</h2>
      <p class="muted">同设备多人使用时，先选择「你是谁」，记录与日记会记到对应成员名下。</p>
      <select data-action="switchMember" style="width:100%;padding:12px">
        ${fam.members.map((m) => `<option value="${m._id}" ${m._id === me._id ? 'selected' : ''}>${esc(m.name)}（${roleBadge(m.role).replace(/<[^>]+>/g, '')}）</option>`).join('')}
      </select>
    </div>`;
  const rows = fam.members.map((m) => `
    <div class="member">
      <div class="avatar" style="background:${m.color}">${esc(m.name.slice(0, 1))}</div>
      <div style="flex:1">
        <div>${esc(m.name)} ${roleBadge(m.role)}</div>
        <div class="muted">${m._id === me._id ? '（我）' : ''}</div>
      </div>
      ${isAdmin && m._id !== me._id ? `
        <select data-action="role" data-id="${m._id}" style="width:auto;padding:6px">
          ${ROLE_OPTIONS.map((o) => `<option value="${o.value}" ${m.role === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
        <button class="btn btn-danger btn-sm" data-action="kick" data-id="${m._id}">移除</button>` : ''}
    </div>`).join('');
  return `
  ${switchHTML}
  <div class="card">
    <h2>👨‍👩‍👧 家庭成员</h2>
    ${rows}
    ${isAdmin ? `<div class="spread" style="margin-top:12px"><span class="muted">家庭邀请码</span><code class="box">${esc(fam.inviteCode)}</code></div>
      <p class="muted">把邀请码发给爷爷奶奶、姥姥姥爷（记录员）和亲友（只读），他们在首页「加入家庭」即可。</p>` : ''}
  </div>`;
}

// ---- 设置 ----
function settingsHTML() {
  const { me, fam } = state.current;
  const isAdmin = canManage(me.role);
  const profile = fam.profile || { birthDate: '2025-01-24', sex: 'boy', name: '拳拳' };
  return `
  <div class="card pop-in">
    <h2>👶 宝宝档案</h2>
    <form data-form="profile">
      <label class="field"><span>昵称</span><input type="text" name="name" value="${esc(profile.name || '拳拳')}"></label>
      <label class="field"><span>出生日期</span><input type="date" name="birthDate" value="${esc(profile.birthDate || '2025-01-24')}" required></label>
      <label class="field"><span>性别</span>
        <select name="sex"><option value="boy" ${profile.sex === 'boy' ? 'selected' : ''}>男</option><option value="girl" ${profile.sex === 'girl' ? 'selected' : ''}>女</option></select>
      </label>
      <button class="btn btn-primary btn-block" ${isAdmin ? '' : 'disabled'}>保存档案</button>
      ${!isAdmin ? '<p class="muted">仅管理员可修改宝宝档案</p>' : ''}
    </form>
  </div>
  <div class="card pop-in">
    <h2>⚙️ 设置</h2>
    <p class="muted">当前模式：${store.isCloud() ? '云端 (CloudBase)' : '本地演示 (localStorage)'}</p>
    <button class="btn btn-block" data-action="copyRestore" style="margin-top:10px">🔗 复制身份恢复链接（换设备找回自己）</button>
    <p class="muted" style="margin-top:6px">链接含你的专属身份，仅发给自己，勿外传；在新设备打开即可回到当前身份（含日记）。</p>
    ${isAdmin ? `<button class="btn btn-block" data-action="export">📦 导出全部数据 (JSON)</button>
      <p class="muted" style="margin-top:8px">⚠️ 数据红线：请每月导出一次 JSON 备份到本地/网盘。云端环境到期释放后不可恢复。</p>` : ''}
    <button class="btn btn-ghost btn-block" style="margin-top:10px" data-action="logout">退出当前账号</button>
  </div>`;
}

// ---- 科普（官方政策法规，按重要度排序 + 搜索） ----
async function scienceHTML() {
  const sorted = [...POLICIES].sort((a, b) => a.importance - b.importance);
  return `
    <div class="card science-head">
      <h2>📚 育儿科普 · 官方政策</h2>
      <p class="muted">收录 0–7 岁（拳拳）成长相关的官方政策法规，按重要度排序，是「健康」记录与「智能分析」的官方参考依据。</p>
      <input type="search" id="policySearch" placeholder="🔍 搜索：辅食 / 牙齿 / 疫苗 / 生长 / 近视…">
    </div>
    <div id="policyList">${policyCardsHTML(sorted)}</div>`;
}

function policyCardsHTML(list) {
  if (!list.length) return '<div class="card"><p class="muted center">没有匹配的政策，换个关键词试试～</p></div>';
  return list.map((p) => {
    const cat = POLICY_CATEGORIES.find((c) => c.key === p.category) || {};
    const rk = p.importance <= 3 ? 'top' : (p.importance <= 8 ? 'hot' : '');
    const rank = rk ? `<span class="rank rank-${rk}">No.${p.importance}</span>` : `<span class="rank">No.${p.importance}</span>`;
    return `
    <div class="card policy" data-action="policyRead" data-id="${p.id}" role="button" tabindex="0">
      <div class="policy-top">
        ${rank}
        <span class="badge" style="background:${cat.color}">${cat.label}</span>
        <span class="muted policy-module">${esc(p.module)}</span>
      </div>
      <h3 class="policy-title">${esc(p.title)}</h3>
      <div class="policy-meta">${esc(p.issuer)} · ${esc(p.date)} · ${esc(p.docNo)}</div>
      <div class="policy-summary">${esc(p.summary)}</div>
      <div class="policy-points">${p.keyPoints.map((k) => `<div class="pp">· ${esc(k)}</div>`).join('')}</div>
      <div class="policy-tags">${p.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}</div>
      <div class="policy-read-hint">📖 点击阅读全文 →</div>
    </div>`;
  }).join('');
}

// 科普阅读器（类电子书）：点击卡片按条展示官方内容 + 原文/附件入口
function policyReaderHTML(p) {
  const cat = POLICY_CATEGORIES.find((c) => c.key === p.category) || {};
  const isPdf = /\.pdf($|\?)/i.test(p.link);
  return `
  <div class="reader">
    <div class="reader-bar">
      <button class="reader-close" data-action="closeReader" type="button">← 返回科普</button>
      <div class="reader-progress"><div class="reader-progress-fill"></div></div>
      <span class="badge" style="background:${cat.color}">${esc(cat.label)}</span>
    </div>
    <article class="reader-body">
      <div class="reader-rank">No.${p.importance} · 重要度排序</div>
      <h1 class="reader-title">${esc(p.title)}</h1>
      <div class="reader-meta">${esc(p.issuer)} · ${esc(p.date)}</div>
      <div class="reader-sub">文号：${esc(p.docNo)} ｜ 适用：${esc(p.ageRange)} ｜ 关联功能：${esc(p.module)}</div>
      <section class="reader-chap"><h2>📌 摘要</h2><p>${esc(p.summary)}</p></section>
      <section class="reader-chap"><h2>✨ 核心要点（按条）</h2><ol class="reader-points">${p.keyPoints.map((k) => `<li>${esc(k)}</li>`).join('')}</ol></section>
      ${p.embedded ? `<section id="policyFullBody" class="reader-chap reader-loading"><h2>📄 官方内容（内嵌摘录）</h2><p class="muted">正在加载…</p></section>` : ''}
      <section class="reader-chap"><h2>🏷 关键词</h2><div class="reader-tags">${p.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}</div></section>
      <section class="reader-chap reader-source-box">
        <h2>🔗 官方原文${isPdf ? '（附件：标准全文 PDF）' : ''}</h2>
        <p class="muted">以下为官方发布来源，点击跳转查阅完整条文与附件。</p>
        <a class="reader-source" href="${esc(p.link)}" target="_blank" rel="noopener">查看官方原文 ↗</a>
      </section>
      <div class="reader-end">— 已读至底 · 拳拳成长记录 —</div>
    </article>
  </div>`;
}

function openReader(html) {
  const mask = document.createElement('div');
  mask.className = 'reader-mask';
  mask.innerHTML = html;
  mask.addEventListener('click', (e) => {
    if (e.target === mask || e.target.closest('[data-action="closeReader"]')) mask.remove();
  });
  document.body.appendChild(mask);
  const body = mask.querySelector('.reader-body');
  const fill = mask.querySelector('.reader-progress-fill');
  const upd = () => {
    const h = body.scrollHeight - body.clientHeight;
    fill.style.width = (h > 0 ? (body.scrollTop / h) * 100 : 0) + '%';
  };
  if (body && fill) { body.addEventListener('scroll', upd); requestAnimationFrame(upd); }
}

// 科普内嵌全文懒加载：点开阅读器后才动态 import 内容模块（首屏包不变、文件很小）。
async function loadPolicyFullContent(id) {
  const box = document.getElementById('policyFullBody');
  if (!box) return;
  try {
    const mod = await import('./policy-content.js');
    const html = mod.POLICY_CONTENT[id];
    if (html) {
      box.classList.remove('reader-loading');
      box.innerHTML = `<h2>📄 官方内容摘要（内嵌摘录）</h2>${html}`;
    } else {
      box.remove();
    }
  } catch (e) {
    console.warn('科普内容加载失败：', e);
    box.remove();
  }
}

// ============ 统计与分析 ============
function periodRange(p) {
  const now = Date.now();
  const DAY = 86400000;
  if (p === 'day') {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return { start: d.getTime(), end: now, label: '今天' };
  }
  if (p === 'week') {
    const d = new Date(); const day = d.getDay(); const diff = (day + 6) % 7;
    const s = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff); s.setHours(0, 0, 0, 0);
    return { start: s.getTime(), end: now, label: '本周' };
  }
  if (p === 'month') {
    const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth(), 1); s.setHours(0, 0, 0, 0);
    return { start: s.getTime(), end: now, label: '本月' };
  }
  if (p === 'quarter') {
    const d = new Date(); const q = Math.floor(d.getMonth() / 3); const s = new Date(d.getFullYear(), q * 3, 1); s.setHours(0, 0, 0, 0);
    return { start: s.getTime(), end: now, label: '本季度' };
  }
  if (p === 'halfyear') {
    const d = new Date(); const h = d.getMonth() < 6 ? 0 : 6; const s = new Date(d.getFullYear(), h, 1); s.setHours(0, 0, 0, 0);
    return { start: s.getTime(), end: now, label: '近半年' };
  }
  if (p === 'year') {
    const d = new Date(); const s = new Date(d.getFullYear(), 0, 1); s.setHours(0, 0, 0, 0);
    return { start: s.getTime(), end: now, label: '今年' };
  }
  return { start: 0, end: now, label: '全部' };
}

// 按周期把时间轴切成若干连续桶（用于画趋势曲线）
function getBuckets(p) {
  const now = new Date();
  const sod = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  if (p === 'day') {
    const base = sod(now);
    return Array.from({ length: 24 }, (_, h) => {
      const s = new Date(base); s.setHours(h, 0, 0, 0); const e = new Date(s); e.setHours(h + 1, 0, 0, 0);
      return { label: `${h}时`, start: s.getTime(), end: e.getTime() };
    });
  }
  if (p === 'week') {
    const d = new Date(); const day = d.getDay(); const diff = (day + 6) % 7;
    const s = sod(new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff));
    const arr = [];
    for (let i = 0; i < 7; i++) { const st = new Date(s); st.setDate(s.getDate() + i); const en = new Date(st); en.setDate(st.getDate() + 1); arr.push({ label: `${st.getMonth() + 1}/${st.getDate()}`, start: st.getTime(), end: en.getTime() }); }
    return arr;
  }
  if (p === 'month') {
    const y = now.getFullYear(), m = now.getMonth(); const days = new Date(y, m + 1, 0).getDate(); const arr = [];
    for (let d = 1; d <= days; d++) { const st = new Date(y, m, d); const en = new Date(y, m, d + 1); arr.push({ label: `${d}`, start: st.getTime(), end: en.getTime() }); }
    return arr;
  }
  if (p === 'quarter') { const q = Math.floor(now.getMonth() / 3); return monthBuckets(now.getFullYear(), q * 3, 3); }
  if (p === 'halfyear') { const h = now.getMonth() < 6 ? 0 : 6; return monthBuckets(now.getFullYear(), h, 6); }
  if (p === 'year') { return monthBuckets(now.getFullYear(), 0, 12); }
  return [{ label: '全部', start: 0, end: Date.now() }];
}
function monthBuckets(y, m0, n) {
  const arr = [];
  for (let i = 0; i < n; i++) { const st = new Date(y, m0 + i, 1); const en = new Date(y, m0 + i + 1, 1); arr.push({ label: `${m0 + i + 1}月`, start: st.getTime(), end: en.getTime() }); }
  return arr;
}
// 把记录按桶累加得到序列（valueFn 返回该条记录的贡献值，0/空跳过）
function seriesByBucket(records, buckets, valueFn) {
  const sums = buckets.map(() => 0);
  for (const r of records) {
    for (let i = 0; i < buckets.length; i++) {
      if (r.ts >= buckets[i].start && r.ts < buckets[i].end) { const v = valueFn(r); if (v) sums[i] += v; break; }
    }
  }
  return buckets.map((b, i) => ({ label: b.label, value: sums[i] }));
}

function lineChartSVG(points, { unit = '', color = '#FF8A5B', height = 150, width = 320, area = true } = {}) {
  if (!points.length) return '<p class="muted">暂无数据</p>';
  if (points.length === 1) points = [points[0], { ...points[0], value: points[0].value + (points[0].value ? 0 : 1) }];
  const padL = 34, padR = 10, padT = 12, padB = 20;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = (max - min) || 1;
  const x = (i) => padL + (innerW * i) / (points.length - 1);
  const y = (v) => padT + innerH - ((v - min) / span) * innerH;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const areaPath = `M${x(0).toFixed(1)},${(padT + innerH).toFixed(1)} ` + points.map((p, i) => `L${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ') + ` L${x(points.length - 1).toFixed(1)},${(padT + innerH).toFixed(1)} Z`;
  const dots = points.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="3" fill="${color}"/>`).join('');
  const labIdx = points.length <= 2 ? [0, points.length - 1] : [0, Math.floor(points.length / 2), points.length - 1];
  const labels = labIdx.map((i) => `<text x="${x(i).toFixed(1)}" y="${height - 5}" font-size="9" fill="#9a8aa8" text-anchor="middle">${points[i].label}</text>`).join('');
  const yLabels = [min, max].map((v) => `<text x="${padL - 4}" y="${(y(v) + 3).toFixed(1)}" font-size="8" fill="#9a8aa8" text-anchor="end">${v}${unit}</text>`).join('');
  const gid = 'g' + Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px;display:block;margin:0 auto">
    ${area ? `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".30"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${areaPath}" fill="url(#${gid})"/>` : ''}
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    ${dots}${labels}${yLabels}</svg>`;
}

function barChartSVG(items, { color = '#4DB6E8', height = 140, width = 320, unit = '' } = {}) {
  if (!items.length) return '<p class="muted">暂无数据</p>';
  const padL = 8, padR = 8, padT = 16, padB = 20;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const max = Math.max(...items.map((i) => i.value), 1);
  const gap = innerW / items.length, bw = gap * 0.58;
  const labIdx = items.length <= 8 ? items.map((_, i) => i) : [0, Math.floor(items.length / 2), items.length - 1];
  const bars = items.map((it, i) => {
    const h = (it.value / max) * innerH;
    const x = padL + gap * i + (gap - bw) / 2, y = padT + innerH - h;
    const showVal = items.length <= 14;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(h, 0.5).toFixed(1)}" rx="5" fill="${color}"/>
      ${showVal && it.value ? `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 3).toFixed(1)}" font-size="8" fill="#9a8aa8" text-anchor="middle">${it.value}</text>` : ''}
      ${labIdx.includes(i) ? `<text x="${(x + bw / 2).toFixed(1)}" y="${height - 5}" font-size="8" fill="#9a8aa8" text-anchor="middle">${it.label}</text>` : ''}`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px;display:block;margin:0 auto">${bars}</svg>`;
}

function hbar(label, value, max, color) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return `<div class="hbar"><span class="hbar-label">${label}</span>
    <span class="hbar-track"><span class="hbar-fill" style="width:${pct}%;background:${color}"></span></span>
    <span class="hbar-val">${value}</span></div>`;
}

async function computeStats(period) {
  const { start, end, label } = periodRange(period);
  const all = await store.listRecords({ limit: 99999 });
  const inR = all.filter((r) => r.ts >= start && r.ts <= end);
  const periodDays = Math.max(1, Math.ceil((end - start) / 86400000));

  const measures = all.filter((r) => r.type === 'measure').sort((a, b) => a.ts - b.ts);
  const measuresIn = measures.filter((m) => m.ts >= start && m.ts <= end);
  const growthMeasures = measuresIn.length >= 2 ? measuresIn : measures; // 成长曲线优先展示周期内，否则回退全量

  const vaccines = all.filter((r) => r.type === 'vaccine');
  const completedVaccines = new Set(vaccines.map((v) => v.value.name)).size;

  const feeds = inR.filter((r) => r.type === 'feed');
  const drinks = inR.filter((r) => r.type === 'drink');
  const poops = inR.filter((r) => r.type === 'poop');
  const sleeps = inR.filter((r) => r.type === 'sleep');

  const feedKinds = {};
  for (const f of feeds) feedKinds[f.value.kind || '?'] = (feedKinds[f.value.kind || '?'] || 0) + 1;
  const foodFreq = {};
  for (const f of feeds) for (const n of (f.value.foods || [])) foodFreq[n] = (foodFreq[n] || 0) + 1;
  const foodRank = Object.entries(foodFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const drinkTimes = drinks.reduce((s, d) => s + (Number(d.value.times) || 0), 0);
  const drinkMl = drinks.reduce((s, d) => s + (Number(d.value.ml) || 0), 0);
  const poopCount = poops.length;
  const sleepMin = sleeps.reduce((s, x) => s + (Number(x.value.duration) || 0), 0);

  // 周期分桶趋势
  const buckets = getBuckets(period);
  const drinkSeries = seriesByBucket(drinks, buckets, (r) => Number(r.value.ml) || 0);
  const feedSeries = seriesByBucket(feeds, buckets, () => 1);
  const poopSeries = seriesByBucket(poops, buckets, () => 1);
  const sleepSeries = seriesByBucket(sleeps, buckets, (r) => Number(r.value.duration) || 0);

  // 上一周期（等长、紧邻）用于环比
  const len = end - start;
  const prevStart = start - len, prevEnd = start;
  const prevIn = all.filter((r) => r.ts >= prevStart && r.ts < prevEnd);
  const prevDays = Math.max(1, Math.ceil(len / 86400000));
  const prevDrinkMl = prevIn.filter((r) => r.type === 'drink').reduce((s, r) => s + (Number(r.value.ml) || 0), 0);
  const prevSleepMin = prevIn.filter((r) => r.type === 'sleep').reduce((s, r) => s + (Number(r.value.duration) || 0), 0);
  const prevFeed = prevIn.filter((r) => r.type === 'feed').length;
  const prevPoop = prevIn.filter((r) => r.type === 'poop').length;

  const albumCount = (await store.listAlbum()).length;
  const diaryCount = (await store.listDiaries(state.diary.password || 'x')).length;

  // ---- 智能分析 ----
  const insights = [];
  if (measures.length >= 2) {
    const a = measures[0], b = measures[measures.length - 1];
    if (a.value.weight && b.value.weight) insights.push(`📏 从 ${fmtDate(a.ts)} 到 ${fmtDate(b.ts)}，体重从 ${a.value.weight}kg 增长到 ${b.value.weight}kg，长了 ${(b.value.weight - a.value.weight).toFixed(2)}kg。`);
    if (a.value.height && b.value.height) insights.push(`📐 身高从 ${a.value.height}cm 长到 ${b.value.height}cm。`);
  } else if (measures.length === 1) {
    const m = measures[0];
    insights.push(`📏 最新体测（${fmtDate(m.ts)}）：体重 ${m.value.weight || '-'}kg，身高 ${m.value.height || '-'}cm，头围 ${m.value.head || '-'}cm。`);
  }
  insights.push(`💉 疫苗已记录 ${completedVaccines}/${VACCINES.length} 种，还差 ${VACCINES.length - completedVaccines} 种未记录。`);
  if (drinkMl > 0) {
    insights.push(`💧 ${label}喝水 ${drinkMl}ml（${drinkTimes} 次），日均约 ${Math.round(drinkMl / periodDays)}ml。`);
    if (prevDrinkMl > 0) insights.push(trendText(drinkMl / periodDays, prevDrinkMl / prevDays, '日均喝水', 'ml'));
  }
  if (sleepMin > 0) {
    insights.push(`😴 ${label}睡眠共 ${Math.round(sleepMin / 60)} 小时，日均约 ${Math.round(sleepMin / periodDays)} 分钟。`);
    if (prevSleepMin > 0) insights.push(trendText(sleepMin / periodDays, prevSleepMin / prevDays, '日均睡眠', '分钟'));
  }
  if (poopCount > 0) {
    insights.push(`💩 ${label}排泄 ${poopCount} 次。` + (prevPoop > 0 ? trendText(poopCount / periodDays, prevPoop / prevDays, '日均排泄', '次') : ''));
  }
  if (feeds.length > 0) {
    insights.push(`🍽 ${label}喂养 ${feeds.length} 次。`);
    if (prevFeed > 0) insights.push(trendText(feeds.length / periodDays, prevFeed / prevDays, '日均喂养', '次'));
  }
  if (foodRank.length) insights.push(`🥦 尝试最多的辅食：${foodRank.slice(0, 3).map((x) => x[0]).join('、')}。`);

  // 接入官方政策参考范围：对照《生长标准》《辅食指南》《近视防治》等给出标准化提示
  insights.push(...policyInsights({ measures, feeds, drinks, sleeps, poops, vaccines }));

  if (insights.length <= 2) insights.push('📝 再多记录几天不同板块的数据，分析会越来越准哦～');

  return {
    period, label, total: inR.length, periodDays,
    measures, measuresIn, growthMeasures, completedVaccines,
    feeds, drinks, poops, sleeps,
    feedKinds, foodRank, drinkTimes, drinkMl, poopCount, sleepMin,
    drinkSeries, feedSeries, poopSeries, sleepSeries, buckets,
    albumCount, diaryCount, insights,
    lastWeight: measures.length ? measures[measures.length - 1].value.weight : null,
    lastWeightDate: measures.length ? measures[measures.length - 1].ts : null,
  };
}

function trendText(now, prev, label, unit) {
  const diff = now - prev;
  const pct = prev ? Math.round((diff / prev) * 100) : 0;
  if (Math.abs(pct) < 3) return `📊 ${label}与上一周期基本持平（约 ${Math.round(now)}${unit}）。`;
  const up = diff > 0;
  const arrow = up ? '⬆️' : '⬇️';
  const word = up ? '增加' : '减少';
  return `📊 与上一周期相比，${label}${word}了 ${Math.abs(pct)}%（${arrow} 约 ${Math.round(now)}${unit}）。`;
}

async function statsHTML() {
  const p = state.statsPeriod || 'week';
  const d = await computeStats(p);
  const periods = [['day', '🌞', '日'], ['week', '📅', '周'], ['month', '🗓', '月'], ['quarter', '🌿', '季度'], ['halfyear', '🌳', '半年'], ['year', '🎆', '年']];
  const periodBar = `<div class="periods">${periods.map(([k, ic, t]) => `<button class="pill ${p === k ? 'on' : ''}" data-action="statsPeriod" data-period="${k}"><span class="pic">${ic}</span>${t}</button>`).join('')}</div>`;
  return `
    <div class="stats-wrap">
      ${periodBar}
      ${growthEvalCardHTML()}
      ${statBlocksHTML(d)}
      <div class="card pop-in"><p class="muted center">🖼 图册 ${d.albumCount} 张 · 📓 日记 ${d.diaryCount} 篇</p></div>
      ${insightBoxHTML(d)}
      ${exportReportBarHTML()}
    </div>`;
}

// 统计卡片（屏幕与 PDF 共用；PDF 传 {area:false} 去掉渐变填充，避免截图异常）
function statBlocksHTML(d, opts = {}) {
  const area = opts.area !== false;
  const wKg = d.growthMeasures.filter((m) => m.value.weight).map((m) => ({ label: fmtMD(m.ts), value: Number(m.value.weight) }));
  const wHt = d.growthMeasures.filter((m) => m.value.height).map((m) => ({ label: fmtMD(m.ts), value: Number(m.value.height) }));
  const wHd = d.growthMeasures.filter((m) => m.value.head).map((m) => ({ label: fmtMD(m.ts), value: Number(m.value.head) }));

  const hero = `
    <div class="hero-row">
      <div class="hero h-total"><span class="hero-ic">📒</span><div class="hero-num">${d.total}</div><div class="hero-lbl">${d.label}记录</div></div>
      <div class="hero h-weight"><span class="hero-ic">⚖️</span><div class="hero-num">${d.lastWeight || '–'}${d.lastWeight ? '<small>kg</small>' : ''}</div><div class="hero-lbl">最新体重</div></div>
      <div class="hero h-vax"><span class="hero-ic">💉</span><div class="hero-num">${d.completedVaccines}<small>/${VACCINES.length}</small></div><div class="hero-lbl">疫苗进度</div></div>
    </div>`;

  const vaxCard = `
    <div class="card chart-card accent-vax">
      <h2>💉 疫苗进度</h2>
      <div class="vx-head slim">
        ${progressRingSVG(VACCINES.length ? d.completedVaccines / VACCINES.length : 0, 72)}
        <div class="vx-sum">
          <div class="vx-sum-nums">已记录 <b class="ok">${d.completedVaccines}</b> / ${VACCINES.length} 种</div>
          <div class="vx-sum-sub">参考天津市免疫规划 · 详见「健康」页时间轴</div>
        </div>
      </div>
    </div>`;

  const measureCard = `
    <div class="card chart-card accent-measure">
      <h2>📈 体测成长趋势</h2>
      ${wKg.length ? `<div class="chart-title">体重 (kg)</div>${lineChartSVG(wKg, { color: '#FF8A5B', area })}` : '<p class="muted">暂无体重数据</p>'}
      ${wHt.length ? `<div class="chart-title">身高 (cm)</div>${lineChartSVG(wHt, { color: '#4DB6E8', area })}` : ''}
      ${wHd.length ? `<div class="chart-title">头围 (cm)</div>${lineChartSVG(wHd, { color: '#5FCB7E', area })}` : ''}
    </div>`;

  const drinkCard = `
    <div class="card chart-card accent-drink">
      <h2>💧 喝水趋势</h2>
      <div class="stat-inline"><span>${d.drinkTimes} 次</span><span>${d.drinkMl} ml</span><span>日均 ${d.periodDays ? Math.round(d.drinkMl / d.periodDays) : 0} ml</span></div>
      ${lineChartSVG(d.drinkSeries, { color: '#3FC1C9', unit: '', area })}
    </div>`;

  const feedCard = `
    <div class="card chart-card accent-feed">
      <h2>🍽 喂养趋势</h2>
      ${lineChartSVG(d.feedSeries, { color: '#FFB84D', area })}
      ${Object.keys(d.feedKinds).length ? `<div class="chart-title">喂养方式</div>` + Object.entries(d.feedKinds).map(([k, v]) => hbar(k, v, Math.max(...Object.values(d.feedKinds)), 'var(--feed)')).join('') : '<p class="muted">暂无喂养记录</p>'}
      ${d.foodRank.length ? `<div class="chart-title">🥦 辅食食材尝试排行</div>` + d.foodRank.map(([n, c]) => hbar(n, c, d.foodRank[0][1], 'var(--food)')).join('') : ''}
    </div>`;

  const restCard = `
    <div class="card chart-card accent-rest">
      <h2>💩 拉 · 😴 睡 趋势</h2>
      <div class="chart-title">排泄次数</div>${barChartSVG(d.poopSeries, { color: '#C9A27A' })}
      <div class="chart-title">睡眠时长 (分钟)</div>${lineChartSVG(d.sleepSeries, { color: '#8AA0E8', unit: '', area })}
    </div>`;

  return `${hero}${vaxCard}${measureCard}${drinkCard}${feedCard}${restCard}`;
}

function insightBoxHTML(d) {
  return `
    <div class="card insight">
      <h2>💡 ${d.label}智能分析</h2>
      ${d.insights.map((s) => `<div class="insight-row">${s}</div>`).join('')}
    </div>`;
}

function exportReportBarHTML() {
  const items = [['month', '🗓', '月报'], ['quarter', '🌿', '季报'], ['halfyear', '🌳', '半年报'], ['year', '🎆', '年报']];
  return `
    <div class="card export-bar">
      <h2>📄 导出成长报表 (PDF)</h2>
      <p class="muted">把当前所有数据、图表与智能分析按周期生成 PDF，可下载保存或打印。</p>
      <div class="row" style="margin-top:10px">
        ${items.map(([k, ic, t]) => `<button class="btn" data-action="exportPDF" data-range="${k}"><span class="pic">${ic}</span>${t}</button>`).join('')}
      </div>
    </div>`;
}

// ---- 智能成长评价（基于国家卫健委 WS/T 423-2022） ----
function getBabyProfile() {
  const fam = state.current && state.current.fam;
  const profile = fam && fam.profile ? fam.profile : {};
  return {
    birthDate: profile.birthDate || '2025-01-24',
    sex: profile.sex || 'boy',
    name: profile.name || '拳拳',
  };
}

function pctLabelColor(level) {
  return { low: '#E74C3C', 'low-norm': '#F39C12', norm: '#27AE60', 'high-norm': '#3498DB', high: '#9B59B6' }[level] || '#888';
}

function growthEvalCardHTML() {
  const measures = state.current.fam.records.filter((r) => r.type === 'measure').sort((a, b) => a.ts - b.ts);
  if (!measures.length) {
    return `<div class="card growth-card pop-in">
      <h2>📏 智能生长评价</h2>
      <p class="muted">在「健康」页记录体测后，这里会按国家卫健委《7岁以下儿童生长标准》自动给出评价。</p>
    </div>`;
  }
  const latest = measures[measures.length - 1];
  const { birthDate, sex, name } = getBabyProfile();
  const evalResult = evaluateGrowth({ sex, birthDate, weight: Number(latest.value.weight), height: Number(latest.value.height), head: Number(latest.value.head) }, new Date(latest.ts));
  const advice = growthAdvice(evalResult);
  const trend = evaluateTrend(measures.map((m) => ({ ts: m.ts, weight: Number(m.value.weight) || null, height: Number(m.value.height) || null, head: Number(m.value.head) || null })), birthDate, sex);

  const item = (label, e) => {
    if (e.value == null || Number.isNaN(e.value)) return `<div class="ge-item"><div class="ge-label">${label}</div><div class="ge-val muted">未测</div></div>`;
    const color = pctLabelColor(e.level);
    return `<div class="ge-item">
      <div class="ge-label">${label}</div>
      <div class="ge-val" style="color:${color}">${e.value}${label === '体重' ? 'kg' : label === '身高' ? 'cm' : 'cm'}</div>
      <div class="ge-pct" style="background:${color}">${e.label}</div>
    </div>`;
  };

  const trendTags = trend && trend.crossing.length ? `<div class="ge-trend">${trend.crossing.map((c) => `<span class="ge-tag">${c}</span>`).join('')}</div>` : '';
  const bmiLine = evalResult.bmi ? `<div class="ge-bmi">BMI ${evalResult.bmi} · ${advice.bmiState ? advice.bmiState.label : ''}</div>` : '';

  return `
    <div class="card growth-card pop-in accent-eval">
      <h2>🩺 智能生长评价 <span class="muted">国家卫健委 WS/T 423-2022</span></h2>
      <div class="ge-head">
        <div class="ge-avatar">${name}</div>
        <div class="ge-info">
          <div class="ge-age">${evalResult.months} 个月</div>
          <div class="muted">${fmtDate(latest.ts)} 体测</div>
          ${bmiLine}
        </div>
      </div>
      <div class="ge-grid">${item('体重', evalResult.weight)}${item('身高', evalResult.height)}${item('头围', evalResult.head)}</div>
      <div class="ge-status ${advice.risk === 2 ? 'risk' : advice.risk === 1 ? 'warn' : 'ok'}">总体：${advice.status}</div>
      <div class="ge-advice">${advice.advice.map((s) => `<p>· ${s}</p>`).join('')}</div>
      ${trendTags}
      <p class="muted" style="margin-top:10px;font-size:11px">提示：百分位评价仅供参考，如有异常请咨询儿童保健科医生。</p>
    </div>`;
}

// ============ 成就系统 ============
function medalSVG(color, lit, rarity) {
  const rc = (rarity && RARITY[rarity]) ? RARITY[rarity].color : '#c9bfd0';
  const glow = (lit && rarity) ? `<circle cx="20" cy="24" r="15.6" fill="none" stroke="${rc}" stroke-width="2" opacity=".55"/>` : '';
  return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <path d="M13 3 L20 15 L27 3" fill="${lit ? color : '#dcdcdc'}" opacity=".85"/>
    <circle cx="20" cy="24" r="12.5" fill="${lit ? color : '#e9e9e9'}" stroke="#fff" stroke-width="2.2"/>
    ${glow}
    <circle cx="20" cy="24" r="8.5" fill="rgba(255,255,255,.28)"/>
    <text x="20" y="28.5" text-anchor="middle" font-size="11" fill="#fff" font-weight="800">★</text>
  </svg>`;
}

function achCardHTML(x) {
  const { ach, ev, state: st } = x;
  const rarity = ach.rarity || 'common';
  const rcol = (RARITY[rarity] || RARITY.common).color;
  // 隐藏彩蛋未解锁：只显示神秘占位，增加探索趣味
  if (ach.hidden && ev.tier === 0) {
    return `<div class="ach-card locked rar-${rarity}">
      <div class="ach-medal ach-secret">❓</div>
      <div class="ach-name">神秘成就</div>
      <div class="ach-tier" style="color:var(--text-soft)">？？？</div>
      <div class="muted ach-recur">继续记录解锁惊喜</div>
    </div>`;
  }
  const lit = ev.tier > 0;
  const tierName = lit ? TIER_NAMES[ev.tier - 1] + '牌' : (ach.recur ? '待解锁' : '未解锁');
  const tierColor = lit ? TIER_COLORS[ev.tier - 1] : '#c9bfd0';
  let progress;
  if (ach.recur) {
    const cnt = st.count || 0;
    progress = `<div class="muted ach-recur">🔁 每日/每周可再拿${cnt ? ` · 已拿 ${cnt} 次` : ''}</div>`;
  } else if (ev.next != null) {
    progress = `<div class="progress sm"><span class="progress-fill" style="width:${ev.pct}%;background:${tierColor}"></span></div>
       <div class="muted ach-next">还差 ${(ev.next - ev.value)} 到${TIER_NAMES[ev.tier] || ''}牌</div>`;
  } else {
    progress = `<div class="muted ach-next">已满级 🎉</div>`;
  }
  return `
  <div class="ach-card ${lit ? 'lit' : 'locked'} rar-${rarity}">
    <div class="ach-medal" style="--mc:${tierColor}">${medalSVG(tierColor, lit, rarity)}</div>
    <div class="ach-name">${ach.icon} ${esc(ach.name)}</div>
    <div class="ach-tier" style="color:${tierColor}">${tierName}</div>
    <div class="ach-rar" style="color:${rcol}">${RARITY[rarity].name}</div>
    ${progress}
  </div>`;
}

async function achievementsHTML() {
  const { fam } = state.current;
  const records = fam.records;
  const albumCount = (await store.listAlbum()).length;
  const diaryCount = (await store.listDiaries(state.diary.password || 'x')).length;
  const st = await store.getAchState();
  const { list, newlyCelebrated, achState } = evaluateAll(
    records, { albumCount, diaryCount, memberCount: fam.members.length, memberIds: fam.members.map((m) => m._id) }, st
  );
  state.achList = list;
  if (newlyCelebrated.length) {
    await store.saveAchState(achState);
    celebrate(newlyCelebrated);
  }
  const total = list.filter((x) => x.ev.tier > 0).length;
  const totalTiers = list.reduce((s, x) => s + x.ev.tier, 0);
  const maxTiers = list.reduce((s, x) => s + x.ev.maxTier, 0);
  const pct = Math.round((totalTiers / maxTiers) * 100) || 0;
  const rar = { legendary: 0, epic: 0, rare: 0, common: 0 };
  const rarTotal = { legendary: 0, epic: 0, rare: 0, common: 0 };
  for (const x of list) { rarTotal[x.ach.rarity]++; if (x.ev.tier > 0) rar[x.ach.rarity]++; }
  const rarChips = ['legendary', 'epic', 'rare', 'common'].map((r) =>
    `<span class="rar-chip" style="--rc:${(RARITY[r] || RARITY.common).color}">${(RARITY[r] || RARITY.common).name} ${rar[r]}/${rarTotal[r]}</span>`).join('');
  const filter = state.achFilter || 'all';
  const cats = [['all', '🌈', '全部'], ['eat', '🍽', '吃喝'], ['rest', '💩', '拉撒'], ['sleep', '😴', '睡觉'], ['health', '💉', '健康'], ['grow', '🦁', '综合']];
  const chips = cats.map(([k, ic, t]) =>
    `<button class="pill ${filter === k ? 'on' : ''}" data-action="achFilter" data-cat="${k}"><span class="pic">${ic}</span>${t}</button>`).join('');
  const C = 2 * Math.PI * 30;
  return `
    <div class="card ach-hero">
      <div class="ach-lion">${MASCOT_SVG}</div>
      <div class="ach-hero-body">
        <div class="ach-hero-top">
          <div>
            <div class="ach-hero-num">${totalTiers}<small>/${maxTiers}</small></div>
            <div class="muted">已点亮 ${total} / ${list.length} 枚 · 收集度 ${pct}%</div>
          </div>
          <div class="ach-ring" style="--p:${pct}">
            <svg viewBox="0 0 72 72" width="62" height="62" aria-hidden="true">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#F0E6DE" stroke-width="8"/>
              <circle cx="36" cy="36" r="30" fill="none" stroke="url(#ringG)" stroke-width="8" stroke-linecap="round"
                stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct / 100)).toFixed(1)}" transform="rotate(-90 36 36)"/>
              <defs><linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF8A5B"/><stop offset="100%" stop-color="#7C5CFC"/></linearGradient></defs>
            </svg>
            <span class="ach-ring-num">${pct}%</span>
          </div>
        </div>
        <div class="ach-rarity-row">${rarChips}</div>
      </div>
    </div>
    <div class="periods ach-filters">${chips}</div>
    <div id="achGroups">${achGroupsHTML(filter, list)}</div>`;
}

function achGroupsHTML(filter, list) {
  const groups = {};
  const ordered = list.slice().sort((a, b) =>
    (b.ev.tier > 0) - (a.ev.tier > 0)
    || RARITY_ORDER[b.ach.rarity] - RARITY_ORDER[a.ach.rarity]
    || b.ev.tier - a.ev.tier);
  for (const x of ordered) {
    if (filter !== 'all' && x.ach.cat !== filter) continue;
    (groups[x.ach.cat] = groups[x.ach.cat] || []).push(x);
  }
  const keys = Object.keys(groups);
  if (!keys.length) return '<div class="card empty"><p class="muted center">这个分类还没有成就哦～</p></div>';
  return keys.map((cat) => `
    <div class="card ach-group">
      <h2>${ACH_CATS[cat].icon} ${ACH_CATS[cat].label}</h2>
      <div class="ach-grid">${groups[cat].map(achCardHTML).join('')}</div>
    </div>`).join('');
}

// ---- 庆祝：纸屑 + 8bit 音效 + 小狮子欢呼 ----
function confettiBurst() {
  const colors = ['#FF8A5B', '#4DB6E8', '#5FCB7E', '#FFC93C', '#FF8FB6', '#7C5CFC'];
  const wrap = document.createElement('div');
  wrap.className = 'confetti';
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 0.4) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.width = p.style.height = (6 + Math.random() * 6) + 'px';
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 1800);
}

let _audioCtx = null;
function playChime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_audioCtx) _audioCtx = new AC();
    const ctx = _audioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6 上行小号式欢呼
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'square'; o.frequency.value = f;
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.24);
    });
  } catch (e) { /* 音效失败静默降级 */ }
}

function lionCheer() {
  const lion = document.querySelector('.app-header .lion, .ach-lion .lion');
  if (lion) {
    lion.classList.add('cheer');
    setTimeout(() => lion.classList.remove('cheer'), 1400);
  }
}

function starBurst() {
  const wrap = document.createElement('div');
  wrap.className = 'confetti star';
  const chars = ['⭐', '✨', '🌟', '💫'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('i');
    p.textContent = chars[i % chars.length];
    p.style.left = (Math.random() * 100) + 'vw';
    p.style.fontSize = (14 + Math.random() * 16) + 'px';
    p.style.animationDelay = (Math.random() * 0.3) + 's';
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 1800);
}

function celebrate(newlyCelebrated) {
  const names = newlyCelebrated.map((x) => `${x.ach.icon}${x.ach.name}${x.ev.tier > 0 ? TIER_NAMES[x.ev.tier - 1] + '牌' : ''}`).join('、');
  toast(`🏆 解锁 ${newlyCelebrated.length} 枚新成就：${names}`);
  confettiBurst();
  starBurst();
  playChime();
  lionCheer();
}

// 记录提交后主动检测是否有新成就解锁（无需手动进成就页）。
async function maybeCelebrate() {
  try {
    const { fam } = state.current;
    const albumCount = (await store.listAlbum()).length;
    const diaryCount = (await store.listDiaries(state.diary.password || 'x')).length;
    const st = await store.getAchState();
    const { newlyCelebrated, achState } = evaluateAll(
      fam.records, { albumCount, diaryCount, memberCount: fam.members.length, memberIds: fam.members.map((m) => m._id) }, st
    );
    if (newlyCelebrated.length) {
      await store.saveAchState(achState);
      celebrate(newlyCelebrated);
    }
  } catch (e) { console.warn('成就检测失败', e); }
}

// ============ PDF 报表导出 ============
let _pdfLibs = null;
async function ensurePdfLibs() {
  if (_pdfLibs) return _pdfLibs;
  const [jspdfMod, h2cMod] = await Promise.all([
    import('https://esm.sh/jspdf@2.5.2'),
    import('https://esm.sh/html2canvas@1.4.1'),
  ]);
  _pdfLibs = { jsPDF: jspdfMod.jsPDF, html2canvas: h2cMod.default };
  return _pdfLibs;
}

async function exportPDF(range) {
  try {
    toast('正在生成 PDF…');
    const { jsPDF, html2canvas } = await ensurePdfLibs();
    const d = await computeStats(range);
    const { start, end } = periodRange(range);
    const rangeLabel = { month: '月报', quarter: '季报', halfyear: '半年报', year: '年报' }[range] || '报表';

    const wrap = document.createElement('div');
    wrap.className = 'pdf-report';
    wrap.innerHTML = `
      <div class="pdf-head">🦁 ${esc(CONFIG.APP_NAME)} · ${rangeLabel}</div>
      <div class="pdf-sub">统计区间：${fmtDate(start)} ~ ${fmtDate(end)} ｜ 生成时间：${new Date().toLocaleString('zh-CN')}</div>
      <hr class="pdf-hr"/>
      ${statBlocksHTML(d, { area: false })}
      ${insightBoxHTML(d)}`;
    wrap.style.cssText = 'position:fixed;left:-99999px;top:0;z-index:-1;';
    document.body.appendChild(wrap);

    const canvas = await html2canvas(wrap, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
    document.body.removeChild(wrap);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = canvas.height * imgW / canvas.width;
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    pdf.save(`拳拳成长记录_${rangeLabel}_${todayStr()}.pdf`);
    toast('PDF 已生成并下载');
  } catch (err) {
    console.error(err);
    toast('PDF 生成失败：' + (err && err.message ? err.message : err) + '（需联网加载组件）');
  }
}

// ============ 事件绑定 ============
function bindView(tab) {
  if (tab === 'album') loadGallery();
  if (tab === 'timeline') {
    // 长按大圆钮 → 打开该类型的详细面板（短按仍为一键记录）
    document.querySelectorAll('.qb-btn').forEach((btn) => {
      let timer = null;
      const type = btn.dataset.type;
      const start = () => {
        timer = setTimeout(() => {
          timer = null;
          if (!canWrite(state.current.me.role)) return;
          state.qlLongPress = true;
          openQlSheet(type);
        }, 420);
      };
      const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', cancel);
      btn.addEventListener('pointerleave', cancel);
      btn.addEventListener('pointercancel', cancel);
    });
  }
  if (tab === 'daily') {
    renderCustomFoods();
    const kindSel = document.getElementById('feedKind');
    if (kindSel) {
      const toggle = () => {
        const box = document.getElementById('feedFoodBox');
        if (box) box.classList.toggle('hidden', kindSel.value !== '辅食');
      };
      kindSel.addEventListener('change', toggle);
      toggle();
    }
  }
  if (tab === 'stats') { /* 统计为纯展示，周期按钮走全局 click 委托 */ }
  if (tab === 'science') {
    const inp = document.getElementById('policySearch');
    if (inp) {
      inp.addEventListener('input', () => {
        const q = inp.value.trim().toLowerCase();
        const catLabel = (p) => (POLICY_CATEGORIES.find((c) => c.key === p.category) || {}).label || '';
        const list = q
          ? POLICIES.filter((p) => (p.title + ' ' + p.summary + ' ' + p.tags.join(' ') + ' ' + p.module + ' ' + catLabel(p)).toLowerCase().includes(q))
          : POLICIES;
        const box = document.getElementById('policyList');
        if (box) box.innerHTML = policyCardsHTML([...list].sort((a, b) => a.importance - b.importance));
      });
    }
  }
}

async function loadGallery() {
  const g = document.getElementById('gallery');
  if (!g) return;
  const list = await store.listAlbum();
  g.innerHTML = list.length ? list.map((it) =>
    `<img src="${esc(it.url)}" alt="${esc(it.caption || '')}" title="${esc(it.caption || '')} · ${esc(it.operatorName)}" loading="lazy">`
  ).join('') : '<p class="muted">还没有照片。</p>';
}

async function renderCustomFoods() {
  const box = document.getElementById('customFoods');
  if (!box) return;
  const { fam } = state.current;
  const base = FOOD_CATEGORIES.flatMap((c) => c.items);
  const custom = (fam.customFoods || []).filter((n) => !base.includes(n));
  box.innerHTML = custom.length ? custom.map((n) =>
    `<button type="button" class="chip ${state.foodSel.has(n) ? 'on' : ''}" data-action="food" data-name="${esc(n)}">${esc(n)}</button>`
  ).join('') : '<span class="muted">暂无</span>';
}

// 统一动作分发：click 与 change（下拉选择类控件）共用同一处理逻辑。
async function handleAction(a, t) {
  if (a === 'nav') { state.view = t.dataset.view; render(); }
  else if (a === 'vxQuick') {
    const fold = document.getElementById('vaxFold');
    if (fold) { fold.open = true; }
    const sel = document.querySelector('form[data-form="vaccine"] select[name="name"]');
    if (sel) sel.value = t.dataset.name;
    if (fold) fold.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast('已选中：' + t.dataset.name);
  }
  else if (a === 'ql') {
    if (!canWrite(state.current.me.role)) { toast('当前为只读权限，无法记录'); return; }
    if (state.qlLongPress) { state.qlLongPress = false; return; }  // 长按已开面板，吞掉随后的 click
    const type = t.dataset.type;
    const q = QUICK.find((x) => x.type === type);
    if (!q) return;
    if (q.sheet) openQlSheet(type);
    else if (q.instant === 'timer') await toggleSleepTimer();
    else await qlLog(type);
  }
  else if (a === 'qlClose') { closeQlSheet(); }
  else if (a === 'qlSubmit') { await qlSubmitSheet(); }
  else if (a === 'qlPick') {
    const name = t.dataset.qlPick;
    const box = t.closest('.ql-chips');
    if (box) box.querySelectorAll('.ql-chip').forEach((c) => c.classList.remove('on'));
    t.classList.add('on');
    state.qlPick[name] = t.dataset.val;
  }
  else if (a === 'qlFood') {
    const n = t.dataset.food;
    t.classList.toggle('on');
    if (t.classList.contains('on')) state.qlFoods.add(n); else state.qlFoods.delete(n);
  }
  else if (a === 'qlUndo') {
    if (state.undo && state.undo._id) {
      await store.deleteRecord(state.undo._id);
      state.undo = null;
      toast('已撤销');
      render();
    }
  }
  else if (a === 'achFilter') {
    state.achFilter = t.dataset.cat;
    const g = document.getElementById('achGroups');
    if (g) g.innerHTML = achGroupsHTML(state.achFilter, state.achList);
    document.querySelectorAll('.ach-filters .pill').forEach((p) => p.classList.toggle('on', p.dataset.cat === state.achFilter));
  }
  else if (a === 'statsPeriod') { state.statsPeriod = t.dataset.period; render(); }
  else if (a === 'showCreate') { showCreateModal(); }
  else if (a === 'showJoin') { showJoinModal(); }
  else if (a === 'enterFamily') {
    const nameEl = document.getElementById('enterName');
    const roleEl = document.getElementById('enterRole');
    const codeEl = document.getElementById('enterCode');
    const name = nameEl ? nameEl.value.trim() : '';
    const role = roleEl ? roleEl.value : 'recorder';
    const code = codeEl ? codeEl.value.trim().toUpperCase() : '';
    if (!name) { toast('请填写你的称呼'); return; }
    if (code !== SINGLE_FAMILY.inviteCode) { toast('邀请码不正确（提示：拳拳的生日）'); return; }
    try {
      await store.enterFamily({ name, role });
      state.current = await store.loadCurrent();
      render();
      toast('👋 欢迎你，' + name);
    } catch (e) { toast(esc((e && e.message) || '进入失败，请重试')); }
  }
  else if (a === 'copyRestore') {
    const s = store.session;
    if (!s || !s.familyId || !s.memberId) { toast('当前无身份可导出'); return; }
    const b64 = btoa(JSON.stringify({ familyId: s.familyId, memberId: s.memberId })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const link = location.origin + location.pathname + '?v=15&restore=' + b64;
    await copyText(link, '身份恢复链接已复制，发给新设备上的自己即可');
  }
  else if (a === 'retryCloud') {
    toast('正在重新连接云端…');
    await store.bootstrap();
    if (store.cloudError) {
      toast('⚠️ 云端连接失败（' + store.cloudError + '），仍使用本地模式。');
    } else {
      toast('☁️ 云端已连接');
    }
    render();
  }
  else if (a === 'policyRead') {
    const p = POLICIES.find((x) => x.id === t.dataset.id);
    if (p) { openReader(policyReaderHTML(p)); if (p.embedded) loadPolicyFullContent(p.id); }
  }
  else if (a === 'food') {
    const n = t.dataset.name;
    if (state.foodSel.has(n)) state.foodSel.delete(n); else state.foodSel.add(n);
    t.classList.toggle('on');
  }
  else if (a === 'addCustomFood') {
    const inp = document.getElementById('customFoodInput');
    const n = (inp.value || '').trim();
    if (!n) return;
    await store.addCustomFood(n);
    state.foodSel.add(n);
    inp.value = '';
    await renderCustomFoods();
  }
  else if (a === 'del') {
    if (!confirm('确定删除这条记录？')) return;
    await store.deleteRecord(t.dataset.id);
    toast('已删除');
    render();
  }
  else if (a === 'role') {
    await store.updateMember(t.dataset.id, { role: t.value });
    toast('角色已更新');
    render();
  }
  else if (a === 'kick') {
    if (!confirm('确定移除该成员？')) return;
    await store.removeMember(t.dataset.id);
    toast('已移除');
    render();
  }
  else if (a === 'switchMember') {
    const fam = state.current.fam;
    store.setSession({ familyId: fam._id, memberId: t.value });
    state.current = await store.loadCurrent();
    toast('已切换身份');
    render();
  }
  else if (a === 'albumUpload') { await handleAlbumUpload(); }
  else if (a === 'export') { await doExport(); }
  else if (a === 'exportPDF') { await exportPDF(t.dataset.range); }
  else if (a === 'logout') { store.logout(); state.current = null; state.view = 'timeline'; render(); }
  else if (a === 'diaryLock') { state.diary.unlocked = false; state.diary.password = ''; render(); }
  else if (a === 'diaryCancelEdit') { state.diary.editingId = null; render(); }
  else if (a === 'diaryEdit') { state.diary.editingId = t.dataset.id; render(); }
  else if (a === 'diaryDelete') {
    if (!confirm('确定删除这篇日记？')) return;
    await store.deleteDiary(t.dataset.id);
    toast('已删除');
    render();
  }
  else if (a === 'diaryChangePwd') {
    const oldPwd = prompt('请输入原密码');
    if (!oldPwd) return;
    const newPwd = prompt('请输入新密码（6 位以上）');
    if (!newPwd) return;
    const newPwd2 = prompt('请再次输入新密码');
    if (newPwd !== newPwd2) { toast('两次输入不一致'); return; }
    try {
      await store.changeDiaryPassword(oldPwd, newPwd);
      state.diary.password = newPwd;
      toast('密码已修改，日记已重新加密');
      render();
    }     catch (err) { toast(err.message); }
  }
}

$app.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  await handleAction(t.dataset.action, t);
});

// 下拉选择（当前身份切换 / 成员角色修改）派发 change 事件，单独转发到统一分发。
$app.addEventListener('change', async (e) => {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const a = t.dataset.action;
  if (a === 'switchMember' || a === 'role') await handleAction(a, t);
});

$app.addEventListener('submit', async (e) => {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  const type = f.dataset.form;
  const fd = Object.fromEntries(new FormData(f).entries());
  if (type === 'diaryNew') { await submitDiaryNew(fd); return; }
  if (type === 'diaryEdit') { await submitDiaryEdit(f.dataset.id, fd); return; }
  if (type === 'diarySetupPassword') { await submitDiarySetup(fd); return; }
  if (type === 'diaryUnlock') { await submitDiaryUnlock(fd); return; }
  if (type === 'profile') { await submitProfile(fd); return; }
  await submitRecord(type, fd, f);
});

async function submitRecord(type, fd, form) {
  const note = fd.note || '';
  let value = {};
  let ts = dateToTs(fd.date);
  if (type === 'measure') value = { weight: fd.weight || '', height: fd.height || '', head: fd.head || '' };
  else if (type === 'temp') value = { temp: fd.temp };
  else if (type === 'medication') {
    const hit = await store.checkMedication({ med: fd.med, ts });
    if (hit) {
      const mins = Math.max(1, Math.round((ts - hit.ts) / 60000));
      if (!confirm(`${hit.operatorName} 于 ${mins} 分钟前已记录「${hit.value.med}」，仍要添加？`)) return;
    }
    value = { med: fd.med, dose: fd.dose || '', unit: fd.unit };
  }
  else if (type === 'vaccine') value = { name: fd.name };
  else if (type === 'feed') {
    value = { kind: fd.kind, amount: fd.amount || '' };
    if (fd.kind === '辅食') {
      const items = [...state.foodSel];
      if (items.length === 0) { toast('辅食请至少选择一种食材打卡'); return; }
      value.foods = items;
    }
  }
  else if (type === 'poop') value = { type: fd.type, color: fd.color };
  else if (type === 'sleep') value = { start: fd.start || '', duration: fd.duration || '' };
  else if (type === 'drink') value = { times: Number(fd.times) || 0, ml: Number(fd.ml) || 0 };
  await store.addRecord({ type, value, note, ts });
  state.foodSel.clear();
  toast('已记录');
  maybeCelebrate();
  render();
}

async function submitProfile(fd) {
  const profile = { name: fd.name || '拳拳', birthDate: fd.birthDate, sex: fd.sex || 'boy' };
  state.current.fam.profile = profile;
  await store.saveFamilyMeta({ profile });
  toast('宝宝档案已保存');
  render();
}

async function handleAlbumUpload() {
  const inp = document.getElementById('albumFile');
  const file = inp && inp.files && inp.files[0];
  if (!file) { toast('请先选择图片'); return; }
  const dateInp = document.querySelector('form input[name="date"]');
  const ts = dateToTs(dateInp ? dateInp.value : todayStr());
  const cap = document.getElementById('albumCap').value || '';
  toast('正在压缩并上传…');
  try {
    const res = await store.uploadImage(file);
    if (res.size) console.log(`[图册] 压缩后约 ${(res.size / 1024).toFixed(0)}KB`);
    await store.addAlbum({ url: res.url, fileID: res.fileID, caption: cap, ts });
    toast('已上传');
    loadGallery();
  } catch (e) {
    console.error(e);
    toast('上传失败：' + (e && e.message ? e.message : e));
  }
}

async function doExport() {
  const data = await store.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `拳拳记录_${todayStr()}.json`;
  a.click();
  toast('已导出 JSON');
}

// 日记提交单独处理
async function submitDiaryNew(fd) {
  const pwd = state.diary.password;
  await store.addDiary({ date: fd.date, content: fd.content, password: pwd });
  toast('日记已保存');
  render();
}
async function submitDiaryEdit(id, fd) {
  const pwd = state.diary.password;
  await store.updateDiary(id, { date: fd.date, content: fd.content, password: pwd });
  state.diary.editingId = null;
  toast('日记已更新');
  render();
}
async function submitDiarySetup(fd) {
  const pwd = fd.pwd;
  if (pwd.length < 6) { toast('密码至少 6 位'); return; }
  if (pwd !== fd.pwd2) { toast('两次输入不一致'); return; }
  try {
    await store.setupDiaryPassword(pwd);
    state.diary.password = pwd;
    state.diary.unlocked = true;
    state.diary.error = '';
    toast('密码已设置');
    render();
  } catch (err) { toast(err.message); }
}
async function submitDiaryUnlock(fd) {
  const pwd = fd.pwd;
  const ok = await store.verifyDiaryPassword(pwd);
  if (!ok) {
    state.diary.error = '密码不正确';
    render();
    return;
  }
  state.diary.unlocked = true;
  state.diary.password = pwd;
  state.diary.error = '';
  toast('已解锁');
  render();
}

// ============ 弹层：创建 / 加入 ============
function showCreateModal() {
  openModal(`
    <h3>创建家庭</h3>
    <label class="field"><span>家庭名称</span><input type="text" id="famName" value="拳拳家" placeholder="如 拳拳家"></label>
    <label class="field"><span>你的称呼（管理员·爸妈）</span><input type="text" id="adminName" placeholder="如 爸爸"></label>
    <div class="actions">
      <button class="btn btn-ghost" data-action="closeModal">取消</button>
      <button class="btn btn-primary" data-action="doCreate">创建</button>
    </div>`);
}
function showJoinModal() {
  openModal(`
    <h3>加入家庭</h3>
    <label class="field"><span>邀请码</span><input type="text" id="joinCode" placeholder="6 位字母数字" style="text-transform:uppercase"></label>
    <label class="field"><span>你的称呼</span><input type="text" id="joinName" placeholder="如 奶奶"></label>
    <label class="field"><span>你的角色</span><select id="joinRole">
      <option value="recorder">记录员（爷爷奶奶·姥姥姥爷）</option>
      <option value="readonly">只读（亲友）</option>
      <option value="admin">管理员（爸妈）</option>
    </select></label>
    <div class="actions">
      <button class="btn btn-ghost" data-action="closeModal">取消</button>
      <button class="btn btn-primary" data-action="doJoin">加入</button>
    </div>`);
}
function openModal(html) {
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = `<div class="modal">${html}</div>`;
  mask.addEventListener('click', (e) => {
    if (e.target === mask || e.target.closest('[data-action="closeModal"]')) mask.remove();
    if (e.target.closest('[data-action="doCreate"]')) doCreate(mask);
    if (e.target.closest('[data-action="doJoin"]')) doJoin(mask);
    // 模态框挂在 document.body，不走 $app 的 data-action 委托，需在此单独接。
    const ci = e.target.closest('[data-action="copyInvite"]');
    if (ci) copyInvite(ci.dataset.code);
  });
  document.body.appendChild(mask);
}
async function doCreate(mask) {
  const name = document.getElementById('famName').value.trim() || '拳拳家';
  const adminName = document.getElementById('adminName').value.trim();
  if (!adminName) { toast('请填写你的称呼'); return; }
  const { fam } = await store.createFamily({ name, adminName });
  mask.remove();
  state.current = await store.loadCurrent();
  render();
  // 创建成功后立刻把邀请码推到眼前：此前邀请码只在「家庭成员」页展示，用户创建后找不到。
  showInviteModal(fam.inviteCode);
}

// 创建家庭成功：立即展示邀请码（可一键复制），避免用户找不到邀请码无法邀请家人。
function showInviteModal(code) {
  openModal(`
    <h3>🎉 家庭创建成功</h3>
    <p class="muted">这是你家的邀请码，发给爷爷奶奶、姥姥姥爷（记录员）和亲友（只读），他们在首页点「加入家庭」输入即可。</p>
    <div class="invite-box"><code class="invite-code">${esc(code)}</code></div>
    <div class="actions">
      <button class="btn btn-ghost" data-action="closeModal">知道了</button>
      <button class="btn btn-primary" data-action="copyInvite" data-code="${esc(code)}">复制邀请码</button>
    </div>`);
}

async function copyInvite(code) {
  await copyText(code, '邀请码已复制：' + code, '复制失败，请手动记下：' + code);
}

// 通用复制（剪贴板 API 优先，非安全上下文降级 textarea + execCommand）。
async function copyText(text, okMsg, failMsg) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast(okMsg);
  } catch (e) {
    toast(failMsg || '复制失败');
  }
}
async function doJoin(mask) {
  const code = document.getElementById('joinCode').value.trim().toUpperCase();
  const name = document.getElementById('joinName').value.trim();
  const role = document.getElementById('joinRole').value;
  if (!code || !name) { toast('请填写邀请码和称呼'); return; }
  try {
    await store.joinFamily({ code, name, role });
    mask.remove();
    state.current = await store.loadCurrent();
    render();
  } catch (err) { toast(err.message || '加入失败'); }
}

// ============ 全局动效与互动 ============
function spawnParticles(x, y, count = 8) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'click-particle';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 40;
    el.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    el.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    el.style.background = ['#FFC93C', '#FF8A5B', '#4DB6E8', '#5FCB7E', '#FF8FB6'][Math.floor(Math.random() * 5)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
  }
}

function bindGlobalInteractions() {
  // 3D 微倾斜：指针设备上，狮子 Hero / 今日卡跟随指针轻微转动（桌面增强，触屏自动跳过）
  if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest && e.target.closest('.lion-hero, .today-card');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${(px * 5).toFixed(2)}deg) rotateX(${(-py * 4).toFixed(2)}deg) translateZ(0)`;
      el.style.transition = 'transform .08s ease-out';
      clearTimeout(el._tiltT);
      el._tiltT = setTimeout(() => {
        el.style.transition = 'transform .5s var(--bounce)';
        el.style.transform = '';
      }, 500);
    }, { passive: true });
  }

  // 点击粒子反馈（按钮/卡片）
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, .card, .chip, .today-item');
    if (t && !t.closest('input, textarea, select')) spawnParticles(e.clientX, e.clientY, 6);
  }, { passive: true });

  // 小狮子随光标/触摸转动眼睛（简单：通过 CSS class 触发眨眼）
  let lastWink = 0;
  document.addEventListener('click', (e) => {
    const lion = document.querySelector('.app-header .lion, .empty-bear .lion');
    if (!lion) return;
    const now = Date.now();
    if (now - lastWink < 400) return;
    lastWink = now;
    lion.classList.add('wink');
    setTimeout(() => lion.classList.remove('wink'), 600);
  }, { passive: true });

  // Tab 切换时弹跳动画
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tabbar button');
    if (tab) {
      tab.style.transform = 'scale(0.85)';
      requestAnimationFrame(() => { tab.style.transform = ''; });
    }
  }, { passive: true });

  // 视差浮动：根据触摸/鼠标轻微移动背景装饰
  let ticking = false;
  const moveHandler = (x, y) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const dx = (x / window.innerWidth - 0.5) * 20;
      const dy = (y / window.innerHeight - 0.5) * 20;
      document.body.style.setProperty('--parallax-x', dx + 'px');
      document.body.style.setProperty('--parallax-y', dy + 'px');
      ticking = false;
    });
  };
  document.addEventListener('mousemove', (e) => moveHandler(e.clientX, e.clientY), { passive: true });
  document.addEventListener('touchmove', (e) => moveHandler(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
}

// ============ 启动 ============
(async function init() {
  // 身份恢复：?restore=<base64url({familyId,memberId})> —— 换设备/换浏览器找回原成员身份（日记按成员隔离，必须恢复原 memberId 才能看到自己的日记）。
  // 注意用查询参数而非 #hash：默认域名的「确定访问」中转页跳转会丢 hash，但保留查询参数。
  (function restoreFromQuery() {
    try {
      const usp = new URLSearchParams(location.search);
      const r = usp.get('restore');
      if (r) {
        const b64 = r.replace(/-/g, '+').replace(/_/g, '/');
        const data = JSON.parse(decodeURIComponent(escape(atob(b64))));
        if (data && data.familyId && data.memberId) store.setSession({ familyId: data.familyId, memberId: data.memberId });
        usp.delete('restore');
        const qs = usp.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
      }
    } catch (e) { console.warn('身份恢复链接无效', e); }
  })();
  // 先立即渲染 gate/骨架，避免浏览器扩展拦截网络请求时主线程挂起导致白屏。
  if (store.session) {
    $app.innerHTML = `
      <div class="card center">
        <p class="muted">正在连接云端…</p>
        <p class="muted" style="font-size:12px;margin-top:10px;">
          若超过 5 秒未进入，可能是浏览器扩展拦截了云端请求。<br>
          可临时用 <a href="./index.html?demo=1">本地演示模式</a> 继续。
        </p>
      </div>`;
  } else {
    render(); // gate
  }

  // 云端初始化在后台跑，最多等 5 秒；超过也继续，避免无限白屏。
  await Promise.race([
    store.bootstrap(),
    new Promise((resolve) => setTimeout(() => {
      console.warn('[init] 云端初始化超过 5 秒，按本地模式继续渲染');
      resolve();
    }, 5000))
  ]);

  if (store.cloudError) {
    toast('⚠️ 云端连接失败（' + store.cloudError + '），已切换到本地模式，数据仅存本机。请检查网络或联系管理员。');
  }
  if (store.session) {
    try { state.current = await store.loadCurrent(); } catch { state.current = null; }
  }
  bindGlobalInteractions();
  render();
  // 测试辅助：长按模拟后重置标志，避免后续短按被吞
  window.__resetQlLongPress = () => { state.qlLongPress = false; };

  // 本地→云端 自动补传：云端可用且有排队记录时执行；网络恢复事件再试一次。
  const trySync = async () => {
    try {
      const n = await store.syncLocalQueue();
      if (n > 0) toast('✅ 已把 ' + n + ' 条本地记录自动同步到云端');
    } catch { /* 静默，下次再试 */ }
  };
  if (store.isCloud() && store.session) await trySync();
  window.addEventListener('online', () => { setTimeout(trySync, 3000); });
})();
