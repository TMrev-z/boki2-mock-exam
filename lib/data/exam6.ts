import { Exam } from '../types/exam';

export const exam6: Exam = {
  id: 6,
  title: '第6回 模擬試験',
  description: '基礎確認（★☆☆難易度）- 株式会社会計、固定資産、工業簿記基礎',
  timeLimit: 90,
  questions: [
    {
      id: 1,
      category: '商業簿記',
      title: '第1問 株式の発行',
      scenario:
        '次の資料に基づいて、株式発行に関する問題に答えなさい。\n\n【資料】\n・株式発行数：200株\n・1株あたり発行価額：¥100,000\n・払込金額の全額を当座預金に受け入れた\n・資本金組入額：会社法が規定する最低限度額',
      totalPoints: 20,
      subQuestions: [
        {
          id: '1-1',
          question: '払込金額の総額を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 20000000,
          },
          explanation:
            '払込金額総額 = 200株 × ¥100,000 = ¥20,000,000',
          points: 5,
        },
        {
          id: '1-2',
          question: '資本金に組み入れる金額を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 10000000,
          },
          explanation:
            '資本金組入額 = 払込金額総額 × 1/2 = ¥20,000,000 × 1/2 = ¥10,000,000\n※会社法により、払込金額の1/2以上を資本金に組み入れる必要があります。',
          points: 8,
        },
        {
          id: '1-3',
          question: '資本準備金の金額を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 10000000,
          },
          explanation:
            '資本準備金 = 払込金額総額 - 資本金組入額 = ¥20,000,000 - ¥10,000,000 = ¥10,000,000',
          points: 7,
        },
      ],
    },
    {
      id: 2,
      category: '商業簿記',
      title: '第2問 固定資産の取得',
      scenario:
        '次の資料に基づいて、固定資産の取得に関する問題に答えなさい。\n\n【資料】\n・機械装置本体価格：¥8,000,000\n・引取運賃：¥150,000\n・据付費：¥250,000\n・試運転費：¥100,000\n・代金は小切手を振り出して支払った',
      totalPoints: 20,
      subQuestions: [
        {
          id: '2-1',
          question: '機械装置の取得原価を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 8500000,
          },
          explanation:
            '取得原価 = 本体価格 + 引取運賃 + 据付費 + 試運転費\n= ¥8,000,000 + ¥150,000 + ¥250,000 + ¥100,000 = ¥8,500,000\n※事業の用に供するために直接要した費用はすべて取得原価に含めます。',
          points: 20,
        },
      ],
    },
    {
      id: 3,
      category: '商業簿記',
      title: '第3問 減価償却費の計算',
      scenario:
        '次の資料に基づいて、減価償却費を計算しなさい。\n\n【資料】\n・車両運搬具：取得原価¥6,000,000\n・取得日：×1年4月1日\n・決算日：×2年3月31日（会計期間1年）\n・耐用年数：6年\n・残存価額：取得原価の10%\n・償却方法：定額法',
      totalPoints: 20,
      subQuestions: [
        {
          id: '3-1',
          question: '×2年3月期の減価償却費を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 900000,
          },
          explanation:
            '減価償却費 = （取得原価 - 残存価額）÷ 耐用年数\n= （¥6,000,000 - ¥600,000）÷ 6年\n= ¥5,400,000 ÷ 6年 = ¥900,000',
          points: 12,
        },
        {
          id: '3-2',
          question: '×2年3月期末の減価償却累計額を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 900000,
          },
          explanation:
            '減価償却累計額 = ¥900,000\n※取得日が×1年4月1日で決算日が×2年3月31日のため、1年分の償却となります。',
          points: 8,
        },
      ],
    },
    {
      id: 4,
      category: '工業簿記',
      title: '第4問 製造原価の分類',
      scenario:
        '次の資料に基づいて、製造原価の計算に関する問題に答えなさい。\n\n【資料】\n・直接材料費：¥5,000,000\n・間接材料費：¥800,000\n・直接労務費：¥3,500,000\n・間接労務費：¥1,200,000\n・その他製造経費：¥2,500,000',
      totalPoints: 20,
      subQuestions: [
        {
          id: '4-1',
          question: '製造間接費の合計を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 4500000,
          },
          explanation:
            '製造間接費 = 間接材料費 + 間接労務費 + その他製造経費\n= ¥800,000 + ¥1,200,000 + ¥2,500,000 = ¥4,500,000',
          points: 8,
        },
        {
          id: '4-2',
          question: '総製造費用を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 13000000,
          },
          explanation:
            '総製造費用 = 直接材料費 + 直接労務費 + 製造間接費\n= ¥5,000,000 + ¥3,500,000 + ¥4,500,000 = ¥13,000,000',
          points: 12,
        },
      ],
    },
    {
      id: 5,
      category: '工業簿記',
      title: '第5問 個別原価計算の基礎',
      scenario:
        '次の資料に基づいて、個別原価計算に関する問題に答えなさい。\n\n【資料】\n製造指図書No.201\n・直接材料費：¥800,000\n・直接労務費：¥600,000\n・製造間接費配賦率：直接労務費の150%',
      totalPoints: 20,
      subQuestions: [
        {
          id: '5-1',
          question: '製造間接費の配賦額を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 900000,
          },
          explanation:
            '製造間接費配賦額 = 直接労務費 × 配賦率\n= ¥600,000 × 150% = ¥900,000',
          points: 8,
        },
        {
          id: '5-2',
          question: '製造指図書No.201の製品原価を計算しなさい。',
          type: 'calculation',
          answer: {
            value: 2300000,
          },
          explanation:
            '製品原価 = 直接材料費 + 直接労務費 + 製造間接費\n= ¥800,000 + ¥600,000 + ¥900,000 = ¥2,300,000',
          points: 12,
        },
      ],
    },
  ],
};
