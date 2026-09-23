// 拳拳成就系统：基于成长记录派生的可升级成就（铜 → 银 → 金 → 钻）。
// 设计原则（来自其乐嵘戎 代码 skill 的健壮性经验）：
//  - 大部分成就从 records/album/diaries/members 实时计算，零额外录入负担。
//  - 仅"已庆祝"状态持久化到云端（families.achState），避免每次渲染重复弹庆祝。
//  - 可达成·适中：阈值按 0~3 岁日常量校准。
//  - 可升级：每层阈值递增，越高越稀有（钻石=满级）。
//  - 可重复：recur 字段的成就（今日/本周）每天每周可再拿。
//  - 趣味化：引入 rarity（稀有度）+ hidden（隐藏彩蛋）+ 已获次数计数器。

export const ACH_CATS = {
  eat:   { label: '吃喝', icon: '🍽' },
  rest:  { label: '拉撒', icon: '💩' },
  sleep: { label: '睡觉', icon: '😴' },
  health:{ label: '健康', icon: '💉' },
  grow:  { label: '综合', icon: '🦁' },
};

// 层级中文（与勋章配色对应）
export const TIER_NAMES = ['铜', '银', '金', '钻'];
export const TIER_COLORS = ['#C98A4B', '#9AA7B4', '#E8B53A', '#7C5CFC'];

// 稀有度：决定卡片光效与排序（传说最吸睛，放在收藏册最前）
export const RARITY = {
  common:    { name: '普通', color: '#9AA7B4', glow: 'rgba(154,167,180,.30)' },
  rare:      { name: '稀有', color: '#3FB6E8', glow: 'rgba(63,182,232,.42)' },
  epic:      { name: '史诗', color: '#9B5CFC', glow: 'rgba(155,92,252,.46)' },
  legendary: { name: '传说', color: '#F5B301', glow: 'rgba(245,179,1,.55)' },
};
export const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 };

