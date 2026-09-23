// 角色与权限模型（依据需求确认版）：
//  - 管理员 admin        ：爸妈。可写、可管理成员/邀请码/删除任意记录、导出。
//  - 记录员 recorder     ：爷爷奶奶、姥姥姥爷。可添加/编辑/删除自己记录的条目，可查看全部。
//  - 只读   readonly     ：亲友。仅查看。
//  - 月嫂 已移除。
export const ROLES = {
  admin: { key: 'admin', label: '管理员（爸妈）', write: true, manage: true, deleteAny: true },
  recorder: { key: 'recorder', label: '记录员（爷爷奶奶·姥姥姥爷）', write: true, manage: false, deleteAny: false },
  readonly: { key: 'readonly', label: '只读（亲友）', write: false, manage: false, deleteAny: false },
};

export const ROLE_OPTIONS = [
  { value: 'admin', label: '管理员（爸妈）' },
  { value: 'recorder', label: '记录员（爷爷奶奶·姥姥姥爷）' },
  { value: 'readonly', label: '只读（亲友）' },
];

export function roleOf(role) {
  return ROLES[role] || ROLES.readonly;
}

export function canWrite(role) {
  return !!roleOf(role).write;
}
export function canManage(role) {
  return !!roleOf(role).manage;
}
// 删除：管理员可删任意；记录员仅可删自己；只读不可。
export function canDelete(role, record, memberId) {
  if (roleOf(role).deleteAny) return true;
  return record && record.operatorId === memberId;
}
// 编辑：管理员可编辑任意；记录员仅可编辑自己；只读不可。
export function canEdit(role, record, memberId) {
  if (role === 'admin') return true;
  return record && record.operatorId === memberId;
}
