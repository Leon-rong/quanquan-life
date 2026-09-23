// 全局配置：连接到你的腾讯云 CloudBase 时改这里即可。
// USE_CLOUD=false 时走本地(localStorage)演示模式，无需任何账号即可完整试用。
// 调试/试用技巧：访问 index.html?demo=1 可强制本地演示模式（跳过云端初始化，避免离线环境控制台噪声）。
const _forceDemo = (typeof location !== 'undefined') && new URLSearchParams(location.search).has('demo');
export const CONFIG = {
  // 腾讯云 CloudBase 环境 ID（控制台「环境设置」里复制），留空则自动用本地演示模式。
  ENV_ID: 'quanquan-life-d2g1f5ayyae604fcd',
  // CloudBase Web SDK v2 所需的 Publishable Key（匿名登录/公开资源用，可在前端暴露）。
  // 如未配置，云端初始化会回退到本地演示模式。
  CLOUD_ACCESS_KEY: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL3F1YW5xdWFuLWxpZmUtZDJnMWY1YXl5YWU2MDRmY2QuYXAtc2hhbmdoYWkudGNiLWFwaS50ZW5jZW50Y2xvdWRhcGkuY29tIiwic3ViIjoiYW5vbiIsImF1ZCI6InF1YW5xdWFuLWxpZmUtZDJnMWY1YXl5YWU2MDRmY2QiLCJleHAiOjQwOTIxMDY4MDMsImlhdCI6MTc4ODQyMzYwMywibm9uY2UiOiJwZUlXbVNtc1RoeVdkQlhLaG1Kc0FnIiwiYXRfaGFzaCI6InBlSVdtU21zVGh5V2RCWEtobUpzQWciLCJuYW1lIjoiQW5vbnltb3VzIiwic2NvcGUiOiJhbm9ueW1vdXMiLCJwcm9qZWN0X2lkIjoicXVhbnF1YW4tbGlmZS1kMmcxZjVheXlhZTYwNGZjZCIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.Vj9aKbSV2ZHo-EH3lBbSuMyk9WLPq3gviFYp7Scn83BUeQrNbrsePZLrT5DvhZJSu58QuETvYpuHsie84bu7s41TRf77nqgIsdG9jqjEyRA3zDIkNJcr9z0B4C-MKnqtePohCEOEfiNyU5PENRWfpf-4Ku042q3c_zQvdbH71l8_lu4yqVXmtuxzwt57j9JXKb6ObJvqcdSYhME-mJbQ48S49lEWa9TIl6xpKcX9QPbLXFCdRvQV8tA9ZJN-0AR35P22NMt4VdDpXWgcls019vxBVMPiLQubbKy4QDX4FlODzTdk_mHx7mnex3K711yLZCewHSv4QLxuNWY25xB5qQ',
  // true=连接云端；false=本地演示。建议本地先跑通后再改为 true。?demo=1 可临时强制 false。
  USE_CLOUD: !_forceDemo,
  APP_NAME: '拳拳成长记录',
  // 用药重复拦截时间窗（分钟）：同药在该窗口内再次记录会弹确认。
  MEDICATION_WINDOW_MIN: 30,
  // 家庭成员上限（演示用，云端以安全规则为准）。
  MAX_MEMBERS: 20,
};
