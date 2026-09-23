// 育儿科普政策库：与 0–7 岁（拳拳）成长记录相关的官方政策法规。
// 来源均为国家卫健委等官方发布（官网/中国政府网），用于「科普」板块展示，
// 并作为「智能分析」的官方参考范围（policyInsights）。
// importance 越小越重要（1 = 最核心）。

export const POLICY_CATEGORIES = [
  { key: 'growth',      label: '体格生长', color: '#4DB6C4' },
  { key: 'vaccine',     label: '疫苗接种', color: '#5B9BF0' },
  { key: 'feeding',     label: '喂养营养', color: '#6FCF97' },
  { key: 'care',        label: '日常养育', color: '#FFB84D' },
  { key: 'dev',         label: '发育行为', color: '#D98AD9' },
  { key: 'oral',        label: '口腔牙齿', color: '#4DB6E8' },
  { key: 'obesity',     label: '体重肥胖', color: '#FF8A5B' },
  { key: 'vision',      label: '眼与近视', color: '#FF8FB6' },
  { key: 'newborn',     label: '新生儿筛查', color: '#FFC93C' },
  { key: 'overview',    label: '综合纲领', color: '#5FCB7E' },
  { key: 'institution', label: '托育机构', color: '#9B8CFF' },
  { key: 'medication',  label: '用药安全', color: '#FF6B6B' },
  { key: 'subsidy',     label: '育儿补贴', color: '#7FD1C9' },
];