// 成就定义。metric 对应 computeMetrics 返回的字段名；tiers 阈值递增。
// rarity: 稀有度；hidden: 隐藏彩蛋（未达成前显示为「神秘成就 ?」）。
export const ACHIEVEMENTS = [
  // —— 吃喝 ——
  { id: 'feed_count',   cat: 'eat',   rarity: 'common', name: '干饭小能手', icon: '🍽', desc: '累计记录喂养次数', metric: 'feedCount',   tiers: [10, 50, 200, 500] },
  { id: 'drink_ml',     cat: 'eat',   rarity: 'common', name: '喝水小达人', icon: '💧', desc: '累计喝水总量 (ml)', metric: 'drinkMl',     tiers: [500, 2000, 8000, 30000] },
  { id: 'food_kinds',   cat: 'eat',   rarity: 'common', name: '辅食探险家', icon: '🥦', desc: '尝过的不重样食材种数', metric: 'foodKinds', tiers: [5, 15, 30, 50] },
  { id: 'feed_streak',  cat: 'eat',   rarity: 'common', name: '一日三餐打卡', icon: '🍚', desc: '连续有喂养记录的天数', metric: 'feedStreak', tiers: [3, 7, 30, 100] },
  { id: 'early_bird',   cat: 'eat',   rarity: 'rare',   name: '晨光爸妈',   icon: '🌅', desc: '清晨 6 点前就为拳拳忙活的次数', metric: 'earlyCount', tiers: [5, 20, 60] },
  // —— 拉撒 ——
  { id: 'poop_count',   cat: 'rest',  rarity: 'common', name: '轻松如厕',   icon: '💩', desc: '累计记录排泄次数', metric: 'poopCount',   tiers: [20, 100, 365, 1000] },
  // —— 睡觉 ——
  { id: 'sleep_hours',  cat: 'sleep', rarity: 'common', name: '睡眠小冠军', icon: '😴', desc: '累计睡眠小时数', metric: 'sleepHours',  tiers: [50, 200, 500, 1500] },
  { id: 'sleep_streak', cat: 'sleep', rarity: 'common', name: '作息小标兵', icon: '🌙', desc: '连续有睡眠记录的天数', metric: 'sleepStreak', tiers: [3, 7, 30, 100] },
  // —— 健康 ——
  { id: 'vaccine_kinds',cat: 'health',rarity: 'rare',   name: '疫苗卫士',   icon: '💉', desc: '已记录的不同疫苗种数', metric: 'vaccineKinds',tiers: [5, 12, 20, 29] },
  { id: 'measure_count', cat: 'health',rarity: 'common', name: '成长测量师', icon: '📏', desc: '累计体测次数', metric: 'measureCount', tiers: [4, 12, 36, 100] },
  { id: 'care_count',   cat: 'health',rarity: 'common', name: '健康守护',   icon: '🌡', desc: '累计体温 / 用药记录次数', metric: 'careCount', tiers: [3, 10, 30, 100] },
  { id: 'night_guard',  cat: 'health',rarity: 'rare',   hidden: true, name: '深夜守护者', icon: '🌃', desc: '深夜(22:00–6:00)还在记录守护拳拳的次数', metric: 'nightCount', tiers: [10, 30, 100] },
  // —— 综合 ——
  { id: 'album_count',  cat: 'grow',  rarity: 'common', name: '影像记录家', icon: '📸', desc: '图册照片张数', metric: 'albumCount',  tiers: [10, 50, 200, 600] },
  { id: 'diary_count',  cat: 'grow',  rarity: 'common', name: '日记小作家', icon: '📓', desc: '日记篇数', metric: 'diaryCount',  tiers: [5, 20, 60, 150] },
  { id: 'active_streak', cat: 'grow',  rarity: 'rare',   name: '坚持打卡王', icon: '🔥', desc: '连续活跃天数（有任意记录）', metric: 'activeStreak', tiers: [7, 30, 100, 365] },
  { id: 'member_count', cat: 'grow',  rarity: 'common', name: '全家总动员', icon: '👨‍👩‍👧', desc: '家庭成员人数', metric: 'memberCount', tiers: [3, 5, 8, 15] },
  { id: 'multi_caretaker', cat: 'grow', rarity: 'rare', name: '协作之星', icon: '🤝', desc: '为拳拳记录过的不同照护者人数', metric: 'operatorKinds', tiers: [3, 5, 8] },
  { id: 'daily_all_master', cat: 'grow', rarity: 'rare', name: '全能打卡达人', icon: '⭐', desc: '集齐「吃+喝+拉+睡」的天数累计', metric: 'dailyAllDays', tiers: [10, 30, 100] },
  { id: 'all_in_family', cat: 'grow',  rarity: 'epic', hidden: true, name: '全家都爱拳拳', icon: '💞', desc: '每一位家庭成员都为拳拳留下过记录', metric: 'allMembersActive', tiers: [1] },
  { id: 'hundred_days', cat: 'grow',   rarity: 'epic', hidden: true, name: '百日成长记', icon: '📿', desc: '从第一次记录走到现在的天数', metric: 'spanDays', tiers: [100, 200, 365] },
  { id: 'first_year',   cat: 'grow',   rarity: 'legendary', hidden: true, name: '一岁里程碑', icon: '🎂', desc: '拳拳的一岁，被温柔完整地记录了下来', metric: 'spanDays', tiers: [365] },
  // —— 循环类（可重复获得）——
  { id: 'daily_all',    cat: 'grow',  rarity: 'rare',   name: '今日全能宝宝', icon: '🌟', desc: '今天集齐 吃 + 喝 + 拉 + 睡', metric: 'dailyAll', tiers: [1], recur: 'day' },
  { id: 'week_full',    cat: 'grow',  rarity: 'rare',   name: '本周全勤',   icon: '📅', desc: '本周 7 天每天都有记录', metric: 'weekFull', tiers: [1], recur: 'week' },
];

// ============ 工具 ============
function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function weekKey(ts) {
  const d = new Date(ts);
  const day = d.getDay(); const diff = (day + 6) % 7;
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
  return `${s.getFullYear()}-W${String(Math.floor((s.getDate() + (new Date(s.getFullYear(), s.getMonth(), 1).getDay() + 6) % 7) / 7) + 1)}`;
}

// 连续天数：从今天往前数（今天没记录则从昨天起算，避免"今天还没记"就断签）。
function streakUpTo(daySet, now) {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  const offset = daySet.has(dayKey(d.getTime())) ? 0 : 1;
  let cnt = 0;
  for (let i = offset; ; i++) {
    const t = d.getTime() - i * 86400000;
    if (daySet.has(dayKey(t))) cnt++; else break;
  }
  return cnt;
}

