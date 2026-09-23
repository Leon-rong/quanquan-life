// 小狮子 IP 模块 —— 拳拳的品牌吉祥物
// 标志性元素：举小拳头（呼应小名「拳拳」），类似多纳「甜甜圈+狮子」的 IP 命名逻辑。
// 支持多情绪状态，用于贯穿全 App 的主题表达与即时反馈。

let uidSeq = 0;
const uid = () => `l${++uidSeq}`;

// 鬃毛花瓣（程序化生成，避免手写 12 个 path）
function manePetals(cx, cy, r, pr, n, fill) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = (cx + Math.cos(a) * r).toFixed(2);
    const y = (cy + Math.sin(a) * r).toFixed(2);
    out += `<circle cx="${x}" cy="${y}" r="${pr}" fill="${fill}"/>`;
  }
  return out;
}

// 眼睛：按情绪渲染
function eyes(mood, wink) {
  const L = 22.5, R = 33.5, Y = 26;
  const closed = (cx) =>
    `<path d="M${cx - 3.2} ${Y} Q${cx} ${Y - 3.4} ${cx + 3.2} ${Y}" stroke="#4a3b5c" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
  const open = (cx) =>
    `<circle cx="${cx}" cy="${Y}" r="2.9" fill="#4a3b5c"/><circle cx="${cx + 0.9}" cy="${Y - 1.1}" r="1.05" fill="#fff"/>`;
  const arc = (cx) =>
    `<path d="M${cx - 3.2} ${Y + 0.6} Q${cx} ${Y - 3.8} ${cx + 3.2} ${Y + 0.6}" stroke="#4a3b5c" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;

  switch (mood) {
    case 'sleepy': return closed(L) + closed(R);
    case 'happy':
    case 'cheer': return arc(L) + arc(R);
    case 'wink': return arc(L) + open(R);
    default:
      if (wink) return arc(L) + open(R);
      return open(L) + open(R);
  }
}

// 嘴巴：按情绪渲染
function mouth(mood) {
  switch (mood) {
    case 'eat':
      return `<ellipse cx="28" cy="36.5" rx="4.2" ry="3.4" fill="#C97B4A"/>
              <path d="M24.4 35.6 Q28 33.6 31.6 35.6" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
    case 'sleepy':
      return `<ellipse cx="28" cy="36.4" rx="2.2" ry="2.6" fill="#C97B4A"/>`;
    case 'cheer':
      return `<path d="M22.2 34.6 Q28 41.5 33.8 34.6 Z" fill="#C97B4A"/>
              <path d="M24.6 38.2 Q28 39.8 31.4 38.2" stroke="#FF9BB0" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    case 'poop':
      return `<path d="M23.5 37.4 Q28 34.6 32.5 37.4" stroke="#4a3b5c" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    default:
      return `<path d="M23.4 35.2 Q28 39.4 32.6 35.2" stroke="#4a3b5c" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
  }
}

// 小拳头（标志性元素）
function fists() {
  const fist = (cx, rot) => `
    <g transform="translate(${cx} 47) rotate(${rot})">
      <rect x="-6" y="-5.5" width="12" height="11" rx="5" fill="#F7C77E" stroke="#D98A3A" stroke-width="1.3"/>
      <path d="M-3.4 -2.2 h6.8 M-3.4 0.6 h6.8" stroke="#D98A3A" stroke-width="1" stroke-linecap="round"/>
      <path d="M-1.8 -5.5 v2.2 M1.8 -5.5 v2.2" stroke="#D98A3A" stroke-width="1" stroke-linecap="round"/>
    </g>`;
  return `<g class="lion-fists">${fist(7, -14)}${fist(49, 14)}</g>`;
}

// Zzz（困倦）
function zzz() {
  return `<g class="lion-zzz" fill="#8AA0E8" font-size="9" font-weight="800">
    <text x="41" y="16">z</text><text x="46" y="11" font-size="7">z</text><text x="50" y="7" font-size="5.5">z</text>
  </g>`;
}

/**
 * 渲染小狮子
 * @param {object} o
 * @param {number} o.size  尺寸(px)，默认 64
 * @param {string} o.mood  情绪：happy|sleepy|eat|poop|play|cheer|think|wink
 * @param {boolean} o.fists 是否举小拳头（标志性动作）
 * @param {boolean} o.zzz  是否显示 Zzz
 * @param {string} o.cls   附加 class
 */