export const POLICIES = [
  {
    id: 'growth-standard',
    title: '《7岁以下儿童生长标准》WS/T 423—2022',
    issuer: '国家卫生健康委',
    date: '2022-09-19 发布 / 2023-03-01 施行',
    docNo: '国卫通〔2022〕8号',
    ageRange: '0–7 岁',
    category: 'growth',
    module: '体测 / 智能分析',
    tags: ['生长标准', '身高', '体重', '头围', 'BMI', '百分位', '标准差'],
    importance: 1, embedded: true,
    summary: '国家卫健委发布的推荐性卫生行业标准，替代旧版。规定 0–7 岁儿童身高/体重/头围/BMI 的百分位与标准差数值，用于评价发育等级（上/中上/中/中下/下）与营养状况（生长迟缓/低体重/消瘦/超重/肥胖）。',
    keyPoints: [
      '体测模块与智能分析的根标准：对照百分位判断发育水平',
      '涵盖年龄别体重、身长/身高、头围、BMI 五项指标',
      '营养状况评价：生长迟缓、低体重、消瘦、超重、肥胖',
    ],
    link: 'https://www.nhc.gov.cn/fzs/c100048/202211/5001d7cf57774770a1d49c1df46a291f.shtml',
  },
  {
    id: 'vaccine-program',
    title: '国家免疫规划疫苗儿童免疫程序（2025 版）',
    issuer: '国家疾控局 / 国家卫生健康委等',
    date: '2025-01-01 起施行',
    docNo: '国疾控卫免发〔2024〕20号',
    ageRange: '0–6 岁及以上',
    category: 'vaccine',
    module: '疫苗',
    tags: ['疫苗', '免疫规划', '百白破', '乙肝', '麻腮风', '接种程序'],
    importance: 2,
    summary: '国家免疫规划疫苗儿童免疫程序。2025-01-01 起百白破疫苗调整为 2/4/6/18 月龄 + 6 岁接种，并同步调整麻腮风、乙脑等程序。拳拳「疫苗」模块依据此程序（天津标准亦据此）。',
    keyPoints: [
      '0–6 岁常规接种：乙肝、卡介苗、脊灰、百白破、麻腮风、乙脑、流脑、甲肝等',
      '2025 新程序：百白破 2/4/6/18 月龄 + 6 岁',
      '对照接种本核实是否漏种',
    ],
    link: 'https://big5.www.gov.cn/gate/big5/www.gov.cn/zhengce/202412/content_6994726.htm',
  },
  {
    id: 'feeding-assess',
    title: '《婴幼儿营养喂养评估服务指南（试行）》',
    issuer: '国家卫生健康委',
    date: '2025-02 印发',
    docNo: '国卫妇幼相关',
    ageRange: '0–3 岁',
    category: 'feeding',
    module: '吃 / 喝',
    tags: ['喂养评估', '母乳', '辅食', '贫血', '肥胖', '饮奶'],
    importance: 3, embedded: true,
    summary: '国家卫健委 2025 年印发，适用 0–3 岁。指导母乳喂养、辅食添加、合理膳食与饮食行为培养，降低贫血与肥胖风险。',
    keyPoints: [
      '0–6 月提倡纯母乳喂养（每日 8–10 次或以上）',
      '6–24 月龄每日辅食 ≥4 类食物，必含富铁动物性食物',
      '24–36 月龄每日饮奶 400–600ml，培养自主进食',
    ],
    link: 'https://www.nhc.gov.cn/fys/c100077/202502/0f2389db75b04c98b5a0118174e1f1f4.shtml',
  },
  {
    id: 'complementary-feeding',
    title: '《婴幼儿辅食添加营养指南》WS/T 678—2020',
    issuer: '国家卫生健康委',
    date: '2020-05-06 发布 / 2020-11-01 施行',
    docNo: '卫生行业标准',
    ageRange: '满 6–24 月龄',
    category: 'feeding',
    module: '吃（辅食）',
    tags: ['辅食', '添辅食', '顺应喂养', '富铁', '过敏观察'],
    importance: 4, embedded: true,
    summary: '卫生行业标准，规定满 6–24 月龄辅食添加的基本原则、分年龄段指导与制作要求，强调顺应喂养与食品安全。',
    keyPoints: [
      '满 6 月龄、健康时开始添辅食，继续母乳至 2 岁及以上',
      '由单一到多样，每新食物适应 3–5 天观察过敏',
      '由稀到稠、细到粗；患病期间暂停新辅食',
    ],
    link: 'https://www.nhc.gov.cn/fzs/c100048/202005/69a4ae35ff314ebbb34d281196a6dc87/files/1733125339160_47351.pdf',
  },
  {
    id: 'caregiving',
    title: '《3岁以下婴幼儿健康养育照护指南（试行）》',
    issuer: '国家卫生健康委办公厅',
    date: '2022-11-19 印发',
    docNo: '国卫办妇幼函〔2022〕409号',
    ageRange: '0–3 岁',
    category: 'care',
    module: '日常',
    tags: ['养育照护', '睡眠', '生活照护', '伤害预防', '玩耍'],
    importance: 5,
    summary: '国卫办妇幼函〔2022〕409号，覆盖生长发育监测、营养与喂养、交流与玩耍、生活照护、伤害预防、常见健康问题。',
    keyPoints: [
      '养育人（父母）是婴幼儿健康第一责任人',
      '涵盖喂养、睡眠、生活照护、伤害预防',
      '促进体格、认知、心理、情感、社会适应全面发展',
    ],
    link: 'https://www.nhc.gov.cn/wjw/c100378/202211/72dfcfd2eb7d43288069c28e2539b29f.shtml',
  },
  {
    id: 'breastfeeding',
    title: '《母乳喂养促进行动计划（2021—2025年）》',
    issuer: '国家卫生健康委等十五部门',
    date: '2021-11-15 印发',
    docNo: '国卫妇幼发〔2021〕38号',
    ageRange: '0–2 岁+',
    category: 'feeding',
    module: '吃',
    tags: ['母乳喂养', '母乳', '母婴设施', '产假'],
    importance: 6,
    summary: '十五部门联合印发。到 2025 年全国 6 个月内纯母乳喂养率达 50% 以上，公共场所母婴设施配置率 80% 以上。',
    keyPoints: [
      '母乳是 0–6 月婴儿最理想天然食物',
      '保护哺乳期女职工权益，禁止母乳代用品误导广告',
      '推动“云上妇幼”母乳喂养咨询指导',
    ],
    link: 'https://www.gov.cn/zhengce/zhengceku/2021-11/24/content_5653169.htm',
  },
  {
    id: 'autism-screen',
    title: '《0~6岁儿童孤独症筛查干预服务规范（试行）》',
    issuer: '国家卫生健康委办公厅',
    date: '2022-08-23 印发',
    docNo: '国卫办妇幼发〔2022〕12号',
    ageRange: '0–6 岁',
    category: 'dev',
    module: '发育行为',
    tags: ['孤独症', '自闭症', '早筛', '预警征象', '发育'],
    importance: 7, embedded: true,
    summary: '聚焦 0–6 岁，初筛 11 次，强调早筛查、早诊断、早干预，最佳干预期为 6 岁前。',
    keyPoints: [
      '初筛：1 岁内 4 次（3/6/8/12 月）、1–3 岁 4 次、学龄前 3 次',
      '预警征象：3 月对声音无反应、6 月不会抓物、4 岁不会说带形容词句子',
      '初筛异常→县级复筛→专业诊断康复',
    ],
    link: 'http://www.nhc.gov.cn/fys/s3586/202209/238ff30549e3487e81f0968cfe9f6d6a.shtml',
  },
  {
    id: 'oral-health',
    title: '《健康口腔行动方案（2019—2025年）》',
    issuer: '国家卫生健康委',
    date: '2019-02-15 印发',
    docNo: '国卫办疾控',
    ageRange: '全生命周期（含 0–6 岁）',
    category: 'oral',
    module: '牙齿',
    tags: ['口腔', '牙齿', '龋齿', '含氟牙膏', '减糖'],
    importance: 8,
    summary: '将口腔健康纳入全生命周期。强调生命早期 1000 天口腔保健、儿童龋病预防（窝沟封闭、局部用氟）、减糖专项行动。',
    keyPoints: [
      '家长是儿童口腔健康第一责任人',
      '帮婴幼儿刷牙、使用含氟牙膏、减少高糖零食饮料',
      '12 岁儿童患龋率控制在 30% 以内',
    ],
    link: 'https://health.people.com.cn/n1/2019/0215/c14739-30691149.html',
  },
  {
    id: 'obesity-prevention',
    title: '《儿童青少年肥胖防控实施方案》',
    issuer: '国家卫生健康委等六部门',
    date: '2020-10-16 印发',
    docNo: '国卫办疾控发〔2020〕16号',
    ageRange: '0–18 岁',
    category: 'obesity',
    module: '体重 / 吃',
    tags: ['肥胖', '超重', '吃动平衡', '运动', '屏幕时间'],
    importance: 9,
    summary: '以吃动平衡为重点，遏制 0–18 岁超重肥胖快速上升。强化家庭、学校、医疗卫生机构、政府四方责任。',
    keyPoints: [
      '父母是儿童健康第一责任人，培养科学饮食与运动习惯',
      '幼儿园每日户外 ≥2 小时（其中活动 ≥1 小时）',
      '定期测身高体重，对照标准评价生长发育',
    ],
    link: 'https://www.nhc.gov.cn/jkj/c100062/202010/e5a29f16f0c04b4ca70b0b78ac5feb40.shtml',
  },
  {
    id: 'child-health-management',
    title: '0~6岁儿童健康管理服务规范（第三版）',
    issuer: '国家卫生健康委（基本公共卫生服务）',
    date: '国家基本公共卫生服务规范（第三版）',
    docNo: '基本公卫',
    ageRange: '0–6 岁',
    category: 'growth',
    module: '体测 / 疫苗随访',
    tags: ['健康管理', '随访', '血常规', '听力筛查', '基层'],
    importance: 10, embedded: true,
    summary: '规定新生儿访视，满月及 3/6/8/12/18/24/30/36 月龄随访，4–6 岁每年一次健康管理。基层机构免费提供。',
    keyPoints: [
      '0–6 岁免费健康检查（基层医疗卫生机构）',
      '随访含体格、心理行为发育评估、血常规/听力筛查',
      '拳拳「体测」模块的随访频次依据',
    ],
    link: 'https://www.sm.gov.cn/msfwtp/yysy/ysyy/etjkfw/202309/t20230927_1958745.htm',
  },
  {
    id: 'myopia-prevention',
    title: '综合防控儿童青少年近视 + 近视防治指南（2026版）',
    issuer: '教育部等八部门 / 国家卫生健康委',
    date: '2018-08-30 方案 / 2026-07 指南',
    docNo: '教体艺〔2018〕3号 / 国卫办医政函〔2026〕237号',
    ageRange: '0–18 岁（0–6 为视觉发育关键期）',
    category: 'vision',
    module: '眼',
    tags: ['近视', '眼保健', '户外', '屏幕', '远视储备'],
    importance: 11,
    summary: '八部门《综合防控儿童青少年近视实施方案》与《近视防治指南（2026年版）》。0–6 岁是视觉发育关键期，需早监测早干预。',
    keyPoints: [
      '0–6 岁每年眼保健和视力检查覆盖率 ≥90%',
      '2026 指南：每日白天户外累计 ≥2 小时、单次用眼 ≤30–40 分钟',
      '3 岁视力正常下限 0.5，4–5 岁 0.6，6 岁 ≥0.7',
    ],
    link: 'https://www.moe.gov.cn/srcsite/A17/moe_943/s3285/201808/t20180830_346672.html',
  },
  {
    id: 'newborn-screening',
    title: '《新生儿疾病筛查管理办法》',
    issuer: '原卫生部',
    date: '2009-02-16 发布 / 2009-06-01 施行',
    docNo: '卫生部令第 64 号',
    ageRange: '新生儿期',
    category: 'newborn',
    module: '新生儿',
    tags: ['新生儿', '筛查', '遗传代谢病', '听力', 'PKU'],
    importance: 12,
    summary: '对新生儿期严重危害健康的先天性、遗传性疾病专项检查，早诊断早治疗，是提高出生人口素质的预防措施。',
    keyPoints: [
      '全国病种：先天性甲状腺功能减低症、苯丙酮尿症等遗传代谢病 + 听力障碍',
      '程序：血片采集→送检→检测→确诊→治疗（遵循知情同意）',
      '出生 72 小时充分哺乳后采血',
    ],
    link: 'https://big5.www.gov.cn/gate/big5/www.gov.cn/zhengce/2009-02/16/content_5713787.htm',
  },
  {
    id: 'healthy-child-plan',
    title: '《健康儿童行动提升计划（2021—2025年）》',
    issuer: '国家卫生健康委',
    date: '2021-10-29 印发',
    docNo: '国卫妇幼发〔2021〕33号',
    ageRange: '0–7 岁',
    category: 'overview',
    module: '综合',
    tags: ['健康儿童', '纲领', '眼保健', '口腔', '免疫规划'],
    importance: 13,
    summary: '顶层纲领，统筹新生儿安全、出生缺陷、儿童保健、早期发展、中医药、智慧服务等七大行动。拳拳各模块的政策总纲。',
    keyPoints: [
      '目标：7 岁以下儿童健康管理率 ≥90%，纯母乳 ≥50%',
      '覆盖体格监测、营养喂养、心理行为、眼保健、口腔、免疫规划',
      '拳拳功能规划的总依据',
    ],
    link: 'https://www.gov.cn/zhengce/zhengceku/2021-11/05/content_5649019.htm',
  },
  {
    id: 'tcm-child',
    title: '0~36个月儿童中医药健康管理服务',
    issuer: '国家卫生健康委 / 国家中医药局',
    date: '国家基本公共卫生服务项目',
    docNo: '中医药健康管理服务规范',
    ageRange: '0–36 月龄',
    category: 'care',
    module: '日常',
    tags: ['中医', '推拿', '捏脊', '摩腹', '治未病'],
    importance: 14,
    summary: '在 6/12/18…36 月龄提供中医饮食起居指导与推拿（摩腹、捏脊、按揉穴位），体现“治未病”。',
    keyPoints: [
      '中医饮食调养、起居活动指导',
      '6/12 月教摩腹、捏脊；18/24 月按揉迎香、足三里；30/36 月按揉四神聪',
      '增强体质、少生病',
    ],
    link: 'https://wjj.huizhou.gov.cn/publicfiles/business/htmlfiles/hzwsj/cmsmedia/document/2013/8/doc51396.pdf',
  },
  {
    id: 'childcare-institution',
    title: '《托育机构设置标准（试行）》和《管理规范（试行）》',
    issuer: '国家卫生健康委',
    date: '2019-10-08 印发',
    docNo: '国卫人口发〔2019〕58号',
    ageRange: '0–3 岁（托育）',
    category: 'institution',
    module: '托育',
    tags: ['托育', '设置标准', '师生比', '户外活动'],
    importance: 15,
    summary: '规范 3 岁以下婴幼儿托育服务的设置、人员、收托、保育、健康与安全管理。',
    keyPoints: [
      '班型：乳儿班(6–12月)、托小班、托大班(24–36月)',
      '保育人员与婴幼儿比例：乳儿班 1:3、托小班 1:5、托大班 1:7',
      '每日户外 ≥2 小时；膳食平衡、顺应喂养',
    ],
    link: 'https://www.nhc.gov.cn/rkjcyjtfzs/c100148/201910/59d0571f0f3e4aa98d099ad32ef968d5.shtml',
  },
  {
    id: 'child-medication',
    title: '《关于改革完善儿童用药供应保障机制的实施意见》',
    issuer: '国家卫生健康委等',
    date: '2026-05 印发',
    docNo: '改革完善儿童用药',
    ageRange: '全龄（含婴幼儿）',
    category: 'medication',
    module: '用药',
    tags: ['儿童用药', '安全', '剂量', '供应保障'],
    importance: 16,
    summary: '提升儿童用药可及性与安全性，完善儿童药品供应、审评、使用与监测。',
    keyPoints: [
      '鼓励儿童用药品、适宜剂型与罕见病专用药研发',
      '拳拳「用药」记录请遵医嘱、核对剂量与年龄',
      '用药重复拦截，避免误服',
    ],
    link: 'https://www.nhc.gov.cn/yaozs/c100097/202605/a4c994477c0f41928511654a1873b5e6.shtml',
  },
  {
    id: 'parenting-subsidy',
    title: '延长 2022—2024 年出生婴幼儿首次育儿补贴申请',
    issuer: '国家卫生健康委',
    date: '2026-07-21 发布',
    docNo: '育儿补贴政策',
    ageRange: '2022–2024 年出生婴幼儿',
    category: 'subsidy',
    module: '补贴',
    tags: ['育儿补贴', '申领', '政策红利'],
    importance: 17,
    summary: '《关于延长 2022—2024 年出生婴幼儿首次育儿补贴申请截止时间的通知》，延长首次育儿补贴申请时限，便利家庭申领。',
    keyPoints: [
      '适用 2022–2024 年出生婴幼儿的首次育儿补贴',
      '关注当地申领渠道与截止时间',
      '政策红利，记得及时申请',
    ],
    link: 'https://www.nhc.gov.cn/rkjcyjtfzs/c100147/202607/981a0cc093a541129984334050cf8363.shtml',
  },
];

