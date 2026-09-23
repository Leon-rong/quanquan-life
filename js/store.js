import { CONFIG } from './config.js?v=15';
import { flatFoods } from './food.js?v=15';

// ============ 工具 ============
const LS = 'quanquan:';

// 单家庭专属模式：本应用只服务拳拳一个家庭，不再支持多家庭。
// familyId 固化为云端既有家庭；邀请码固定为拳拳生日，全员共用。
export const SINGLE_FAMILY = {
  familyId: '20ea0edd-e0f9-4d0a-bcde-78011856cffe',
  name: '李辰谕 拳拳',
  inviteCode: '20250124',
};
const _memStore = new Map();
function _hasLS() {
  try { return typeof localStorage !== 'undefined' && localStorage.getItem !== undefined; } catch { return false; }
}
function _lsGet(k) {
  if (_hasLS()) return localStorage.getItem(k);
  return _memStore.get(k) || null;
}
function _lsSet(k, v) {
  if (_hasLS()) localStorage.setItem(k, v);
  else _memStore.set(k, v);
}
function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : 'id' + Date.now() + Math.random().toString(16).slice(2);
}
function lsGet(k, d) {
  try { const v = _lsGet(LS + k); return v ? JSON.parse(v) : d; } catch { return d; }
}
function lsSet(k, v) { _lsSet(LS + k, JSON.stringify(v)); }
function genCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
const COLORS = ['#e8743b', '#6a7fd0', '#5aa469', '#b455c9', '#3b9fb8', '#f0a23b', '#d9534f', '#9b7a4b'];

// 云端操作返回的 error 统一转成可读字符串；resId 兼容 v2(_id)/v3(id) 两种返回字段名。
function fmtErr(e, prefix) {
  if (!e) return prefix || '云端操作失败';
  const msg = (typeof e === 'string') ? e : (e.message || (e.code ? String(e.code) : JSON.stringify(e)));
  return (prefix ? prefix + '：' : '') + msg;
}
function resId(res) { return res && (res._id || res.id); }

function ab2b64(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function b642ab(b64) {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const mat = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    mat,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptText(plain, password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plain));
  return { cipher: ab2b64(cipher), salt: ab2b64(salt), iv: ab2b64(iv) };
}

async function decryptText({ cipher, salt, iv }, password) {
  const key = await deriveKey(password, b642ab(salt));
  const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b642ab(iv) }, key, b642ab(cipher));
  return new TextDecoder().decode(buf);
}

// ============ 图片压缩与上传 ============
// 画布压缩：最长边 ≤ maxEdge；非 PNG 转 JPEG(quality)，PNG 保留透明。
function compressImage(file, { maxEdge = 1600, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      return reject(new Error('请选择图片文件'));
    }
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('读取图片失败'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('解析图片失败'));
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        const keepPng = /png/i.test(file.type) || (file.name && /\.png$/i.test(file.name));
        const type = keepPng ? 'image/png' : 'image/jpeg';
        cv.toBlob(
          (blob) => (blob ? resolve({ blob, type }) : reject(new Error('图片压缩失败'))),
          type, keepPng ? undefined : quality
        );
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error('编码失败'));
    r.onload = () => resolve(r.result);
    r.readAsDataURL(blob);
  });
}

// ============ 状态 ============
let cloud = null;            // { app, db, auth }（云端模式）
let session = lsGet('session', null);   // { familyId, memberId }

// ============ 本地（演示）存储 ============
function famKey(id) { return 'family:' + id; }
function loadFam(id) { return lsGet(famKey(id), null); }
function saveFam(f) { lsSet(famKey(f._id), f); }
function findFamByCode(code) {
  const prefix = LS + 'family:';
  if (_hasLS()) {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        const f = JSON.parse(localStorage.getItem(k));
        if (f.inviteCode === code) return f;
      }
    }
  } else {
    for (const [k, v] of _memStore.entries()) {
      if (k.startsWith(prefix)) {
        const f = JSON.parse(v);
        if (f.inviteCode === code) return f;
      }
    }
  }
  return null;
}

