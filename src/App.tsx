import { useState, useEffect, useCallback } from 'react';
import { Timer } from './components/Timer';
import { QuestionNav } from './components/QuestionNav';
import { DataTable, type Column, type Row } from './components/DataTable';

interface ProblemSet {
  title: string;
  durationSec: number;
  questions: Question[];
}

interface Question {
  type: 'BS_FILL' | 'JOB_COSTING';
  id: string;
  title: string;
  rows?: QuestionRow[];
  asks?: QuestionAsk[];
  givens: Record<string, number>;
  rubric: { method: string; calc?: string };
}

interface QuestionRow {
  section: string;
  key: string;
  input: boolean;
  points: number;
}

interface QuestionAsk {
  key: string;
  label: string;
  points: number;
}

function App() {
  const [problemSet, setProblemSet] = useState<ProblemSet | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // 問題データの読み込み
  useEffect(() => {
    fetch('/problems/sample.json')
      .then((res) => res.json())
      .then((data: ProblemSet) => {
        setProblemSet(data);
        if (data.questions.length > 0) {
          setCurrentQuestionId(data.questions[0].id);
        }
      })
      .catch((err) => console.error('問題データの読み込みに失敗しました:', err));
  }, []);

  // LocalStorageから復元
  useEffect(() => {
    const saved = localStorage.getItem('boki2-answers');
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (e) {
        console.error('回答データの復元に失敗しました:', e);
      }
    }
  }, []);

  // 5秒間隔で自動保存
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('boki2-answers', JSON.stringify(answers));
    }, 5000);

    return () => clearInterval(timer);
  }, [answers]);

  const handleValueChange = useCallback((questionId: string, key: string, value: number | null) => {
    setAnswers((prev) => ({
      ...prev,
      [`${questionId}-${key}`]: value,
    }));
  }, []);

  const handleSubmit = () => {
    if (confirm('答案を提出しますか？')) {
      setIsSubmitted(true);
      localStorage.setItem('boki2-submitted', 'true');
    }
  };

  const handleTimeUp = () => {
    setIsTimeUp(true);
    setIsSubmitted(true);
  };

  if (!problemSet) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[var(--bk-text-muted)]">問題データを読み込み中...</p>
      </div>
    );
  }

  const currentQuestion = problemSet.questions.find((q) => q.id === currentQuestionId);

  // 各問題の回答状態を計算
  const questionsWithStatus = problemSet.questions.map((q) => {
    const keys = q.type === 'BS_FILL'
      ? q.rows?.filter(r => r.input).map(r => r.key) || []
      : q.asks?.map(a => a.key) || [];

    const answeredCount = keys.filter((k) => answers[`${q.id}-${k}`] != null).length;
    const totalCount = keys.length;

    let status: 'unanswered' | 'partial' | 'completed' = 'unanswered';
    if (answeredCount === totalCount && totalCount > 0) {
      status = 'completed';
    } else if (answeredCount > 0) {
      status = 'partial';
    }

    return {
      id: q.id,
      title: q.title.split('').slice(0, 5).join(''), // "第1問" など簡略化
      status,
    };
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[var(--bk-border)] px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--bk-text)]">
          {problemSet.title}
        </h1>
        <Timer totalSec={problemSet.durationSec} onTimeUp={handleTimeUp} />
      </header>

      {/* QuestionNav */}
      <QuestionNav
        questions={questionsWithStatus}
        currentQuestionId={currentQuestionId}
        onQuestionSelect={setCurrentQuestionId}
        onSubmit={handleSubmit}
      />

      {/* Main Content */}
      <main className="flex-1 bg-[var(--bk-surface)] p-6">
        {isSubmitted && (
          <div className="mb-4 p-4 bg-[var(--bk-accent-weak)] border border-[var(--bk-accent)] rounded-md">
            <p className="font-semibold text-[var(--bk-accent)]">
              {isTimeUp ? '時間切れです。答案は自動提出されました。' : '答案を提出しました。'}
            </p>
          </div>
        )}

        {currentQuestion && (
          <div className="bg-white rounded-lg border border-[var(--bk-border)] p-6">
            <h2 className="text-lg font-semibold mb-4 text-[var(--bk-text)]">
              {currentQuestion.title}
            </h2>

            {currentQuestion.type === 'BS_FILL' && currentQuestion.rows && (
              <BSFillQuestion
                question={currentQuestion}
                answers={answers}
                onValueChange={handleValueChange}
                disabled={isSubmitted}
              />
            )}

            {currentQuestion.type === 'JOB_COSTING' && currentQuestion.asks && (
              <JobCostingQuestion
                question={currentQuestion}
                answers={answers}
                onValueChange={handleValueChange}
                disabled={isSubmitted}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// 貸借対照表問題コンポーネント
function BSFillQuestion({
  question,
  answers,
  onValueChange,
  disabled,
}: {
  question: Question;
  answers: Record<string, number | null>;
  onValueChange: (questionId: string, key: string, value: number | null) => void;
  disabled: boolean;
}) {
  const columns: Column[] = [
    { key: 'section', header: '項目', align: 'left', width: '60%' },
    { key: 'amount', header: '金額', align: 'right', width: '40%', input: true },
  ];

  const rows: Row[] = question.rows!.map((row) => ({
    section: row.section,
    amount: row.input ? null : question.givens[row.key],
    _isHeader: false,
  }));

  const values: Record<string, number | null> = {};
  question.rows!.forEach((row, idx) => {
    if (row.input) {
      const key = `${idx}-amount`;
      values[key] = answers[`${question.id}-${row.key}`] ?? null;
    }
  });

  const handleChange = (rowIndex: number, _columnKey: string, value: number | null) => {
    const row = question.rows![rowIndex];
    if (row.input && !disabled) {
      onValueChange(question.id, row.key, value);
    }
  };

  return <DataTable columns={columns} rows={rows} values={values} onValueChange={handleChange} />;
}

// 個別原価計算問題コンポーネント
function JobCostingQuestion({
  question,
  answers,
  onValueChange,
  disabled,
}: {
  question: Question;
  answers: Record<string, number | null>;
  onValueChange: (questionId: string, key: string, value: number | null) => void;
  disabled: boolean;
}) {
  const columns: Column[] = [
    { key: 'label', header: '項目', align: 'left', width: '60%' },
    { key: 'amount', header: '金額', align: 'right', width: '40%', input: true },
  ];

  const rows: Row[] = [
    // 与えられた値を表示
    ...Object.entries(question.givens).map(([key, value]) => ({
      label: key === 'dm' ? '直接材料費' : key === 'dl' ? '直接労務費' : key === 'oh_rate' ? '配賦率' : key,
      amount: value,
      _isHeader: false,
    })),
    // 空行
    { label: '', amount: null, _isHeader: true },
    // 回答欄
    ...question.asks!.map((ask) => ({
      label: ask.label,
      amount: null,
      _isHeader: false,
    })),
  ];

  const values: Record<string, number | null> = {};
  const givenCount = Object.keys(question.givens).length;
  question.asks!.forEach((ask, idx) => {
    const rowIndex = givenCount + 1 + idx; // 与えられた値 + 空行 + 回答行
    const key = `${rowIndex}-amount`;
    values[key] = answers[`${question.id}-${ask.key}`] ?? null;
  });

  const handleChange = (rowIndex: number, _columnKey: string, value: number | null) => {
    const givenCount = Object.keys(question.givens).length;
    const askIndex = rowIndex - givenCount - 1;
    if (askIndex >= 0 && askIndex < question.asks!.length && !disabled) {
      const ask = question.asks![askIndex];
      onValueChange(question.id, ask.key, value);
    }
  };

  return <DataTable columns={columns} rows={rows} values={values} onValueChange={handleChange} />;
}

export default App;
