import { exam1 } from './exam1';
import { exam2 } from './exam2';
import { exam3 } from './exam3';
import { exam4 } from './exam4';
import { exam5 } from './exam5';
import { exam6 } from './exam6';
import { exam7 } from './exam7';
import { exam8 } from './exam8';
import { exam9 } from './exam9';
import { exam10 } from './exam10';
import { Exam } from '../types/exam';

// 全ての試験データ
export const exams: Exam[] = [
  exam1,
  exam2,
  exam3,
  exam4,
  exam5,
  exam6,
  exam7,
  exam8,
  exam9,
  exam10,
];

// IDで試験を取得
export function getExamById(id: number): Exam | undefined {
  return exams.find((exam) => exam.id === id);
}
