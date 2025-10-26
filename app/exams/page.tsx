import Link from 'next/link';

const examPatterns = [
  {
    id: 1,
    title: '第1回 模擬試験',
    description: '基礎的な問題を中心に構成。株式会社会計、固定資産、個別原価計算など',
    difficulty: '★★☆',
  },
  {
    id: 2,
    title: '第2回 模擬試験',
    description: '本試験レベル。連結会計、リース取引、標準原価計算など',
    difficulty: '★★★',
  },
  {
    id: 3,
    title: '第3回 模擬試験',
    description: '頻出論点重視。引当金、税金、部門別原価計算など',
    difficulty: '★★☆',
  },
  {
    id: 4,
    title: '第4回 模擬試験',
    description: '応用問題多め。外貨建取引、本支店会計、CVP分析など',
    difficulty: '★★★',
  },
  {
    id: 5,
    title: '第5回 模擬試験',
    description: '総合問題。財務諸表作成、総合原価計算など',
    difficulty: '★★★',
  },
  {
    id: 6,
    title: '第6回 模擬試験',
    description: '基礎固め。株式会社会計、固定資産、工業簿記基礎など',
    difficulty: '★☆☆',
  },
  {
    id: 7,
    title: '第7回 模擬試験',
    description: '実践レベル。決算整理、連結会計、標準原価計算など',
    difficulty: '★★★',
  },
  {
    id: 8,
    title: '第8回 模擬試験',
    description: 'バランス重視。商業簿記・工業簿記を均等に出題',
    difficulty: '★★☆',
  },
  {
    id: 9,
    title: '第9回 模擬試験',
    description: '応用力強化。複雑な仕訳、原価計算の総合問題など',
    difficulty: '★★★',
  },
  {
    id: 10,
    title: '第10回 模擬試験',
    description: '最終確認。本試験を想定した総合的な出題',
    difficulty: '★★★',
  },
];

export default function ExamsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
            >
              ← トップページに戻る
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
            模擬試験を選択
          </h1>
          <p className="text-center text-gray-600 mb-12">
            受験したい模擬試験を選んでください
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {examPatterns.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {exam.title}
                  </h3>
                  <span className="text-sm text-gray-600 whitespace-nowrap ml-2">
                    難易度: {exam.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {exam.description}
                </p>
                <Link
                  href={`/exam/${exam.id}`}
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  この試験を受ける
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
