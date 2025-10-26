import { exam1 } from './exam1';
import { Exam } from '../types/exam';

// 全ての試験データ
export const exams: Exam[] = [exam1];

// IDで試験を取得
export function getExamById(id: number): Exam | undefined {
  return exams.find((exam) => exam.id === id);
}
