export interface Student {
  id: string;
  name: string;
}

export type Subject = 'Malayalam' | 'English' | 'Hindi' | 'Mathematics' | 'Basic Science' | 'Social Science';

export type ExamType = 'Term 1' | 'Term 2' | 'Annual Exam';

export interface MarkEntry {
  id: string;
  studentId: string;
  examName: ExamType;
  subject: Subject;
  mark: number;
  maxMark: number;
}

export interface AttendanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: 'present' | 'absent';
}

export interface TeacherSession {
  loggedIn: boolean;
}

export interface StudentSession {
  loggedIn: boolean;
  student: Student | null;
}
