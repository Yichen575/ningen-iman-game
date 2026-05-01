export interface Chapter {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  date: string;
  pullQuote?: string;
}

export interface Volume {
  id: string;
  indexCh: string;
  indexJp: string;
  indexNum: string;
  title: string;
  titleEn: string;
  subtitle: string;
  blurb: string;
  accent: string;
  chapters: Chapter[];
}

const STORY_DATA: Volume[] = [
  {
    "id": "vol1",
    "indexCh": "第一部",
    "indexJp": "ボリューム壱",
    "indexNum": "01",
    "title": "殺す子って呼ぶな",
    "titleEn": "Don't Call Me Killer",
    "subtitle": "記事始まったら",
    "blurb": "隼人死的时候太年轻\n我没有办法怪任何人\n\n但他死得过早\n他给我的人生开了一个坏头\n我哭的时候会想起他\n笑的时候更会\n",
    "accent": "#ff6b1a",
    "chapters": [
      { "id": "v1c1",          "num": "一",     "title": "开端",             "subtitle": " ", "date": "——" },
      { "id": "v1c2",          "num": "二",     "title": "变化",             "subtitle": " ", "date": "——" },
      { "id": "v1c3",          "num": "三",     "title": "相遇",             "subtitle": " ", "date": "——" },
      { "id": "v1c4",          "num": "四",     "title": "哲学家阿伦",       "subtitle": " ", "date": "——" },
      { "id": "c1777581797299","num": "五",     "title": "分别",             "subtitle": " ", "date": "——" },
      { "id": "v1c6",          "num": "六",     "title": "爆头",             "subtitle": " ", "date": "——" },
      { "id": "v1c7",          "num": "七",     "title": "银毛",             "subtitle": " ", "date": "——" },
      { "id": "v1c8",          "num": "八",     "title": "古庙",             "subtitle": " ", "date": "——" },
      { "id": "v1c9",          "num": "九",     "title": "大蛇丸",           "subtitle": " ", "date": "——" },
      { "id": "v1c10",         "num": "十",     "title": "战斗",             "subtitle": " ", "date": "——" },
      { "id": "v1c11",         "num": "十一",   "title": "不再放下",         "subtitle": " ", "date": "——" },
      { "id": "v1c12",         "num": "十二",   "title": "空手接白刃",       "subtitle": " ", "date": "——" },
      { "id": "v1c13",         "num": "十三",   "title": "哲学家隼人",       "subtitle": " ", "date": "——" },
      { "id": "v1cex",         "num": "番外",   "title": "止水的番外之初遇", "subtitle": " ", "date": "——" },
      { "id": "v1c14",         "num": "十四",   "title": "任务继续",         "subtitle": " ", "date": "——" },
      { "id": "v1c15",         "num": "十五",   "title": "精神分裂",         "subtitle": " ", "date": "——" },
      { "id": "v1c16",         "num": "十六",   "title": "第十六章",         "subtitle": " ", "date": "——" },
      { "id": "v1c17",         "num": "十七",   "title": "疼痛和死亡",       "subtitle": " ", "date": "——" },
      { "id": "v1c18",         "num": "十八",   "title": "妹妹",             "subtitle": " ", "date": "——" },
      { "id": "v1c19",         "num": "十九",   "title": "女尸",             "subtitle": " ", "date": "——" },
      { "id": "v1c20",         "num": "二十",   "title": "热症",             "subtitle": " ", "date": "——" },
      { "id": "v1c21",         "num": "二十一", "title": "隼人之死",         "subtitle": " ", "date": "——" }
    ]
  },
  {
    "id": "vol2",
    "indexCh": "第二部",
    "indexJp": "ボリューム弐",
    "indexNum": "02",
    "title": "人間未満",
    "titleEn": "Not Yet Human",
    "subtitle": "「ここは人間....・・じゃないよ」 ",
    "blurb": "人間未滿 面对着亲友的尸体   \n\n这个时候，我才发现 原来这里不是人间啊   \n\n人生就是这样起起落落落落落落落落落落落落落落落落落落落落落落落落落落   \n\n被生命所嫌弃着的我 \n\n只求跌入谷底，一命呜呼\n",
    "accent": "#7fb069",
    "chapters": [
      {
        "id": "v2c1",
        "num": "序",
        "title": " ",
        "subtitle": "The Body in the Stacks",
        "date": "木ノ葉历 Y·27 · 4月17日"
      },
      {
        "id": "v2c2",
        "num": "一",
        "title": "第一章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 4月18日"
      },
      {
        "id": "v2c3",
        "num": "二",
        "title": "第二章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 4月20日"
      },
      {
        "id": "v2c4",
        "num": "三",
        "title": "第三章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 4月23日"
      },
      {
        "id": "v2c5",
        "num": "四",
        "title": "第四章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 5月7日"
      },
      {
        "id": "v2c6",
        "num": "五",
        "title": "第五章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 5月"
      },
      {
        "id": "v2c7",
        "num": "六",
        "title": "第六章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 6月"
      },
      {
        "id": "v2c8",
        "num": "七",
        "title": "第七章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 6月"
      },
      {
        "id": "v2c9",
        "num": "八",
        "title": "第八章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 7月"
      },
      {
        "id": "v2c10",
        "num": "九",
        "title": "第九章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 7月"
      },
      {
        "id": "v2c11",
        "num": "十",
        "title": "第十章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 8月"
      },
      {
        "id": "v2c12",
        "num": "十一",
        "title": "第十一章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 8月"
      },
      {
        "id": "v2c13",
        "num": "十二",
        "title": "第十二章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 9月"
      },
      {
        "id": "v2c14",
        "num": "十三",
        "title": "第十三章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 9月"
      },
      {
        "id": "v2c15",
        "num": "十四",
        "title": "第十四章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 10月"
      },
      {
        "id": "v2c16",
        "num": "十五",
        "title": "第十五章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 11月"
      },
      {
        "id": "v2c17",
        "num": "十六",
        "title": "第十六章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 11月"
      },
      {
        "id": "v2c18",
        "num": "十七",
        "title": "第十七章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 12月"
      },
      {
        "id": "v2c19",
        "num": "十八",
        "title": "第十八章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·27 · 12月"
      },
      {
        "id": "v2c20",
        "num": "十九",
        "title": "第十九章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 1月"
      },
      {
        "id": "v2c21",
        "num": "二十",
        "title": "第二十章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 1月"
      },
      {
        "id": "v2c22",
        "num": "二十一",
        "title": "第二十一章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 2月"
      },
      {
        "id": "v2c23",
        "num": "二十二",
        "title": "第二十二章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 2月"
      },
      {
        "id": "v2c24",
        "num": "二十三",
        "title": "第二十三章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 3月"
      },
      {
        "id": "v2c25",
        "num": "二十四",
        "title": "第二十四章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 3月"
      },
      {
        "id": "v2c26",
        "num": "二十五",
        "title": "第二十五章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 4月"
      },
      {
        "id": "v2c27",
        "num": "二十六",
        "title": "第二十六章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 4月"
      },
      {
        "id": "v2c28",
        "num": "二十七",
        "title": "第二十七章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 5月"
      },
      {
        "id": "v2c29",
        "num": "二十八",
        "title": "第二十八章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 5月"
      },
      {
        "id": "v2c30",
        "num": "二十九",
        "title": "第二十九章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 6月"
      },
      {
        "id": "v2c31",
        "num": "三十",
        "title": "第三十章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 6月"
      },
      {
        "id": "v2c32",
        "num": "三十一",
        "title": "第三十一章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 7月"
      },
      {
        "id": "v2c33",
        "num": "三十二",
        "title": "第三十二章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 7月"
      },
      {
        "id": "v2c34",
        "num": "三十三",
        "title": "第三十三章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 8月"
      },
      {
        "id": "v2c35",
        "num": "三十四",
        "title": "第三十四章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 8月"
      },
      {
        "id": "v2c36",
        "num": "三十五",
        "title": "第三十五章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 9月"
      },
      {
        "id": "v2c37",
        "num": "三十六",
        "title": "第三十六章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 9月"
      },
      {
        "id": "v2c38",
        "num": "三十七",
        "title": "第三十七章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 10月"
      },
      {
        "id": "v2c39",
        "num": "三十八",
        "title": "第三十八章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 10月"
      },
      {
        "id": "v2c40",
        "num": "三十九",
        "title": "第三十九章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 11月"
      },
      {
        "id": "v2c41",
        "num": "四十",
        "title": "第四十章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 11月"
      },
      {
        "id": "v2c42",
        "num": "四十一",
        "title": "第四十一章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·28 · 12月"
      },
      {
        "id": "v2c43",
        "num": "四十二",
        "title": "第四十二章",
        "subtitle": "",
        "date": "木ノ葉历 Y·28 · 12月"
      },
      {
        "id": "v2c44",
        "num": "四十三",
        "title": "第四十三章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 1月"
      },
      {
        "id": "v2c45",
        "num": "四十四",
        "title": "第四十四章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 1月"
      },
      {
        "id": "v2c46",
        "num": "四十五",
        "title": "第四十五章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 2月"
      },
      {
        "id": "v2c47",
        "num": "四十六",
        "title": "第四十六章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 2月"
      },
      {
        "id": "v2c48",
        "num": "四十七",
        "title": "第四十七章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 3月"
      },
      {
        "id": "v2c49",
        "num": "四十八",
        "title": "第四十八章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 3月"
      },
      {
        "id": "v2c50",
        "num": "四十九",
        "title": "第四十九章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 4月"
      },
      {
        "id": "v2c51",
        "num": "五十",
        "title": "第五十章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 4月"
      },
      {
        "id": "v2c52",
        "num": "五十一",
        "title": "第五十一章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 5月"
      },
      {
        "id": "v2c53",
        "num": "五十二",
        "title": "第五十二章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 5月"
      },
      {
        "id": "v2c54",
        "num": "五十三",
        "title": "第五十三章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 6月"
      },
      {
        "id": "v2c55",
        "num": "五十四",
        "title": "第五十四章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 6月"
      },
      {
        "id": "v2c56",
        "num": "五十五",
        "title": "第五十五章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 7月"
      },
      {
        "id": "v2c57",
        "num": "五十六",
        "title": "第五十六章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 7月"
      },
      {
        "id": "v2c58",
        "num": "五十七",
        "title": "第五十七章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 8月"
      },
      {
        "id": "v2c59",
        "num": "五十八",
        "title": "第五十八章",
        "subtitle": " ",
        "date": "木ノ葉历 Y·29 · 8月"
      },
      {
        "id": "v2c60",
        "num": "五十九",
        "title": "第五十九章",
        "subtitle": "完结篇",
        "date": "木ノ葉历 Y·29 · 9月"
      }
    ]
  },
  {
    "id": "vol3",
    "indexCh": "第三部",
    "indexJp": "ボリューム参",
    "indexNum": "03",
    "title": "浮屑が",
    "titleEn": "The Dregs",
    "subtitle": "我们都是浮渣",
    "blurb": "「如果我失去了一切记忆，一切你所熟悉的特征，那么我还是你所知的那个我吗？」\n\n再一次见面时，止水如此问我。\n我哑口无言。\n\n见我回答不上来，他露出了我以前从未见过的、狡黠的、疯狂的笑容，张开双臂：\n\n「……一个全新的我。」\n\n欢迎回到这个荒诞魔幻的世界，阿伦。\n\n",
    "accent": "#9f7fb8",
    "chapters": [
      { "id": "v3c1",  "num": "一",     "title": "第一章",   "subtitle": " ", "date": "——" },
      { "id": "v3c2",  "num": "二",     "title": "第二章",   "subtitle": " ", "date": "——" },
      { "id": "v3c3",  "num": "三",     "title": "第三章",   "subtitle": " ", "date": "——" },
      { "id": "v3c4",  "num": "四",     "title": "第四章",   "subtitle": " ", "date": "——" },
      { "id": "v3c5",  "num": "五",     "title": "第五章",   "subtitle": " ", "date": "——" },
      { "id": "v3c6",  "num": "六",     "title": "第六章",   "subtitle": " ", "date": "——" },
      { "id": "v3c7",  "num": "七",     "title": "第七章",   "subtitle": " ", "date": "——" },
      { "id": "v3c8x", "num": "八-X",   "title": "第八章·外传", "subtitle": " ", "date": "——" },
      { "id": "v3c8",  "num": "八",     "title": "第八章",   "subtitle": " ", "date": "——" },
      { "id": "v3c9",  "num": "九",     "title": "第九章",   "subtitle": " ", "date": "——" },
      { "id": "v3c10", "num": "十",     "title": "第十章",   "subtitle": " ", "date": "——" },
      { "id": "v3c11", "num": "十一",   "title": "第十一章", "subtitle": " ", "date": "——" },
      { "id": "v3c12", "num": "十二",   "title": "第十二章", "subtitle": " ", "date": "——" },
      { "id": "v3c13", "num": "十三",   "title": "第十三章", "subtitle": " ", "date": "——" },
      { "id": "v3c14", "num": "十四",   "title": "第十四章", "subtitle": " ", "date": "——" },
      { "id": "v3c15", "num": "十五",   "title": "第十五章", "subtitle": " ", "date": "——" },
      { "id": "v3c16", "num": "十六",   "title": "第十六章", "subtitle": " ", "date": "——" },
      { "id": "v3c17", "num": "十七",   "title": "第十七章", "subtitle": " ", "date": "——" },
      { "id": "v3c18", "num": "十八",   "title": "第十八章", "subtitle": " ", "date": "——" },
      { "id": "v3c19", "num": "十九",   "title": "第十九章", "subtitle": " ", "date": "——" },
      { "id": "v3c20", "num": "二十",   "title": "第二十章", "subtitle": " ", "date": "——" },
      { "id": "v3c21", "num": "二十一", "title": "第二十一章", "subtitle": " ", "date": "——" },
      { "id": "v3c22", "num": "二十二", "title": "第二十二章", "subtitle": " ", "date": "——" },
      { "id": "v3c23", "num": "二十三", "title": "第二十三章", "subtitle": " ", "date": "——" },
      { "id": "v3c24", "num": "二十四", "title": "第二十四章", "subtitle": " ", "date": "——" },
      { "id": "v3c25", "num": "二十五", "title": "第二十五章", "subtitle": " ", "date": "——" },
      { "id": "v3c26", "num": "二十六", "title": "第二十六章", "subtitle": " ", "date": "——" },
      { "id": "v3c27", "num": "二十七", "title": "第二十七章", "subtitle": " ", "date": "——" },
      { "id": "v3c28", "num": "二十八", "title": "第二十八章", "subtitle": " ", "date": "——" },
      { "id": "v3c29", "num": "二十九", "title": "第二十九章", "subtitle": " ", "date": "——" }
    ]
  }
];

export default STORY_DATA;
