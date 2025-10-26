import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4 text-gray-800">
            簿記2級 ネット試験
          </h1>
          <h2 className="text-2xl text-center mb-12 text-gray-600">
            模擬試験システム
          </h2>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">試験について</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">⏱️</span>
                <span>試験時間: <strong>90分</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📝</span>
                <span>問題数: <strong>5問</strong>（商業簿記3問、工業簿記2問）</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💯</span>
                <span>合格点: <strong>70点以上</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>配点: 各問20点（合計100点）</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">試験の進め方</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>下記の「模擬試験を選択」ボタンから試験パターンを選びます</li>
              <li>「試験開始」ボタンを押すと90分のタイマーが開始されます</li>
              <li>全問題に回答後、「回答完了」ボタンを押してください</li>
              <li>採点結果と詳しい解説が表示されます</li>
            </ol>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Link
              href="/exams"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors shadow-lg"
            >
              模擬試験を選択
            </Link>

            <Link
              href="/history"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              過去の受験履歴を見る
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center py-8 text-gray-600 text-sm">
        <p>© 2025 簿記2級 ネット試験 模擬試験システム</p>
        <p className="mt-2">本試験の形式に準拠した模擬試験です</p>
      </footer>
    </div>
  );
}
