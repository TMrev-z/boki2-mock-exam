'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getExamById } from '@/lib/data/exams';
import { Exam, UserAnswer, ExamResult } from '@/lib/types/exam';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.id as string);

  const [exam, setExam] = useState<Exam | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0); // 秒
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const examData = getExamById(examId);
    if (examData) {
      setExam(examData);
      setTimeLeft(examData.timeLimit * 60); // 分を秒に変換
    }
  }, [examId]);

  useEffect(() => {
    if (!isStarted || isFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isFinished, timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleAnswerChange = (subQuestionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [subQuestionId]: value,
    }));
  };

  const handleSubmit = () => {
    if (!exam) return;

    // 採点処理（簡易版：計算問題のみ対応）
    let totalScore = 0;
    exam.questions.forEach((question) => {
      question.subQuestions.forEach((subQ) => {
        const userAnswer = answers[subQ.id];
        if (subQ.type === 'calculation') {
          const correctAnswer = (subQ.answer as any).value;
          const userValue = parseFloat(userAnswer);
          if (userValue === correctAnswer) {
            totalScore += subQ.points;
          }
        }
      });
    });

    const examResult: ExamResult = {
      examId: exam.id,
      date: new Date().toISOString(),
      score: totalScore,
      answers: [],
      timeSpent: (exam.timeLimit * 60) - timeLeft,
    };

    setResult(examResult);
    setIsFinished(true);

    // LocalStorageに保存
    const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    history.push(examResult);
    localStorage.setItem('examHistory', JSON.stringify(history));
  };

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">試験が見つかりません</p>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                {exam.title}
              </h1>
              <div className="space-y-4 mb-8">
                <p className="text-gray-700">
                  <strong>試験時間:</strong> {exam.timeLimit}分
                </p>
                <p className="text-gray-700">
                  <strong>問題数:</strong> {exam.questions.length}問
                </p>
                <p className="text-gray-700">
                  <strong>合格点:</strong> 70点以上
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
                <p className="text-sm text-gray-700">
                  ⚠️ 「試験開始」ボタンを押すと、タイマーが開始されます。
                  <br />
                  途中で中断することはできませんので、ご注意ください。
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/exams')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  試験開始
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished && result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                試験結果
              </h1>
              <div className="text-center mb-8">
                <div className="text-6xl font-bold mb-4">
                  <span
                    className={
                      result.score >= 70 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {result.score}点
                  </span>
                </div>
                <p className="text-2xl font-semibold mb-2">
                  {result.score >= 70 ? '🎉 合格です！' : '不合格'}
                </p>
                <p className="text-gray-600">
                  回答時間: {formatTime(result.timeSpent)}
                </p>
              </div>
            </div>

            {/* 解説表示 */}
            <div className="space-y-6">
              {exam.questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    {question.title}
                  </h2>
                  <div className="space-y-4">
                    {question.subQuestions.map((subQ) => {
                      const userAnswer = answers[subQ.id];
                      let isCorrect = false;
                      let correctAnswer = '';

                      if (subQ.type === 'calculation') {
                        const correct = (subQ.answer as any).value;
                        const userValue = parseFloat(userAnswer);
                        isCorrect = userValue === correct;
                        correctAnswer = correct.toLocaleString();
                      }

                      return (
                        <div
                          key={subQ.id}
                          className={`p-4 rounded-lg ${
                            isCorrect ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          <p className="font-semibold mb-2">{subQ.question}</p>
                          <div className="space-y-1 text-sm">
                            <p>
                              あなたの回答:{' '}
                              <span className="font-mono">
                                {userAnswer || '未回答'}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p>
                                正解: <span className="font-mono">{correctAnswer}</span>
                              </p>
                            )}
                            <p className="text-gray-700 mt-2">
                              <strong>解説:</strong> {subQ.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => router.push('/exams')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                試験一覧に戻る
              </button>
              <button
                onClick={() => router.push('/history')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                履歴を見る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* タイマー */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6 sticky top-4 z-10">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800">{exam.title}</h1>
              <div className="flex items-center gap-4">
                <div
                  className={`text-2xl font-mono font-bold ${
                    timeLeft < 600 ? 'text-red-600' : 'text-gray-800'
                  }`}
                >
                  ⏱️ {formatTime(timeLeft)}
                </div>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  回答完了
                </button>
              </div>
            </div>
          </div>

          {/* 問題表示 */}
          <div className="space-y-8">
            {exam.questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {question.title}
                  </h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {question.category}
                  </span>
                </div>
                <p className="text-gray-700 mb-6 whitespace-pre-line">
                  {question.scenario}
                </p>

                <div className="space-y-6">
                  {question.subQuestions.map((subQ) => (
                    <div
                      key={subQ.id}
                      className="border-t pt-4"
                    >
                      <p className="font-semibold mb-3 text-gray-800">
                        {subQ.question}
                      </p>
                      {subQ.type === 'calculation' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={answers[subQ.id] || ''}
                            onChange={(e) =>
                              handleAnswerChange(subQ.id, e.target.value)
                            }
                            className="border border-gray-300 rounded px-4 py-2 w-48 text-right font-mono"
                            placeholder="数値を入力"
                          />
                          <span className="text-gray-600">円</span>
                        </div>
                      )}
                      {subQ.type === 'journal' && (
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-sm text-gray-600">
                            ※ 仕訳問題は現在開発中です
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
