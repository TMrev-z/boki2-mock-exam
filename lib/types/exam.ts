// 勘定科目の型
export type AccountTitle = string;

// 借方・貸方のエントリー
export interface JournalEntry {
  account: AccountTitle;
  amount: number;
}

// 仕訳問題の回答
export interface JournalAnswer {
  debit: JournalEntry[];
  credit: JournalEntry[];
}

// 計算問題の回答（数値）
export interface CalculationAnswer {
  value: number;
}

// 表形式問題の回答（勘定科目と金額のマップ）
export interface TableAnswer {
  items: Record<string, number>; // { "現金": 100000, "売掛金": 200000, ... }
}

// 問題の種類
export type QuestionType = 'journal' | 'calculation' | 'table';

// サブ問題（小問）
export interface SubQuestion {
  id: string;
  question: string;
  type: 'journal' | 'calculation' | 'table';
  answer: JournalAnswer | CalculationAnswer | TableAnswer;
  explanation: string;
  points: number;
  // 表形式問題用の設定
  tableConfig?: {
    type: 'balance-sheet' | 'income-statement' | 'worksheet' | 'cost-statement';
    items: string[]; // 入力が必要な項目のリスト
  };
}

// 大問
export interface Question {
  id: number;
  category: '商業簿記' | '工業簿記';
  title: string;
  scenario: string; // 問題文・状況説明
  subQuestions: SubQuestion[];
  totalPoints: number;
}

// 試験全体
export interface Exam {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // 分
}

// ユーザーの回答
export interface UserAnswer {
  questionId: number;
  subQuestionId: string;
  answer: JournalAnswer | CalculationAnswer | TableAnswer;
}

// 試験結果
export interface ExamResult {
  examId: number;
  date: string;
  score: number;
  answers: UserAnswer[];
  timeSpent: number; // 秒
}
