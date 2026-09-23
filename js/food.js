// 常见食材清单：用于「吃 / 辅食打卡」多选。分组展示，可在成员管理里由管理员追加。
// 格式与 data/food-list.json 保持一致，云端种子数据从该 JSON 导入。
export const FOOD_CATEGORIES = [
  {
    group: '主食·谷物',
    items: ['米粉', '大米粥', '小米粥', '燕麦粥', '面条', '馒头', '软米饭', '土豆泥', '红薯', '紫薯', '南瓜泥', '山药泥', '玉米糊', '全麦面包'],
  },
  {
    group: '蛋白质',
    items: ['鸡蛋', '鸡肉', '猪肉', '牛肉', '羊肉', '鳕鱼', '三文鱼', '虾', '豆腐', '豆干', '无糖酸奶', '奶酪'],
  },
  {
    group: '蔬果',
    items: ['苹果泥', '香蕉', '梨', '橙子', '猕猴桃', '草莓', '蓝莓', '葡萄', '胡萝卜', '西兰花', '西红柿', '青菜', '菠菜', '冬瓜', '西葫芦', '牛油果'],
  },
  {
    group: '油脂·补剂',
    items: ['核桃油', '亚麻籽油', '黑芝麻酱', '猪肝泥', '红枣泥', '高铁米粉'],
  },
];

// 拍平为 [{name, group}]，便于查重与存储。
export function flatFoods() {
  const out = [];
  for (const c of FOOD_CATEGORIES) for (const n of c.items) out.push({ name: n, group: c.group });
  return out;
}

export function findFood(name) {
  return flatFoods().find((f) => f.name === name) || { name, group: '自定义' };
}