export function lionSVG(o = {}) {
  const size = o.size || 64;
  const mood = o.mood || 'happy';
  const g = uid();
  const petalFill = `url(#lm2${g})`;
  return `<svg class="lion ${o.cls || ''}" data-mood="${mood}" viewBox="0 0 56 56" width="${size}" height="${size}" aria-hidden="true">
  <defs>
    <radialGradient id="lm1${g}" cx="50%" cy="38%" r="64%">
      <stop offset="0%" stop-color="#FDD596"/><stop offset="55%" stop-color="#F5A93F"/><stop offset="100%" stop-color="#D97F1E"/>
    </radialGradient>
    <radialGradient id="lm2${g}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFD489"/><stop offset="100%" stop-color="#E8922A"/>
    </radialGradient>
    <radialGradient id="lf${g}" cx="46%" cy="30%" r="74%">
      <stop offset="0%" stop-color="#FFF6E4"/><stop offset="62%" stop-color="#FBD693"/><stop offset="100%" stop-color="#F3BC63"/>
    </radialGradient>
  </defs>
  <ellipse cx="28" cy="53" rx="14" ry="2.6" fill="rgba(120,80,30,.18)"/>
  <circle cx="28" cy="28" r="22" fill="url(#lm1${g})"/>
  ${manePetals(28, 28, 20.5, 4.6, 12, petalFill)}
  <circle cx="14.5" cy="14.5" r="5.2" fill="#F5A93F"/><circle cx="41.5" cy="14.5" r="5.2" fill="#F5A93F"/>
  <circle cx="14.5" cy="14.5" r="2.4" fill="#FBD9A0"/><circle cx="41.5" cy="14.5" r="2.4" fill="#FBD9A0"/>
  <circle cx="28" cy="29" r="16.5" fill="url(#lf${g})"/>
  <ellipse cx="21" cy="21" rx="5.4" ry="3.4" fill="#fff" opacity=".40"/>
  <g class="lion-eyes">${eyes(mood, o.wink)}</g>
  <ellipse cx="19" cy="32" rx="3" ry="2" fill="#ff9bb0" opacity=".45"/>
  <ellipse cx="37" cy="32" rx="3" ry="2" fill="#ff9bb0" opacity=".45"/>
  <ellipse cx="28" cy="33.4" rx="4.6" ry="3.4" fill="#FFF8EC"/>
  ${mouth(mood)}
  <circle cx="28" cy="31.6" r="1.7" fill="#C97B4A"/>
  ${o.fists || mood === 'cheer' ? fists() : ''}
  ${o.zzz || mood === 'sleepy' ? zzz() : ''}
</svg>`;
}

// 狮子台词库：按情绪/场景给一句有温度的话
const LINES = {
  happy: ['今天也要元气满满呀～', '拳拳真棒！', '记录一下，成长看得见～', '我在等你的小记录哦～'],
  cheer: ['太棒啦！给拳拳鼓掌！👏', '今日全能达成，厉害！', '拳拳最棒了！'],
  eat: ['啊呜啊呜，吃饱饱～', '好好吃饭，长高高！', '今天吃得香不香呀？'],
  poop: ['嗯……舒服多了～', '拉完心情都变好啦！'],
  sleepy: ['困困的，想睡觉觉…', '睡饱饱才能长高高哦～', '嘘～拳拳睡着啦'],
  play: ['一起来玩吧！', '哈哈，好开心～'],
  think: ['让我想想…', '要不要记一笔呢？'],
  empty: ['还没有记录呢，点下面的圆钮一键记一笔～', '快开启拳拳的成长日记吧！'],
};

/** 按情绪取一句台词（带确定性轮换，避免抖动） */
export function lionLine(mood = 'happy', seed = 0) {
  const arr = LINES[mood] || LINES.happy;
  return arr[Math.abs(seed) % arr.length];
}

/** 按时段推荐情绪：清晨/白天/夜间 */
export function moodByHour(h = new Date().getHours()) {
  if (h >= 21 || h < 6) return 'sleepy';
  if (h >= 11 && h < 13) return 'eat';
  if (h >= 17 && h < 20) return 'play';
  return 'happy';
}

/** 记录类型 → 狮子情绪（用于记录后的即时反馈） */
export const TYPE_MOOD = {
  feed: 'eat', drink: 'happy', poop: 'poop', sleep: 'sleepy',
  temp: 'think', medication: 'think', measure: 'happy', vaccine: 'cheer',
};