// ---- 本地→云端 补传队列：云端开启但暂不可用（离线/初始化失败）时先记本地，恢复后自动补传 ----
function syncQueueGet() { return lsGet('syncQueue', []); }
function syncQueueSet(q) { lsSet('syncQueue', q); }
function syncQueuePush(item) { const q = syncQueueGet(); if (q.length < 500) { q.push(item); syncQueueSet(q); } }

export const store = {
  get session() { return session; },
  isCloud() { return CONFIG.USE_CLOUD && !!cloud; },

  // 初始化（云端模式时连接 CloudBase；失败回退本地）。
  cloudError: null,
  cloudErrorDetail: null,   // 原始错误对象（含 code），供 UI 展示精确原因
  async bootstrap() {
    this.cloudError = null;
    this.cloudErrorDetail = null;
    if (CONFIG.USE_CLOUD && CONFIG.ENV_ID) {
      try {
        const cb = window.cloudbase;
        if (!cb) throw new Error('未加载 CloudBase SDK（index.html 应引入 ./vendor/cloudbase.js）');
        if (typeof cb.init !== 'function') throw new Error('CloudBase SDK 未正确暴露 init 方法');
        console.log('[CloudBase] initializing env=', CONFIG.ENV_ID);
        const app = cb.init({ env: CONFIG.ENV_ID, region: 'ap-shanghai', accessKey: CONFIG.CLOUD_ACCESS_KEY });
        console.log('[CloudBase] signing in anonymously...');
        // 匿名登录可能因网络/配置原因无限挂起，加 10 秒超时避免页面卡死。
        const loginRes = await Promise.race([
          app.auth.signInAnonymously(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('云端登录超时（10s）')), 10000))
        ]);
        const loginErr = loginRes && loginRes.error;
        if (loginErr) throw loginErr;
        console.log('[CloudBase] anonymous login ok');
        cloud = { app, db: app.database(), auth: app.auth };
      } catch (e) {
        // 尽量保留 code + message，方便不同浏览器/设备上报精确错误。
        const code = e && (e.code || e.errCode || e.errorCode);
        const msg = (e && (e.message || e.errMsg)) ? (e.message || e.errMsg) : String(e);
        this.cloudError = code ? `${msg}（code: ${code}）` : msg;
        this.cloudErrorDetail = e;
        console.error('[CloudBase] 初始化失败，已回退本地演示模式。错误详情：', e);
        cloud = null;
      }
    }
  },

  // ---- 家庭 / 登录 ----
  async createFamily({ name, adminName }) {
    const fam = {
      _id: uid(), name, inviteCode: genCode(), createdAt: Date.now(),
      members: [], records: [], album: [], customFoods: [], diaries: [], achState: {},
    };
    const me = { _id: uid(), name: adminName, role: 'admin', color: COLORS[0] };
    fam.members.push(me);
    if (this.isCloud()) {
      const fres = await cloud.db.collection('families').add(fam);
      if (fres && fres.error) throw new Error(fmtErr(fres.error, '创建家庭失败'));
      const famId = resId(fres);
      if (famId) fam._id = famId;
      me.familyId = fam._id; // 必须在 fam._id 确定后再赋值
      const mres = await cloud.db.collection('members').add(me);
      if (mres && mres.error) throw new Error(fmtErr(mres.error, '创建成员失败'));
      const memId = resId(mres);
      if (memId) me._id = memId;
    } else {
      saveFam(fam);
    }
    session = { familyId: fam._id, memberId: me._id };
    lsSet('session', session);
    return { fam, me };
  },

  async joinFamily({ code, name, role }) {
    let fam;
    if (this.isCloud()) {
      const r = await cloud.db.collection('families').where({ inviteCode: code }).get();
      fam = r.data[0];
      if (!fam) throw new Error('邀请码不正确');
    } else {
      fam = findFamByCode(code);
      if (!fam) throw new Error('邀请码不正确');
    }
    if (fam.members.length >= CONFIG.MAX_MEMBERS) throw new Error('家庭成员已达上限');
    const me = { _id: uid(), name, role, color: COLORS[fam.members.length % COLORS.length], familyId: fam._id };
    fam.members.push(me);
    if (this.isCloud()) {
      const upRes = await cloud.db.collection('families').doc(fam._id).update({ members: fam.members });
      if (upRes && upRes.error) throw new Error(fmtErr(upRes.error, '更新家庭成员失败'));
      const mres = await cloud.db.collection('members').add(me);
      if (mres && mres.error) throw new Error(fmtErr(mres.error, '创建成员失败'));
      const memId = resId(mres);
      if (memId) me._id = memId;
    } else {
      saveFam(fam);
    }
    session = { familyId: fam._id, memberId: me._id };
    lsSet('session', session);
    return { fam, me };
  },

  async loadCurrent() {
    if (!session) return null;
    let fam;
    if (this.isCloud()) {
      // 云端：families 仅存核心配置；records/album/diaries/members 为独立集合，按 familyId 聚合
      let base;
      try { base = (await cloud.db.collection('families').doc(session.familyId).get()).data; }
      catch { base = null; }
      if (!base) { session = null; lsSet('session', null); return null; }
      const q = (name) => cloud.db.collection(name).where({ familyId: session.familyId }).get().catch(() => ({ data: [] }));
      const [mR, rR, aR, dR] = await Promise.all([q('members'), q('records'), q('album'), q('diaries')]);
      fam = {
        ...base,
        // 关键：CloudBase v2 的 doc(id).get() 返回的 data 不含 _id，必须用 session.familyId 兜底；
        // 否则后续 addRecord 会写出无 familyId 的记录，where({familyId}) 回查不到，今日概览恒为 0。
        _id: session.familyId,
        members: (mR && mR.data) || [],
        records: (rR && rR.data) || [],
        album: (aR && aR.data) || [],
        diaries: (dR && dR.data) || [],
      };
    } else {
      fam = loadFam(session.familyId);
    }
    if (!fam) { session = null; lsSet('session', null); return null; }
    const me = fam.members.find((m) => m._id === session.memberId) || null;
    return { fam, me };
  },

  logout() { session = null; lsSet('session', null); },

  // 切换当前激活成员（用于多成员设备切换/测试）；传 null 等同登出。
  setSession(s) { session = s || null; lsSet('session', session); },

  // ---- 单家庭模式：凭固定邀请码进入拳拳家 ----
  async enterFamily({ name, role }) {
    const code = SINGLE_FAMILY.inviteCode;
    if (this.isCloud()) return this.joinFamily({ code, name, role });
    // 本地/演示模式：固定码家庭不存在则自动创建一个，再走加入流程
    if (!findFamByCode(code)) {
      saveFam({
        _id: uid(), name: SINGLE_FAMILY.name, inviteCode: code, createdAt: Date.now(),
        members: [], records: [], album: [], customFoods: [], diaries: [], achState: {},
      });
    }
    return this.joinFamily({ code, name, role });
  },

  // ---- 本地记录自动补传到云端：返回成功同步条数 ----
  async syncLocalQueue() {
    if (!this.isCloud() || !session || !session.familyId) return 0;
    const q = syncQueueGet();
    if (!q.length) return 0;
    const { fam } = await this.loadCurrent();
    let ok = 0;
    const remain = [];
    for (const item of q) {
      try {
        if (item.kind === 'record' && item.rec) {
          const rec = { ...item.rec, familyId: fam._id };
          const res = await cloud.db.collection('records').add(rec);
          if (res && res.error) throw new Error(fmtErr(res.error));
          ok++;
        } else { remain.push(item); }
      } catch (e) { remain.push(item); console.warn('补传失败，保留待重试', e); }
    }
    syncQueueSet(remain);
    return ok;
  },

  // ---- 成员管理（仅管理员） ----
  async updateMember(memberId, patch) {
    const { fam } = await this.loadCurrent();
    const m = fam.members.find((x) => x._id === memberId);
    if (!m) throw new Error('成员不存在');
    Object.assign(m, patch);
    if (this.isCloud()) {
      await cloud.db.collection('families').doc(fam._id).update({ members: fam.members });
      await cloud.db.collection('members').doc(memberId).update(patch);
    } else { saveFam(fam); }
    return fam;
  },

  async removeMember(memberId) {
    const { fam } = await this.loadCurrent();
    fam.members = fam.members.filter((x) => x._id !== memberId);
    if (this.isCloud()) {
      await cloud.db.collection('families').doc(fam._id).update({ members: fam.members });
      await cloud.db.collection('members').doc(memberId).remove();
    } else { saveFam(fam); }
    return fam;
  },

  async saveFamilyMeta(patch) {
    const { fam } = await this.loadCurrent();
    Object.assign(fam, patch);
    if (this.isCloud()) {
      await cloud.db.collection('families').doc(fam._id).update(patch);
    } else { saveFam(fam); }
    return fam;
  },

  // ---- 记录（事件表，type 区分吃/拉/睡/体温/用药/体测） ----
  async addRecord({ type, value, note, ts }) {
    const { fam, me } = await this.loadCurrent();
    const rec = {
      _id: uid(), familyId: fam._id, type, value: value || {},
      note: note || '', operatorId: me._id, operatorName: me.name, ts: ts || Date.now(),
    };
    fam.records.push(rec);
    if (this.isCloud()) {
      const res = await cloud.db.collection('records').add(rec);
      if (res && res.error) throw new Error(fmtErr(res.error, '记录云端写入失败'));
      const rid = resId(res);
      if (rid) rec._id = rid;
    } else {
      saveFam(fam);
      // 云端已配置但当前不可用（离线/初始化失败）：入队待恢复后自动补传（familyId 在补传时按云端家庭重写）。
      if (CONFIG.USE_CLOUD && !cloud) syncQueuePush({ kind: 'record', rec: { ...rec, familyId: null, _id: null }, ts: rec.ts });
    }
    return rec;
  },

  async listRecords({ types = null, limit = 200 } = {}) {
    const { fam } = await this.loadCurrent();
    let list = fam.records.slice();
    if (types) list = list.filter((r) => types.includes(r.type));
    list.sort((a, b) => b.ts - a.ts);
    return list.slice(0, limit);
  },

  async updateRecord(id, patch) {
    const { fam } = await this.loadCurrent();
    const r = fam.records.find((x) => x._id === id);
    if (!r) throw new Error('记录不存在');
    Object.assign(r, patch);
    if (this.isCloud()) {
      await cloud.db.collection('records').doc(id).update(patch);
    } else { saveFam(fam); }
    return r;
  },

  async deleteRecord(id) {
    const { fam } = await this.loadCurrent();
    fam.records = fam.records.filter((x) => x._id !== id);
    if (this.isCloud()) {
      await cloud.db.collection('records').doc(id).remove();
    } else { saveFam(fam); }
    return fam;
  },

  // 用药重复拦截：窗口内同药已记录则返回该记录。
  async checkMedication({ med, ts = Date.now(), excludeId = null }) {
    const { fam } = await this.loadCurrent();
    const win = CONFIG.MEDICATION_WINDOW_MIN * 60 * 1000;
    const hit = fam.records.find(
      (r) => r.type === 'medication' && r._id !== excludeId &&
        r.value && r.value.med === med && ts - r.ts < win && ts - r.ts >= 0
    );
    return hit || null;
  },

  // ---- 图册 ----
  // 图片压缩上传：云端走对象存储返回 {fileID,url(CDN)}；本地返回压缩后的 dataURL。
  async uploadImage(file) {
    const { blob, type } = await compressImage(file);
    if (this.isCloud()) {
      const ext = type === 'image/png' ? 'png' : 'jpg';
      const cloudPath = `album/${session.familyId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data: upData, error: upErr } = await cloud.app.storage.from().upload(cloudPath, blob, { contentType: type });
      if (upErr) throw upErr;
      const fileID = upData.id;
      const { data: urlData, error: urlErr } = await cloud.app.storage.from().createSignedUrl(fileID, 86400);
      if (urlErr) throw urlErr;
      return { fileID, url: urlData.signedUrl, size: blob.size };
    }
    const url = await blobToDataURL(blob);
    return { url, size: blob.size };
  },

  async addAlbum({ url, fileID, caption, ts }) {
    const { fam, me } = await this.loadCurrent();
    const item = {
      _id: uid(), familyId: fam._id, url: url || '', fileID: fileID || '',
      caption: caption || '', operatorId: me._id, operatorName: me.name, ts: ts || Date.now(),
    };
    fam.album.push(item);
    if (this.isCloud()) {
      const res = await cloud.db.collection('album').add(item);
      if (res && res.error) throw new Error(fmtErr(res.error, '图册云端写入失败'));
      const aid = resId(res);
      if (aid) item._id = aid;
    } else { saveFam(fam); }
    return item;
  },

  async listAlbum(limit = 300) {
    const { fam } = await this.loadCurrent();
    let list = fam.album.slice().sort((a, b) => b.ts - a.ts).slice(0, limit);
    if (this.isCloud()) {
      const need = list.filter((it) => it.fileID && !it.url);
      if (need.length) {
        try {
          const { data: urlList, error: urlErr } = await cloud.app.storage.from().createSignedUrls(need.map((it) => it.fileID), 86400);
          if (urlErr) throw urlErr;
          const map = {};
          urlList.forEach((t) => { map[t.path] = t.signedUrl; });
          list = list.map((it) => (it.fileID && !it.url ? { ...it, url: map[it.fileID] || map[it.fileID.replace(/^cloud:\/\/[^/]+\//, '')] } : it));
        } catch (e) { console.warn('解析图片 CDN 链接失败：', e); }
      }
    }
    return list;
  },

  // ---- 食材清单 ----
  async getFoods() {
    const { fam } = await this.loadCurrent();
    const base = flatFoods().map((f) => f.name);
    const custom = (fam.customFoods || []).filter((n) => !base.includes(n));
    return [...base, ...custom];
  },

  async addCustomFood(name) {
    const { fam } = await this.loadCurrent();
    if (!fam.customFoods) fam.customFoods = [];
    if (!fam.customFoods.includes(name)) fam.customFoods.push(name);
    if (this.isCloud()) {
      await cloud.db.collection('families').doc(fam._id).update({ customFoods: fam.customFoods });
    } else { saveFam(fam); }
    return fam.customFoods;
  },

  // ---- 日记（加密、仅自己可见） ----
  async _memberDiaryLock() {
    const { me } = await this.loadCurrent();
    return me.diaryLock || null;
  },

  async hasDiaryPassword() {
    return !!(await this._memberDiaryLock());
  },

  async setupDiaryPassword(password) {
    const { fam, me } = await this.loadCurrent();
    if (me.diaryLock) throw new Error('密码已设置，如需修改请使用修改密码');
    const lock = await encryptText('diary-lock', password);
    me.diaryLock = lock;
    if (this.isCloud()) {
      await cloud.db.collection('families').doc(fam._id).update({ members: fam.members });
      await cloud.db.collection('members').doc(me._id).update({ diaryLock: lock });
    } else { saveFam(fam); }
  },

  async verifyDiaryPassword(password) {
    const lock = await this._memberDiaryLock();
    if (!lock) return true; // 未设密码视为通过
    try {
      const plain = await decryptText(lock, password);
      return plain === 'diary-lock';
    } catch { return false; }
  },

  async changeDiaryPassword(oldPassword, newPassword) {
    const { fam, me } = await this.loadCurrent();
    if (!(await this.verifyDiaryPassword(oldPassword))) throw new Error('原密码不正确');
    const list = (fam.diaries || []).filter((d) => d.memberId === me._id);
    for (const d of list) {
      if (!d.cipher) continue;
      try {
        const plain = await decryptText(d, oldPassword);
        const recrypted = await encryptText(plain, newPassword);
        Object.assign(d, recrypted);
      } catch (e) { console.warn('重加密日记失败', d._id, e); }
    }
    const lock = await encryptText('diary-lock', newPassword);
    me.diaryLock = lock;
    if (this.isCloud()) {
      await cloud.db.collection('members').doc(me._id).update({ diaryLock: lock });
      for (const d of list) {
        await cloud.db.collection('diaries').doc(d._id).update({ cipher: d.cipher, salt: d.salt, iv: d.iv });
      }
    } else { saveFam(fam); }
  },

  async _rawDiaries(memberId) {
    const { fam } = await this.loadCurrent();
    return (fam.diaries || []).filter((d) => d.memberId === memberId);
  },

  async listDiaries(password) {
    const { me } = await this.loadCurrent();
    const raw = await this._rawDiaries(me._id);
    const out = [];
    for (const d of raw) {
      try {
        const content = d.cipher ? await decryptText(d, password) : (d.content || '');
        out.push({ _id: d._id, date: d.date, content, ts: d.ts });
      } catch (e) { /* 解密失败的条目不返回 */ }
    }
    return out.sort((a, b) => b.ts - a.ts);
  },

  async addDiary({ date, content, password }) {
    const { fam, me } = await this.loadCurrent();
    const encrypted = await encryptText(content, password);
    const item = {
      _id: uid(), familyId: fam._id, memberId: me._id,
      date, ts: Date.now(), ...encrypted,
    };
    if (!fam.diaries) fam.diaries = [];
    fam.diaries.push(item);
    if (this.isCloud()) {
      const res = await cloud.db.collection('diaries').add(item);
      if (res && res.error) throw new Error(fmtErr(res.error, '日记云端写入失败'));
      const did = resId(res);
      if (did) item._id = did;
    } else { saveFam(fam); }
    return item;
  },

  async updateDiary(id, { date, content, password }) {
    const { fam, me } = await this.loadCurrent();
    const d = (fam.diaries || []).find((x) => x._id === id && x.memberId === me._id);
    if (!d) throw new Error('日记不存在');
    const encrypted = await encryptText(content, password);
    Object.assign(d, { date, ts: Date.now(), ...encrypted });
    if (this.isCloud()) {
      await cloud.db.collection('diaries').doc(id).update({ date, ts: d.ts, cipher: d.cipher, salt: d.salt, iv: d.iv });
    } else { saveFam(fam); }
  },

  async deleteDiary(id) {
    const { fam, me } = await this.loadCurrent();
    fam.diaries = (fam.diaries || []).filter((x) => !(x._id === id && x.memberId === me._id));
    if (this.isCloud()) {
      await cloud.db.collection('diaries').doc(id).remove();
    } else { saveFam(fam); }
  },

  // ---- 成就状态（仅存"已庆祝"标记，进度由记录实时派生） ----
  async getAchState() {
    const { fam } = await this.loadCurrent();
    return fam.achState || {};
  },
  async saveAchState(state) {
    const { fam } = await this.loadCurrent();
    fam.achState = state;
    if (this.isCloud()) {
      const base = (await cloud.db.collection('families').doc(fam._id).get().catch(() => null));
      if (base && base.data) await cloud.db.collection('families').doc(fam._id).update({ achState: state });
      else await cloud.db.collection('families').doc(fam._id).set({ achState: state });
    } else { saveFam(fam); }
    return state;
  },

  // ---- 数据导出（管理员） ----
  async exportAll() {
    const { fam } = await this.loadCurrent();
    return {
      exportedAt: new Date().toISOString(),
      family: { name: fam.name, inviteCode: fam.inviteCode, createdAt: fam.createdAt },
      members: fam.members,
      records: fam.records,
      album: fam.album,
      diaries: fam.diaries,
    };
  },
};
