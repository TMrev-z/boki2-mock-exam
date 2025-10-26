'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ExamResult } from '@/lib/types/exam';

export default function HistoryPage() {
  const [history, setHistory] = useState<ExamResult[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('examHistory');
    if (savedHistory) {
      const parsedHistory: ExamResult[] = JSON.parse(savedHistory);
      // 新しい順にソート
      parsedHistory.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setHistory(parsedHistory);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  const clearHistory = () => {
    if (confirm('履歴を全て削除してもよろしいですか？')) {
      localStorage.removeItem('examHistory');
      setHistory([]);
    }
  };

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

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">受験履歴</h1>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                履歴をクリア
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-xl text-gray-600 mb-6">
                まだ受験履歴がありません
              </p>
              <Link
                href="/exams"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                模擬試験を受ける
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((result, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        第{result.examId}回 模擬試験
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>受験日時: {formatDate(result.date)}</p>
                        <p>回答時間: {formatTime(result.timeSpent)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-4xl font-bold mb-1 ${
                          result.score >= 70
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {result.score}点
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          result.score >= 70
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {result.score >= 70 ? '合格' : '不合格'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  統計情報
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {history.length}
                    </div>
                    <div className="text-sm text-gray-600">受験回数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {history.filter((h) => h.score >= 70).length}
                    </div>
                    <div className="text-sm text-gray-600">合格回数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">
                      {Math.round(
                        history.reduce((sum, h) => sum + h.score, 0) /
                          history.length
                      )}
                    </div>
                    <div className="text-sm text-gray-600">平均点</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.max(...history.map((h) => h.score))}
                    </div>
                    <div className="text-sm text-gray-600">最高点</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
