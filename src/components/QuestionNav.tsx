interface Question {
  id: string;
  title: string;
  status?: 'unanswered' | 'partial' | 'completed';
}

interface QuestionNavProps {
  questions: Question[];
  currentQuestionId: string;
  onQuestionSelect: (id: string) => void;
  onSubmit: () => void;
}

export function QuestionNav({
  questions,
  currentQuestionId,
  onQuestionSelect,
  onSubmit,
}: QuestionNavProps) {
  const getStatusColor = (status?: string) => {
    if (status === 'completed') return 'bg-[var(--bk-success)]';
    if (status === 'partial') return 'bg-[var(--bk-warn)]';
    return 'bg-[var(--bk-border)]';
  };

  return (
    <nav className="px-6 py-3 border-b border-[var(--bk-border)] flex items-center gap-2 text-sm bg-white">
      {questions.map((q) => (
        <button
          key={q.id}
          onClick={() => onQuestionSelect(q.id)}
          className={`px-3 py-2 rounded-md border transition-colors flex items-center gap-2 ${
            currentQuestionId === q.id
              ? 'bg-[var(--bk-accent)] text-white border-[var(--bk-accent)]'
              : 'bg-[var(--bk-surface)] border-[var(--bk-border)] hover:border-[var(--bk-border-strong)]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${getStatusColor(q.status)}`} />
          {q.title}
        </button>
      ))}
      <div className="flex-grow" />
      <button
        onClick={onSubmit}
        className="px-5 py-2 bg-[var(--bk-accent)] text-white rounded-md font-semibold hover:opacity-90 transition-opacity"
      >
        答案を提出
      </button>
    </nav>
  );
}
