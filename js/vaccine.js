// 天津市儿童免疫规划疫苗参考（依据天津市免疫规划 + 2025版国家免疫规划程序）。
// 用于「体测 / 疫苗」模块快速选择。记录时可自定义名称与接种日期。
// month 为「建议接种月龄」参考，实际以接种本为准；positive 为可预防疾病。
export const VACCINES = [
  { name: '卡介苗',        month: '出生',   positive: '结核性脑膜炎、粟粒性肺结核' },
  { name: '乙肝疫苗(第1剂)', month: '出生',   positive: '乙型病毒性肝炎' },
  { name: '乙肝疫苗(第2剂)', month: '1月龄',  positive: '乙型病毒性肝炎' },
  { name: '脊灰灭活疫苗(IPV)', month: '2、3月龄', positive: '脊髓灰质炎' },
  { name: '百白破疫苗(第1剂)', month: '2月龄', positive: '白喉、百日咳、破伤风' },
  { name: '百白破疫苗(第2剂)', month: '4月龄', positive: '白喉、百日咳、破伤风' },
  { name: '脊灰减毒活疫苗(bOPV)', month: '4月龄', positive: '脊髓灰质炎' },
  { name: '百白破疫苗(第3剂)', month: '6月龄', positive: '白喉、百日咳、破伤风' },
  { name: '乙肝疫苗(第3剂)', month: '6月龄', positive: '乙型病毒性肝炎' },
  { name: 'A群流脑多糖疫苗(第1剂)', month: '6月龄', positive: 'A群流行性脑脊髓膜炎' },
  { name: '麻腮风疫苗(第1剂)', month: '8月龄', positive: '麻疹、风疹、流行性腮腺炎' },
  { name: '乙脑减毒活疫苗(第1剂)', month: '8月龄', positive: '流行性乙型脑炎' },
  { name: 'A群流脑多糖疫苗(第2剂)', month: '9月龄', positive: 'A群流行性脑脊髓膜炎' },
  { name: '水痘减毒活疫苗(第1剂)', month: '12月龄', positive: '水痘' },
  { name: '百白破疫苗(第4剂)', month: '18月龄', positive: '白喉、百日咳、破伤风' },
  { name: '麻腮风疫苗(第2剂)', month: '18月龄', positive: '麻疹、风疹、流行性腮腺炎' },
  { name: '甲肝灭活疫苗(第1剂)', month: '18月龄', positive: '甲型病毒性肝炎' },
  { name: '乙脑减毒活疫苗(第2剂)', month: '2岁', positive: '流行性乙型脑炎' },
  { name: '甲肝灭活疫苗(第2剂)', month: '2岁', positive: '甲型病毒性肝炎' },
  { name: 'A+C群流脑多糖疫苗(第1剂)', month: '3岁', positive: 'A群、C群流行性脑脊髓膜炎' },
  { name: '脊灰减毒活疫苗(bOPV)', month: '4岁', positive: '脊髓灰质炎' },
  { name: '水痘减毒活疫苗(第2剂)', month: '4岁', positive: '水痘' },
  { name: '百白破疫苗(第5剂/白破)', month: '6岁', positive: '白喉、破伤风' },
  { name: 'A+C群流脑多糖疫苗(第2剂)', month: '6岁', positive: 'A群、C群流行性脑脊髓膜炎' },
];

// 拍平名称列表，便于下拉/选择。
export function vaccineNames() {
  return VACCINES.map((v) => v.name);
}
