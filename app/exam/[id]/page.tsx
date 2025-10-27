'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getExamById } from '@/lib/data/exams';
import { Exam, UserAnswer, ExamResult, TableAnswer } from '@/lib/types/exam';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.id as string);

  const [exam, setExam] = useState<Exam | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0); // 秒
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
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

  const handleTableAnswerChange = (subQuestionId: string, itemKey: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [subQuestionId]: {
        ...(prev[subQuestionId] || {}),
        [itemKey]: value,
      },
    }));
  };

  const handleJournalEntryChange = (
    subQuestionId: string,
    side: 'debit' | 'credit',
    index: number,
    field: 'account' | 'amount',
    value: string
  ) => {
    setAnswers((prev) => {
      const current = prev[subQuestionId] || { debit: [], credit: [] };
      const entries = [...(current[side] || [])];

      if (!entries[index]) {
        entries[index] = { account: '', amount: '' };
      }

      entries[index] = {
        ...entries[index],
        [field]: value,
      };

      return {
        ...prev,
        [subQuestionId]: {
          ...current,
          [side]: entries,
        },
      };
    });
  };

  const handleSubmit = () => {
    if (!exam) return;

    // 採点処理
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
        } else if (subQ.type === 'table') {
          const correctAnswer = (subQ.answer as TableAnswer).items;
          const userTableAnswer = userAnswer || {};

          // 各項目をチェック
          let correctItems = 0;
          let totalItems = Object.keys(correctAnswer).length;

          Object.keys(correctAnswer).forEach((key) => {
            const correctValue = correctAnswer[key];
            const userValue = parseFloat(userTableAnswer[key]);
            if (userValue === correctValue) {
              correctItems++;
            }
          });

          // 部分点を計算
          totalScore += Math.round((correctItems / totalItems) * subQ.points);
        } else if (subQ.type === 'journal') {
          const correctAnswer = (subQ.answer as any);
          const userJournalAnswer = userAnswer || { debit: [], credit: [] };

          let correctEntries = 0;
          let totalEntries = 0;

          // 借方のチェック
          if (correctAnswer.debit) {
            totalEntries += correctAnswer.debit.length;
            correctAnswer.debit.forEach((correctEntry: any) => {
              const match = userJournalAnswer.debit?.find(
                (userEntry: any) =>
                  userEntry.account === correctEntry.account &&
                  parseFloat(userEntry.amount) === correctEntry.amount
              );
              if (match) correctEntries++;
            });
          }

          // 貸方のチェック
          if (correctAnswer.credit) {
            totalEntries += correctAnswer.credit.length;
            correctAnswer.credit.forEach((correctEntry: any) => {
              const match = userJournalAnswer.credit?.find(
                (userEntry: any) =>
                  userEntry.account === correctEntry.account &&
                  parseFloat(userEntry.amount) === correctEntry.amount
              );
              if (match) correctEntries++;
            });
          }

          // 部分点を計算
          if (totalEntries > 0) {
            totalScore += Math.round((correctEntries / totalEntries) * subQ.points);
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
                      let detailedResult = null;

                      if (subQ.type === 'calculation') {
                        const correct = (subQ.answer as any).value;
                        const userValue = parseFloat(userAnswer);
                        isCorrect = userValue === correct;
                        correctAnswer = correct.toLocaleString();
                      } else if (subQ.type === 'table') {
                        const correctTableAnswer = (subQ.answer as TableAnswer).items;
                        const userTableAnswer = userAnswer || {};

                        let allCorrect = true;
                        const itemResults: any[] = [];

                        Object.keys(correctTableAnswer).forEach((key) => {
                          const correctValue = correctTableAnswer[key];
                          const userValue = parseFloat(userTableAnswer[key]);
                          const itemCorrect = userValue === correctValue;

                          if (!itemCorrect) allCorrect = false;

                          itemResults.push({
                            key,
                            correct: correctValue,
                            user: userTableAnswer[key] || '未回答',
                            isCorrect: itemCorrect,
                          });
                        });

                        isCorrect = allCorrect;
                        detailedResult = itemResults;
                      } else if (subQ.type === 'journal') {
                        const correctJournalAnswer = (subQ.answer as any);
                        const userJournalAnswer = userAnswer || { debit: [], credit: [] };

                        let allCorrect = true;
                        const debitResults: any[] = [];
                        const creditResults: any[] = [];

                        // 借方のチェック
                        if (correctJournalAnswer.debit) {
                          correctJournalAnswer.debit.forEach((correctEntry: any, idx: number) => {
                            const userEntry = userJournalAnswer.debit?.[idx] || {
                              account: '',
                              amount: '',
                            };
                            const accountCorrect = userEntry.account === correctEntry.account;
                            const amountCorrect =
                              parseFloat(userEntry.amount) === correctEntry.amount;
                            const itemCorrect = accountCorrect && amountCorrect;

                            if (!itemCorrect) allCorrect = false;

                            debitResults.push({
                              correctAccount: correctEntry.account,
                              correctAmount: correctEntry.amount,
                              userAccount: userEntry.account || '未回答',
                              userAmount: userEntry.amount || '未回答',
                              isCorrect: itemCorrect,
                            });
                          });
                        }

                        // 貸方のチェック
                        if (correctJournalAnswer.credit) {
                          correctJournalAnswer.credit.forEach((correctEntry: any, idx: number) => {
                            const userEntry = userJournalAnswer.credit?.[idx] || {
                              account: '',
                              amount: '',
                            };
                            const accountCorrect = userEntry.account === correctEntry.account;
                            const amountCorrect =
                              parseFloat(userEntry.amount) === correctEntry.amount;
                            const itemCorrect = accountCorrect && amountCorrect;

                            if (!itemCorrect) allCorrect = false;

                            creditResults.push({
                              correctAccount: correctEntry.account,
                              correctAmount: correctEntry.amount,
                              userAccount: userEntry.account || '未回答',
                              userAmount: userEntry.amount || '未回答',
                              isCorrect: itemCorrect,
                            });
                          });
                        }

                        isCorrect = allCorrect;
                        detailedResult = { debit: debitResults, credit: creditResults };
                      }

                      return (
                        <div
                          key={subQ.id}
                          className={`p-4 rounded-lg ${
                            isCorrect ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          <p className="font-semibold mb-2">{subQ.question}</p>

                          {subQ.type === 'calculation' && (
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
                            </div>
                          )}

                          {subQ.type === 'table' && detailedResult && (
                            <div className="mt-3">
                              {subQ.tableConfig?.sections ? (
                                <div className="grid grid-cols-2 gap-4">
                                  {subQ.tableConfig.sections.left && (
                                    <div className="border">
                                      <div className="bg-gray-700 text-white px-4 py-2 font-semibold text-center">
                                        {subQ.tableConfig.sections.left.title}
                                      </div>
                                      <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="border px-2 py-1 text-left">項目</th>
                                            <th className="border px-2 py-1">回答</th>
                                            <th className="border px-2 py-1">正解</th>
                                            <th className="border px-2 py-1">判定</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detailedResult
                                            .filter((item: any) =>
                                              subQ.tableConfig?.sections?.left?.items.includes(item.key)
                                            )
                                            .map((item: any, idx: number) => (
                                              <tr
                                                key={idx}
                                                className={item.isCorrect ? 'bg-green-50' : 'bg-red-50'}
                                              >
                                                <td className="border px-2 py-1 text-left">{item.key}</td>
                                                <td className="border px-2 py-1 text-right font-mono text-xs">
                                                  {item.user}
                                                </td>
                                                <td className="border px-2 py-1 text-right font-mono text-xs">
                                                  {item.correct.toLocaleString()}
                                                </td>
                                                <td className="border px-2 py-1 text-center">
                                                  {item.isCorrect ? '✓' : '✗'}
                                                </td>
                                              </tr>
                                            ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                  {subQ.tableConfig.sections.right && (
                                    <div className="border">
                                      <div className="bg-gray-700 text-white px-4 py-2 font-semibold text-center">
                                        {subQ.tableConfig.sections.right.title}
                                      </div>
                                      <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="border px-2 py-1 text-left">項目</th>
                                            <th className="border px-2 py-1">回答</th>
                                            <th className="border px-2 py-1">正解</th>
                                            <th className="border px-2 py-1">判定</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detailedResult
                                            .filter((item: any) =>
                                              subQ.tableConfig?.sections?.right?.items.includes(item.key)
                                            )
                                            .map((item: any, idx: number) => (
                                              <tr
                                                key={idx}
                                                className={item.isCorrect ? 'bg-green-50' : 'bg-red-50'}
                                              >
                                                <td className="border px-2 py-1 text-left">{item.key}</td>
                                                <td className="border px-2 py-1 text-right font-mono text-xs">
                                                  {item.user}
                                                </td>
                                                <td className="border px-2 py-1 text-right font-mono text-xs">
                                                  {item.correct.toLocaleString()}
                                                </td>
                                                <td className="border px-2 py-1 text-center">
                                                  {item.isCorrect ? '✓' : '✗'}
                                                </td>
                                              </tr>
                                            ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm border">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="border px-4 py-2">項目</th>
                                        <th className="border px-4 py-2">あなたの回答</th>
                                        <th className="border px-4 py-2">正解</th>
                                        <th className="border px-4 py-2">判定</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detailedResult.map((item: any, idx: number) => (
                                        <tr key={idx} className={item.isCorrect ? 'bg-green-50' : 'bg-red-50'}>
                                          <td className="border px-4 py-2">{item.key}</td>
                                          <td className="border px-4 py-2 text-right font-mono">{item.user}</td>
                                          <td className="border px-4 py-2 text-right font-mono">
                                            {item.correct.toLocaleString()}
                                          </td>
                                          <td className="border px-4 py-2 text-center">
                                            {item.isCorrect ? '✓' : '✗'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          {subQ.type === 'journal' && detailedResult && (
                            <div className="mt-3">
                              <div className="grid grid-cols-2 gap-4">
                                {/* 借方 */}
                                <div className="border">
                                  <div className="bg-gray-700 text-white px-4 py-2 font-semibold text-center">
                                    借方
                                  </div>
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="border px-2 py-1">科目</th>
                                        <th className="border px-2 py-1">回答</th>
                                        <th className="border px-2 py-1">正解</th>
                                        <th className="border px-2 py-1">金額</th>
                                        <th className="border px-2 py-1">正解</th>
                                        <th className="border px-2 py-1">判定</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(detailedResult as any).debit.map((item: any, idx: number) => (
                                        <tr
                                          key={idx}
                                          className={item.isCorrect ? 'bg-green-50' : 'bg-red-50'}
                                        >
                                          <td className="border px-2 py-1">借方</td>
                                          <td className="border px-2 py-1 text-sm">
                                            {item.userAccount}
                                          </td>
                                          <td className="border px-2 py-1 text-sm">
                                            {item.correctAccount}
                                          </td>
                                          <td className="border px-2 py-1 text-right font-mono text-xs">
                                            {item.userAmount}
                                          </td>
                                          <td className="border px-2 py-1 text-right font-mono text-xs">
                                            {item.correctAmount.toLocaleString()}
                                          </td>
                                          <td className="border px-2 py-1 text-center">
                                            {item.isCorrect ? '✓' : '✗'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* 貸方 */}
                                <div className="border">
                                  <div className="bg-gray-700 text-white px-4 py-2 font-semibold text-center">
                                    貸方
                                  </div>
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="border px-2 py-1">科目</th>
                                        <th className="border px-2 py-1">回答</th>
                                        <th className="border px-2 py-1">正解</th>
                                        <th className="border px-2 py-1">金額</th>
                                        <th className="border px-2 py-1">正解</th>
                                        <th className="border px-2 py-1">判定</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(detailedResult as any).credit.map((item: any, idx: number) => (
                                        <tr
                                          key={idx}
                                          className={item.isCorrect ? 'bg-green-50' : 'bg-red-50'}
                                        >
                                          <td className="border px-2 py-1">貸方</td>
                                          <td className="border px-2 py-1 text-sm">
                                            {item.userAccount}
                                          </td>
                                          <td className="border px-2 py-1 text-sm">
                                            {item.correctAccount}
                                          </td>
                                          <td className="border px-2 py-1 text-right font-mono text-xs">
                                            {item.userAmount}
                                          </td>
                                          <td className="border px-2 py-1 text-right font-mono text-xs">
                                            {item.correctAmount.toLocaleString()}
                                          </td>
                                          <td className="border px-2 py-1 text-center">
                                            {item.isCorrect ? '✓' : '✗'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}

                          <p className="text-gray-700 mt-3">
                            <strong>解説:</strong> {subQ.explanation}
                          </p>
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

                      {subQ.type === 'table' && subQ.tableConfig && (
                        <div className="mt-4">
                          {/* 貸借対照表の左右分割表示 */}
                          {subQ.tableConfig.sections ? (
                            <div className="grid grid-cols-2 gap-4">
                              {/* 左側（資産の部） */}
                              {subQ.tableConfig.sections.left && (
                                <div className="border">
                                  <div className="bg-gray-700 text-white px-4 py-2 font-semibold text-center">
                                    {subQ.tableConfig.sections.left.title}
                                  </div>
                                  <table className="w-full">
                                    <tbody>
                                      {subQ.tableConfig.sections.left.items.map((item) => (
                                        <tr key={item} className="border-b">
                                          <td className="px-4 py-2 text-left">{item}</td>
                                          <td className="px-2 py-2 w-40">
                                            <input
                                              type="number"
                                              value={answers[subQ.id]?.[item] || ''}
                                              onChange={(e) =>
                                                handleTableAnswerChange(subQ.id, item, e.target.value)
                                              }
                                              className="w-full border border-gray-300 px-2 py-1 text-right font-mono text-sm"
                                              placeholder=""
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* 右側（負債・純資産の部） */}
                              {subQ.tableConfig.sections.right && (
                                <div className="border">
                                  <div className="bg-gray-700 text-white px-4 py-2 font-semibold text-center">
                                    {subQ.tableConfig.sections.right.title}
                                  </div>
                                  <table className="w-full">
                                    <tbody>
                                      {subQ.tableConfig.sections.right.items.map((item) => (
                                        <tr key={item} className="border-b">
                                          <td className="px-4 py-2 text-left">{item}</td>
                                          <td className="px-2 py-2 w-40">
                                            <input
                                              type="number"
                                              value={answers[subQ.id]?.[item] || ''}
                                              onChange={(e) =>
                                                handleTableAnswerChange(subQ.id, item, e.target.value)
                                              }
                                              className="w-full border border-gray-300 px-2 py-1 text-right font-mono text-sm"
                                              placeholder=""
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* 通常の表形式表示 */
                            <div className="overflow-x-auto border">
                              <table className="w-full">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="border px-4 py-2 text-left">項目</th>
                                    <th className="border px-4 py-2 text-right w-48">金額（円）</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subQ.tableConfig.items.map((item) => (
                                    <tr key={item} className="border-b">
                                      <td className="border px-4 py-2">{item}</td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="number"
                                          value={answers[subQ.id]?.[item] || ''}
                                          onChange={(e) =>
                                            handleTableAnswerChange(subQ.id, item, e.target.value)
                                          }
                                          className="w-full border-gray-300 px-2 py-1 text-right font-mono text-sm"
                                          placeholder="0"
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {subQ.type === 'journal' && (
                        <div className="mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            {/* 借方 */}
                            <div className="border">
                              <div className="bg-gray-700 text-white px-4 py-2 font-semibold text-center">
                                借方
                              </div>
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="border px-2 py-1">勘定科目</th>
                                    <th className="border px-2 py-1 w-32">金額</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[0, 1, 2].map((index) => (
                                    <tr key={index} className="border-b">
                                      <td className="border px-2 py-1">
                                        <input
                                          type="text"
                                          value={
                                            answers[subQ.id]?.debit?.[index]?.account || ''
                                          }
                                          onChange={(e) =>
                                            handleJournalEntryChange(
                                              subQ.id,
                                              'debit',
                                              index,
                                              'account',
                                              e.target.value
                                            )
                                          }
                                          className="w-full border-gray-300 px-2 py-1 text-sm"
                                          placeholder="勘定科目"
                                        />
                                      </td>
                                      <td className="border px-2 py-1">
                                        <input
                                          type="number"
                                          value={
                                            answers[subQ.id]?.debit?.[index]?.amount || ''
                                          }
                                          onChange={(e) =>
                                            handleJournalEntryChange(
                                              subQ.id,
                                              'debit',
                                              index,
                                              'amount',
                                              e.target.value
                                            )
                                          }
                                          className="w-full border-gray-300 px-2 py-1 text-right font-mono text-sm"
                                          placeholder="0"
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* 貸方 */}
                            <div className="border">
                              <div className="bg-gray-700 text-white px-4 py-2 font-semibold text-center">
                                貸方
                              </div>
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="border px-2 py-1">勘定科目</th>
                                    <th className="border px-2 py-1 w-32">金額</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[0, 1, 2].map((index) => (
                                    <tr key={index} className="border-b">
                                      <td className="border px-2 py-1">
                                        <input
                                          type="text"
                                          value={
                                            answers[subQ.id]?.credit?.[index]?.account || ''
                                          }
                                          onChange={(e) =>
                                            handleJournalEntryChange(
                                              subQ.id,
                                              'credit',
                                              index,
                                              'account',
                                              e.target.value
                                            )
                                          }
                                          className="w-full border-gray-300 px-2 py-1 text-sm"
                                          placeholder="勘定科目"
                                        />
                                      </td>
                                      <td className="border px-2 py-1">
                                        <input
                                          type="number"
                                          value={
                                            answers[subQ.id]?.credit?.[index]?.amount || ''
                                          }
                                          onChange={(e) =>
                                            handleJournalEntryChange(
                                              subQ.id,
                                              'credit',
                                              index,
                                              'amount',
                                              e.target.value
                                            )
                                          }
                                          className="w-full border-gray-300 px-2 py-1 text-right font-mono text-sm"
                                          placeholder="0"
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
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
