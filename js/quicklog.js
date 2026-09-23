// 一键记录引擎 —— 把高频记录从「填表单」改成「点一下」
// 设计依据：主流育儿 App（如萌宝成长助手）的核心体验 = 一键记录 + 复制上次回填 + 长按快捷 + 5 秒内可撤销。
import { vaccineNames } from './vaccine.js?v=15';
import { FOOD_CATEGORIES } from './food.js?v=15';

// 一键按钮定义
// instant:'log'   → 点一下直接记录（复用上次的值）
// instant:'timer' → 睡眠计时器（点开始 / 点结束）
// sheet:xxx       → 弹出轻量选择面板（芯片选择，仍然几乎不用打字）
export const QUICK = [
  { type: 'feed', ic: '🍽', label: '吃', color: 'var(--feed)', instant: 'log' },
  { type: 'drink', ic: '💧', label: '喝水', color: 'var(--drink)', instant: 'log' },
  { type: 'poop', ic: '💩', label: '拉臭', color: 'var(--poop)', instant: 'log' },
  { type: 'sleep', ic: '😴', label: '睡觉', color: 'var(--sleep)', instant: 'timer' },
  { type: 'temp', ic: '🌡', label: '体温', color: 'var(--temp)', sheet: 'temp' },
  { type: 'measure', ic: '📏', label: '体测', color: 'var(--measure)', sheet: 'measure' },
  { type: 'medication', ic: '💊', label: '用药', color: 'var(--med)', sheet: 'med' },
  { type: 'vaccine', ic: '💉', label: '疫苗', color: 'var(--vaccine)', sheet: 'vaccine' },
];

/** 取某类型最近一条记录 */
export function lastOf(records, type) {
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i] && records[i].type === type) return records[i];
  }
  return null;
}

/**
 * 生成一键记录的默认值（复制上次 + 兜底默认值）
 * 返回 { value, note, hint }
 */
export function defaultValue(type, records) {
  const last = lastOf(records, type);
  const v = (last && last.value) || {};
  switch (type) {
    case 'feed':
      return { value: { kind: v.kind || '母乳', amount: v.amount || 120 }, note: '', hint: v.amount ? `沿用上次 ${v.kind || '母乳'} ${v.amount}ml` : '默认 母乳 120ml' };
    case 'drink':
      return { value: { times: v.times || 1, ml: v.ml || 50 }, note: '', hint: v.ml ? `沿用上次 ${v.ml}ml` : '默认 50ml' };
    case 'poop':
      return { value: { type: v.type || '正常', color: v.color || '黄' }, note: '', hint: `沿用上次 ${v.type || '正常'}·${v.color || '黄'}` };
    case 'sleep':
      return { value: { duration: v.duration || 60 }, note: '', hint: v.duration ? `沿用上次 ${v.duration} 分钟` : '默认 60 分钟' };
    default:
      return { value: {}, note: '', hint: '' };
  }
}

/** 一键记录结果的友好文案 */
export function describe(type, value) {
  const v = value || {};
  switch (type) {
    case 'feed': return `吃 · ${v.kind || ''}${v.amount ? ' ' + v.amount + 'ml' : ''}`;
    case 'drink': return `喝水 · ${v.ml || 0}ml`;
    case 'poop': return `拉臭 · ${v.type || ''}${v.color ? '·' + v.color : ''}`;
    case 'sleep': {
      const m = Number(v.duration) || 0;
      if (m >= 60) {
        const h = Math.floor(m / 60);
        const rm = m % 60;
        return `睡觉 · ${h}小时${rm > 0 ? rm + '分' : ''}`;
      }
      return `睡觉 · ${m} 分钟`;
    }
    case 'temp': return `体温 · ${v.temp}℃`;
    case 'measure': return `体测 · ${v.weight ? v.weight + 'kg ' : ''}${v.height ? v.height + 'cm' : ''}`.trim();
    case 'medication': return `用药 · ${v.med || ''}`;
    case 'vaccine': return `疫苗 · ${v.name || ''}`;
    default: return '已记录';
  }
}

