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
      {
        "id": "v1c1",
        "num": "一",
        "title": "名字的重量",
        "subtitle": "The Weight of a Name",
        "date": "木ノ葉历 Y·19"
      },
      {
        "id": "v1c2",
        "num": "二",
        "title": "再见",
        "subtitle": "First Mission",
        "date": "木ノ葉历 Y·19 · 夏"
      },
      {
        "id": "v1c3",
        "num": "三",
        "title": "档案库的猫",
        "subtitle": "The Archive Cat",
        "date": "木ノ葉历 Y·20"
      },
      {
        "id": "v1c4",
        "num": "四",
        "title": "出发前夜",
        "subtitle": "On the Eve of Departure",
        "date": "木ノ葉历 Y·21 · 春"
      },
      {
        "id": "c1777581797299",
        "num": "新",
        "title": "新章节",
        "subtitle": "New Chapter",
        "date": "——"
      }
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
      {
        "id": "v3c1",
        "num": "一",
        "title": "汤面上的东西",
        "subtitle": "What Floats on the Soup",
        "date": "木ノ葉历 Y·28 · 春"
      },
      {
        "id": "v3c2",
        "num": "二",
        "title": "新的火影",
        "subtitle": "A New Hokage",
        "date": "木ノ葉历 Y·28 · 夏"
      },
      {
        "id": "v3c3",
        "num": "三",
        "title": "终末之谷",
        "subtitle": "Valley's End",
        "date": "木ノ葉历 Y·28 · 秋"
      }
    ]
  }
];

export default STORY_DATA;