// 根据已记录的数据，返回对照官方政策的标准化分析提示（接入智能分析参考范围）。
export function policyInsights(ctx) {
  const out = [];
  const { measures = [], feeds = [], drinks = [], sleeps = [], poops = [], vaccines = [] } = ctx || {};

  if (measures.length >= 1) {
    out.push('📏 体测数据建议对照《7岁以下儿童生长标准》(WS/T 423—2022) 评估身高/体重/头围的百分位与营养状况（生长迟缓/低体重/超重/肥胖），这是「体测」模块的国家依据。');
  }
  const compFeeds = feeds.filter((f) => f.value && f.value.kind === '辅食');
  if (compFeeds.length) {
    const allFoods = new Set();
    compFeeds.forEach((f) => (f.value.foods || []).forEach((n) => allFoods.add(n)));
    if (allFoods.size >= 4) {
      out.push(`🥣 已尝试 ${allFoods.size} 种辅食，符合《婴幼儿辅食添加营养指南》"每日摄入 ≥4 类食物"的建议，注意包含富铁食物。`);
    } else {
      out.push(`🥣 辅食种类较少（${allFoods.size} 种）。《婴幼儿辅食添加营养指南》建议每日摄入七类常见食物中的 ≥4 类，并注意补充富铁食物（肉泥/肝泥/高铁米粉）。`);
    }
  }
  if (drinks.length) {
    out.push('💧 24–36 月龄幼儿每日饮奶建议 400–600ml（《婴幼儿营养喂养评估服务指南》）；6 月龄内提倡纯母乳喂养。');
  }
  if (measures.length >= 1 && feeds.length) {
    out.push('⚖️ 预防超重肥胖：学龄前儿童每日不同强度身体活动 ≥180 分钟、中高强度 ≥60 分钟，屏幕时间尽量 <1 小时（《健康儿童行动提升计划》）。');
  }
  if (measures.length || feeds.length) {
    out.push('👀 0–6 岁应接受眼保健和视力检查（"启明行动"，覆盖率 ≥90%）；2026 版《近视防治指南》建议每日白天户外累计 ≥2 小时、单次持续用眼 ≤30–40 分钟。');
  }
  if (vaccines.length) {
    out.push('💉 疫苗对照《国家免疫规划疫苗儿童免疫程序(2025版)》：百白破已调整为 2/4/6/18 月龄 + 6 岁；如有漏种可结合接种本核对。');
  }
  out.push('🦷 口腔健康：家长帮婴幼儿刷牙、使用含氟牙膏、减少高糖零食饮料（《健康口腔行动方案》），乳牙龋也影响全身健康。');
  return out;
}
