import { Student, MarkEntry, AttendanceEntry } from '../types';

// Utility for simulated network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// LocalStorage helpers
const getStorage = <T,>(key: string, defaultVal: T): T => {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : defaultVal;
};
const setStorage = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Keys
const KEYS = {
  STUDENTS: 'school_students',
  MARKS: 'school_marks',
  ATTENDANCE: 'school_attendance'
};

// Initial data for an empty state
const initStudents = () => {
    const existing = localStorage.getItem(KEYS.STUDENTS);
    if (!existing) {
        setStorage(KEYS.STUDENTS, [
            { id: '1', name: 'Aarav Kumar', standard: '10' },
            { id: '2', name: 'Lakshmi Nair', standard: '10' },
        ]);
    }
}
initStudents();

export const api = {
  authTeacher: async (code: string) => {
    await delay(300);
    if (code === 'Renju') return { success: true };
    return { success: false, message: 'Invalid teacher code' };
  },

  authStudent: async (name: string, standard: string) => {
    await delay(300);
    const students = getStorage<Student[]>(KEYS.STUDENTS, []);
    const student = students.find((s) => s.name.toLowerCase() === name.toLowerCase().trim() && s.standard === standard.trim());
    if (student) return { success: true, student };
    return { success: false, message: 'Student not found in records' };
  },

  getStudents: async () => {
    await delay(200);
    return getStorage<Student[]>(KEYS.STUDENTS, []);
  },

  addStudent: async (name: string, standard: string) => {
    await delay(200);
    if (!name.trim()) throw new Error('Name is required');
    if (!standard.trim()) throw new Error('Standard is required');
    const students = getStorage<Student[]>(KEYS.STUDENTS, []);
    const newStudent: Student = { id: crypto.randomUUID(), name: name.trim(), standard: standard.trim() };
    students.push(newStudent);
    setStorage(KEYS.STUDENTS, students);
    return newStudent;
  },

  deleteStudent: async (id: string) => {
    await delay(200);
    const students = getStorage<Student[]>(KEYS.STUDENTS, []).filter(s => s.id !== id);
    setStorage(KEYS.STUDENTS, students);
    
    // Cascade deletes
    const marks = getStorage<MarkEntry[]>(KEYS.MARKS, []).filter(m => m.studentId !== id);
    setStorage(KEYS.MARKS, marks);
    
    const attendance = getStorage<AttendanceEntry[]>(KEYS.ATTENDANCE, []).filter(a => a.studentId !== id);
    setStorage(KEYS.ATTENDANCE, attendance);
    
    return { success: true };
  },

  getMarks: async (studentId?: string) => {
    await delay(200);
    let marks = getStorage<MarkEntry[]>(KEYS.MARKS, []);
    if (studentId) {
      marks = marks.filter(m => m.studentId === studentId);
    }
    return marks;
  },

  saveMark: async (studentId: string, examName: string, subject: string, mark: number, maxMark: number) => {
    await delay(200);
    const marks = getStorage<MarkEntry[]>(KEYS.MARKS, []);
    const existingIndex = marks.findIndex(
      m => m.studentId === studentId && m.examName === examName && m.subject === subject
    );

    if (existingIndex >= 0) {
      marks[existingIndex].mark = mark;
      marks[existingIndex].maxMark = maxMark;
      setStorage(KEYS.MARKS, marks);
      return marks[existingIndex];
    } else {
      const newMark: MarkEntry = {
        id: crypto.randomUUID(),
        studentId, examName, subject, mark, maxMark
      };
      marks.push(newMark);
      setStorage(KEYS.MARKS, marks);
      return newMark;
    }
  },

  getAttendance: async (params?: { studentId?: string; month?: string }) => {
    await delay(200);
    let attendance = getStorage<AttendanceEntry[]>(KEYS.ATTENDANCE, []);
    if (params?.studentId) {
      attendance = attendance.filter(a => a.studentId === params.studentId);
    }
    if (params?.month) {
      attendance = attendance.filter(a => a.date.startsWith(params.month!));
    }
    return attendance;
  },

  saveAttendance: async (studentId: string, date: string, status: 'present'|'absent') => {
    await delay(200);
    const attendance = getStorage<AttendanceEntry[]>(KEYS.ATTENDANCE, []);
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === date);

    if (existingIndex >= 0) {
      attendance[existingIndex].status = status;
      setStorage(KEYS.ATTENDANCE, attendance);
      return attendance[existingIndex];
    } else {
      const newEntry: AttendanceEntry = {
        id: crypto.randomUUID(),
        date, studentId, status
      };
      attendance.push(newEntry);
      setStorage(KEYS.ATTENDANCE, attendance);
      return newEntry;
    }
  }
};