// ============ 指标计算 ============
export function computeMetrics(records, extra = {}) {
  const now = extra.now || Date.now();
  const types = { feed: [], drink: [], poop: [], sleep: [], vaccine: [], measure: [], temp: [], medication: [] };
  const dayMap = new Map();      // dayKey -> {feed,drink,poop,sleep}
  const operatorSet = new Set();
  let minTs = Infinity, maxTs = -Infinity, night = 0, early = 0;

  for (const r of records) {
    const t = r.type;
    if (t in types) types[t].push(r);
    if (r.operatorId) operatorSet.add(r.operatorId);
    const dk = dayKey(r.ts);
    let dm = dayMap.get(dk);
    if (!dm) { dm = { feed: false, drink: false, poop: false, sleep: false }; dayMap.set(dk, dm); }
    if (t === 'feed') dm.feed = true;
    else if (t === 'drink') dm.drink = true;
    else if (t === 'poop') dm.poop = true;
    else if (t === 'sleep') dm.sleep = true;
    const h = new Date(r.ts).getHours();
    if (h >= 22 || h < 6) night++;
    if (h < 6) early++;
    if (r.ts < minTs) minTs = r.ts;
    if (r.ts > maxTs) maxTs = r.ts;
  }

  const today = dayKey(now);
  const todayDm = dayMap.get(today);
  const dailyAll = (todayDm && todayDm.feed && todayDm.drink && todayDm.poop && todayDm.sleep) ? 1 : 0;
  let dailyAllDays = 0;
  for (const dm of dayMap.values()) if (dm.feed && dm.drink && dm.poop && dm.sleep) dailyAllDays++;

  // 本周全勤：周一到今天所在周日，7 天每天至少一条任意记录
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
  const diff = (d0.getDay() + 6) % 7;
  const start = new Date(d0); start.setDate(d0.getDate() - diff);
  let weekFull = true;
  for (let i = 0; i < 7; i++) {
    const key = dayKey(start.getTime() + i * 86400000);
    const dm = dayMap.get(key);
    if (!dm || !(dm.feed || dm.drink || dm.poop || dm.sleep)) { weekFull = false; break; }
  }

  const foodSet = new Set();
  for (const r of types.feed) if (r.value && r.value.foods) r.value.foods.forEach((f) => foodSet.add(f));

  const { albumCount = 0, diaryCount = 0, memberCount = 0, memberIds = [] } = extra;
  const allMembersActive = (memberIds.length && memberIds.every((id) => operatorSet.has(id))) ? 1 : 0;
  const spanDays = records.length ? Math.floor((maxTs - minTs) / 86400000) + 1 : 0;

  return {
    feedCount: types.feed.length,
    drinkMl: types.drink.reduce((s, r) => s + (Number(r.value && r.value.ml) || 0), 0),
    foodKinds: foodSet.size,
    vaccineKinds: new Set(types.vaccine.map((v) => v.value && v.value.name)).size,
    measureCount: types.measure.length,
    careCount: types.temp.length + types.medication.length,
    sleepHours: types.sleep.reduce((s, r) => s + (Number(r.value && r.value.duration) || 0) / 60, 0),
    albumCount, diaryCount, memberCount,
    activeStreak: streakUpTo(new Set(dayMap.keys()), now),
    feedStreak: streakUpTo(new Set(types.feed.map((r) => dayKey(r.ts))), now),
    sleepStreak: streakUpTo(new Set(types.sleep.map((r) => dayKey(r.ts))), now),
    dailyAll, dailyAllDays, weekFull: weekFull ? 1 : 0,
    nightCount: night, earlyCount: early, operatorKinds: operatorSet.size,
    spanDays, allMembersActive,
  };
}

// 单枚成就求值：返回当前进度、已达层级、下一层阈值、进度百分比。
export function evalAchievement(ach, metrics) {
  const v = metrics[ach.metric] || 0;
  let tier = 0;
  for (let i = 0; i < ach.tiers.length; i++) { if (v >= ach.tiers[i]) tier = i + 1; else break; }
  const next = tier < ach.tiers.length ? ach.tiers[tier] : null;
  const prevT = tier > 0 ? ach.tiers[tier - 1] : 0;
  const pct = next ? Math.min(100, Math.round(((v - prevT) / Math.max(1, next - prevT)) * 100)) : 100;
  return { value: v, tier, next, pct, maxTier: ach.tiers.length };
}

// 计算全部成就 + 判定本周期是否有"新解锁/升级"需要庆祝。
// achState: { [achId]: { tier, recurKey, count } }  （count: 循环成就已获得次数）
export function evaluateAll(records, extra, achState = {}) {
  const metrics = computeMetrics(records, extra);
  const now = extra.now || Date.now();
  const rk = (ach) => ach.recur === 'day' ? dayKey(now) : ach.recur === 'week' ? weekKey(now) : null;
  const list = ACHIEVEMENTS.map((ach) => {
    const ev = evalAchievement(ach, metrics);
    const st = achState[ach.id] || {};
    let celebrate = false;
    if (ach.recur) {
      // 循环类：本周期达到即庆祝一次，并累计获得次数
      const key = rk(ach);
      if (ev.tier >= 1 && st.recurKey !== key) { celebrate = true; st.recurKey = key; st.count = (st.count || 0) + 1; }
      if (ev.tier > (st.tier || 0)) st.tier = ev.tier;
    } else {
      if (ev.tier > (st.tier || 0)) { celebrate = true; st.tier = ev.tier; }
    }
    return { ach, ev, celebrate, state: { ...st } };
  });
  const newlyCelebrated = list.filter((x) => x.celebrate);
  return { metrics, list, newlyCelebrated, achState: Object.fromEntries(list.map((x) => [x.ach.id, x.state])) };
}