// ============ 轻量选择面板（sheet）============
// 目标：几乎不用打字，全部芯片点选；需要精确数字时才给输入框，并预填上次值。

const chipRow = (items, name, cur) =>
  `<div class="ql-chips">${items.map((it) => {
    const val = typeof it === 'string' ? it : it.v;
    const lab = typeof it === 'string' ? it : it.l;
    return `<button type="button" class="ql-chip ${String(cur) === String(val) ? 'on' : ''}" data-action="qlPick" data-ql-pick="${name}" data-val="${val}">${lab}</button>`;
  }).join('')}</div>`;

export function sheetHTML(type, records) {
  const last = lastOf(records, type);
  const v = (last && last.value) || {};

  if (type === 'drink') {
    return `
      <div class="ql-sheet-title">💧 喝了多少？</div>
      <div class="muted ql-hint">点一下常用量，或手动输入</div>
      ${chipRow([{ v: 30, l: '30ml' }, { v: 50, l: '50ml' }, { v: 80, l: '80ml' }, { v: 100, l: '100ml' }, { v: 120, l: '120ml' }, { v: 150, l: '150ml' }, { v: 180, l: '180ml' }, { v: 200, l: '200ml' }, { v: 250, l: '250ml' }], 'ml', v.ml)}
      <input class="ql-input" type="number" data-ql-field="ml" value="${v.ml || ''}" placeholder="手动输入毫升">
      <div class="ql-actions"><button class="btn btn-ghost" data-action="qlClose">取消</button><button class="btn btn-primary" data-action="qlSubmit" data-type="drink">记录喝水</button></div>`;
  }

  if (type === 'sleep') {
    return `
      <div class="ql-sheet-title">😴 睡了多久？</div>
      <div class="muted ql-hint">点一下时长，或直接输入小时 / 分钟</div>
      ${chipRow([{ v: 30, l: '30分' }, { v: 60, l: '1小时' }, { v: 90, l: '1.5小时' }, { v: 120, l: '2小时' }, { v: 150, l: '2.5小时' }, { v: 180, l: '3小时' }, { v: 240, l: '4小时' }, { v: 360, l: '6小时' }], 'mins', v.duration)}
      <div class="ql-numrow">
        <label><span>小时</span><input class="ql-input" type="number" step="0.5" data-ql-field="sleepH" value="${(v.duration || 0) >= 60 ? Math.floor((v.duration || 0) / 60) : ''}" placeholder="如 1.5"></label>
        <label><span>分钟</span><input class="ql-input" type="number" data-ql-field="sleepM" value="${(v.duration || 0) % 60 || ''}" placeholder="如 30"></label>
      </div>
      <div class="ql-actions"><button class="btn btn-ghost" data-action="qlClose">取消</button><button class="btn btn-primary" data-action="qlSubmit" data-type="sleep">记录睡眠</button></div>`;
  }

  if (type === 'poop') {
    return `
      <div class="ql-sheet-title">💩 拉臭情况</div>
      <div class="muted ql-hint">点选性状和颜色</div>
      <div class="muted" style="margin-top:8px">性状</div>
      ${chipRow(['正常', '软', '硬', '稀', '水样'], 'type', v.type)}
      <div class="muted" style="margin-top:8px">颜色</div>
      ${chipRow(['黄', '绿', '棕', '黑', '红'], 'color', v.color)}
      <div class="ql-actions"><button class="btn btn-ghost" data-action="qlClose">取消</button><button class="btn btn-primary" data-action="qlSubmit" data-type="poop">记录拉臭</button></div>`;
  }

  if (type === 'temp') {
    return `
      <div class="ql-sheet-title">🌡 今天体温多少？</div>
      <div class="muted ql-hint">点一下就好，也可以手动输入</div>
      ${chipRow(['36.5', '36.8', '37.0', '37.3', '37.5', '38.0', '38.5', '39.0'], 'temp', v.temp)}
      <input class="ql-input" type="number" step="0.1" data-ql-field="temp" value="${v.temp || ''}" placeholder="手动输入体温 ℃">
      <div class="ql-actions"><button class="btn btn-ghost" data-action="qlClose">取消</button><button class="btn btn-primary" data-action="qlSubmit" data-type="temp">记录体温</button></div>`;
  }

  if (type === 'measure') {
    return `
      <div class="ql-sheet-title">📏 记一次体测</div>
      <div class="muted ql-hint">已预填上次数值，改一下就能存</div>
      <div class="ql-numrow">
        <label><span>体重 kg</span><input class="ql-input" type="number" step="0.01" data-ql-field="weight" value="${v.weight || ''}" placeholder="如 8.2"></label>
        <label><span>身高 cm</span><input class="ql-input" type="number" step="0.1" data-ql-field="height" value="${v.height || ''}" placeholder="如 70"></label>
        <label><span>头围 cm</span><input class="ql-input" type="number" step="0.1" data-ql-field="head" value="${v.head || ''}" placeholder="如 45"></label>
      </div>
      <div class="ql-actions"><button class="btn btn-ghost" data-action="qlClose">取消</button><button class="btn btn-primary" data-action="qlSubmit" data-type="measure">保存体测</button></div>`;
  }

  if (type === 'medication') {
    const used = [...new Set(records.filter((r) => r.type === 'medication' && r.value.med).map((r) => r.value.med))].slice(0, 6);
    return `
      <div class="ql-sheet-title">💊 吃了什么药？</div>
      ${used.length ? `<div class="muted ql-hint">最近用过</div>${chipRow(used, 'med', '')}` : ''}
      <input class="ql-input" type="text" data-ql-field="med" value="" placeholder="药品名称，如 布洛芬">
      <div class="ql-numrow">
        <label><span>剂量</span><input class="ql-input" type="text" data-ql-field="dose" value="${v.dose || ''}" placeholder="如 3"></label>
        <label><span>单位</span><select class="ql-input" data-ql-field="unit"><option>ml</option><option>mg</option><option>滴</option><option>袋</option></select></label>
      </div>
      <div class="ql-actions"><button class="btn btn-ghost" data-action="qlClose">取消</button><button class="btn btn-primary" data-action="qlSubmit" data-type="medication">记录用药</button></div>`;
  }

  if (type === 'vaccine') {
    const names = vaccineNames().slice(0, 12);
    return `
      <div class="ql-sheet-title">💉 打了哪针疫苗？</div>
      <div class="muted ql-hint">参考天津市免疫规划</div>
      ${chipRow(names, 'name', '')}
      <input class="ql-input" type="text" data-ql-field="name" value="" placeholder="或手动输入疫苗名称">
      <div class="ql-actions"><button class="btn btn-ghost" data-action="qlClose">取消</button><button class="btn btn-primary" data-action="qlSubmit" data-type="vaccine">记录疫苗</button></div>`;
  }
  return '';
}

/** 辅食快捷打卡面板（吃 → 选辅食） */
export function foodSheetHTML() {
  return `
    <div class="ql-sheet-title">🥦 今天吃了什么辅食？</div>
    <div class="muted ql-hint">可多选，点「记下来」完成</div>
    <div class="ql-foodbox">${FOOD_CATEGORIES.map((c) => `
      <div class="ql-foodgroup"><div class="muted">${c.group}</div>
        <div class="ql-chips">${c.items.map((n) => `<button type="button" class="ql-chip" data-action="qlFood" data-food="${n}">${n}</button>`).join('')}</div>
      </div>`).join('')}
    </div>
    <div class="ql-actions"><button class="btn btn-ghost" data-action="qlClose">取消</button><button class="btn btn-primary" data-action="qlSubmit" data-type="feed">记下来</button></div>`;
}
